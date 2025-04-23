import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import Game from '../engine/Game';
import GameObject from '../engine/ecs/GameObject';
import Transform from '../engine/ecs/components/Transform';
import Physics from '../engine/ecs/components/Physics';
import Collider from '../engine/ecs/components/Collider';
import ProjectileSystem from '../engine/ecs/systems/ProjectileSystem';
import { generateRandomEdgePosition } from '../utils/gameUtils';
import { logWorldState, logEntityDetails } from '../debug';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  overflow: hidden;
`;

/**
 * EcsGame component that uses our custom ECS engine
 * This is a React wrapper around the canvas-based ECS game engine
 */
const EcsGame = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const zombiesRef = useRef([]);
  const rangedMinionsRef = useRef([]);
  const collisionGridRef = useRef({});

  // Add optimization settings at the top of the component
  const [optimizationSettings, setOptimizationSettings] = useState({
    maxProjectiles: 100,      // Maximum allowed player projectiles
    cullingDistance: 800,     // Distance at which to remove projectiles from player
    collisionGridSize: 200,   // Size of spatial grid cells for collision detection
    maxZombies: 40,          // Maximum zombies on screen at once
    maxMinions: 15,          // Maximum ranged minions on screen at once
    minEnemyDistance: 75,    // Minimum distance between spawned enemies
    projectileRange: 600,    // Maximum distance a projectile can travel before being removed
    enemyProjectileRange: 800 // Maximum distance an enemy projectile can travel
  });

  // Initialize the game when component mounts
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create and initialize the game
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new Game({
      canvas,
      width: canvas.width,
      height: canvas.height,
      debug: true
    });

    // Store the game reference
    gameRef.current = game;

    // Initialize systems
    game.init();
    
    // Add the ProjectileSystem to manage projectile lifetimes
    const projectileSystem = new ProjectileSystem({
      width: canvas.width,
      height: canvas.height
    });
    game.world.addSystem(projectileSystem);
    
    console.log('Game initialized with systems:');
    game.world.systems.forEach(system => {
      console.log(`- ${system.constructor.name}`);
    });

    // Register the main scene
    game.registerScene('main', (world, game) => {
      console.log('Creating main scene...');
      
      // Create the player
      const player = createPlayer(world, game);
      console.log('Player created:', player.id);
      logEntityDetails(player);

      // Create some initial enemies
      for (let i = 0; i < 5; i++) {
        const enemy = createZombie(world, game);
        console.log(`Enemy ${i} created:`, enemy.id);
      }

      // Create a score display
      const scoreText = GameObject.createText(world, {
        x: 100,
        y: 30,
        text: 'Score: 0',
        font: '16px Arial',
        fillStyle: '#ffffff',
        align: 'left',
        tag: 'scoreText'
      });
      console.log('Score text created:', scoreText.id);
      
      // Log world state after scene creation
      console.log('Scene created, logging world state:');
      logWorldState(world);
    });

    // Load the main scene and start the game
    console.log('Loading main scene...');
    game.loadScene('main');
    console.log('Starting game...');
    game.start();

    // Set up enemy spawn intervals
    setupEnemySpawns(game);

    // Set up window resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      game.resize(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    setIsReady(true);

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      game.stop();
      game.destroy();
    };
  }, []);

  // Optimization: Update collision grid
  const updateCollisionGrid = useCallback(() => {
    const grid = {};
    const cellSize = optimizationSettings.collisionGridSize;
    
    // Add zombies to grid
    zombiesRef.current.forEach(zombie => {
      if (!zombie) return;  // Skip if zombie is null or undefined
      
      const cellX = Math.floor(zombie.x / cellSize);
      const cellY = Math.floor(zombie.y / cellSize);
      const cellKey = `${cellX},${cellY}`;
      
      if (!grid[cellKey]) {
        grid[cellKey] = { zombies: [], minions: [] };
      }
      
      grid[cellKey].zombies.push(zombie);
    });
    
    // Add minions to grid
    rangedMinionsRef.current.forEach(minion => {
      if (!minion) return;  // Skip if minion is null or undefined
      
      const cellX = Math.floor(minion.x / cellSize);
      const cellY = Math.floor(minion.y / cellSize);
      const cellKey = `${cellX},${cellY}`;
      
      if (!grid[cellKey]) {
        grid[cellKey] = { zombies: [], minions: [] };
      }
      
      grid[cellKey].minions.push(minion);
    });
    
    collisionGridRef.current = grid;
  }, [optimizationSettings.collisionGridSize]);

  // Update the styled components to use $active instead of active
  const PowerUpItem = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
  `;

  const PowerUpIcon = styled.div`
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  `;

  const PowerUpTimer = styled.div`
    height: 3px;
    background-color: white;
    margin-top: 2px;
    width: ${props => props.$timeLeft}%;
    transition: width 0.1s linear;
  `;

  const RoundProgressFill = styled.div`
    height: 100%;
    background-color: #ff6b6b;
    width: ${props => props.$progress}%;
    transition: width 0.3s ease-out;
  `;

  const ShopItem = styled.div`
    background-color: rgba(40, 40, 40, 0.8);
    border: 1px solid ${props => props.$affordable ? '#5cb85c' : '#d9534f'};
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s, box-shadow 0.2s;
    
    ${props => props.$affordable && `
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(92, 184, 92, 0.3);
        cursor: pointer;
      }
    `}
  `;

  const ItemPrice = styled.div`
    display: flex;
    align-items: center;
    font-size: 16px;
    color: ${props => props.$affordable ? '#5cb85c' : '#d9534f'};
  `;

  return (
    <Container>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </Container>
  );
};

/**
 * Create a player entity in the ECS world
 * @param {World} world - The ECS world
 * @param {Game} game - The game instance
 */
function createPlayer(world, game) {
  const x = game.width / 2;
  const y = game.height / 2;
  const radius = 30;

  const player = GameObject.createCircle(world, {
    x,
    y,
    radius,
    fillStyle: '#ff6b6b',
    physics: true,
    collider: true,
    tag: 'player'
  });

  // Get the physics component and set properties
  const physics = player.getComponent('Physics');
  physics.friction = 0.1;
  physics.mass = 1;

  // Set bounds to keep the player within the canvas
  physics.setBounds(
    radius,
    radius,
    game.width - radius,
    game.height - radius
  );

  // Create a custom PlayerController component
  player.addComponent('PlayerController', {
    speed: 5,
    fireRate: 500,
    lastShotTime: 0,
    projectileSpeed: 15,

    onAdd() {
      // Register the input system to handle player controls
      const inputSystem = world.systems.find(s => s.constructor.name === 'InputSystem');
      if (!inputSystem) return;

      // Setup mouse click for shooting
      inputSystem.onMouseButtonPressed(0, () => {
        this.shoot(inputSystem.getMousePosition());
      });
    },

    update(deltaTime) {
      const inputSystem = world.systems.find(s => s.constructor.name === 'InputSystem');
      if (!inputSystem) return;

      const transform = this.entity.getComponent('Transform');
      const physics = this.entity.getComponent('Physics');
      
      // Movement direction
      let dx = 0;
      let dy = 0;

      // WASD / Arrow keys movement
      if (inputSystem.isKeyPressed('a') || inputSystem.isKeyPressed('arrowleft')) dx -= 1;
      if (inputSystem.isKeyPressed('d') || inputSystem.isKeyPressed('arrowright')) dx += 1;
      if (inputSystem.isKeyPressed('w') || inputSystem.isKeyPressed('arrowup')) dy -= 1;
      if (inputSystem.isKeyPressed('s') || inputSystem.isKeyPressed('arrowdown')) dy += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      // Apply movement
      physics.setVelocity(dx * this.speed, dy * this.speed);

      // Auto-shoot with space key
      if (inputSystem.isKeyPressed(' ')) {
        const now = performance.now();
        if (now - this.lastShotTime >= this.fireRate) {
          this.shoot(inputSystem.getMousePosition());
          this.lastShotTime = now;
        }
      }
    },

    shoot(targetPos) {
      const transform = this.entity.getComponent('Transform');

      // Calculate direction to target
      const dx = targetPos.x - transform.x;
      const dy = targetPos.y - transform.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize direction
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // Create projectile
      const projectile = GameObject.createCircle(world, {
        x: transform.x,
        y: transform.y,
        radius: 5,
        fillStyle: '#ffffff',
        physics: true,
        collider: true,
        tag: 'projectile'
      });

      // Set projectile properties
      const projectilePhysics = projectile.getComponent('Physics');
      projectilePhysics.setVelocity(
        normalizedDx * this.projectileSpeed * 60, 
        normalizedDy * this.projectileSpeed * 60
      );
      projectilePhysics.friction = 0;

      // Add a component to track projectile lifetime
      projectile.addComponent('Lifetime', {
        maxDistance: 600, // Match the projectileRange in optimization settings
        originX: transform.x,
        originY: transform.y,
        distanceTraveled: 0,

        update(deltaTime) {
          const transform = this.entity.getComponent('Transform');
          const dx = transform.x - this.originX;
          const dy = transform.y - this.originY;
          this.distanceTraveled = Math.sqrt(dx * dx + dy * dy);

          // Note: The actual destruction is now handled by ProjectileSystem
          // This update method can be left empty or used for other logic
        }
      });

      // Add collision handling
      const collider = projectile.getComponent('Collider');
      collider.onCollisionStart = (other) => {
        if (other.hasTag('enemy')) {
          // Destroy the enemy
          other.destroy();
          
          // Destroy the projectile
          projectile.destroy();
          
          // Increment score
          const score = parseInt(world.getEntitiesByTag('scoreText').values().next().value.getText(), 10) + 10;
          world.getEntitiesByTag('scoreText').values().next().value.setText(`Score: ${score}`);
        }
      };
    }
  });

  return player;
}

/**
 * Create a zombie enemy in the ECS world
 * @param {World} world - The ECS world
 * @param {Game} game - The game instance
 */
function createZombie(world, game) {
  const size = 25;
  const position = generateRandomEdgePosition({ width: game.width, height: game.height }, size);

  const zombie = GameObject.createCircle(world, {
    x: position.x,
    y: position.y,
    radius: size / 2,
    fillStyle: '#2ecc71',
    physics: true,
    collider: true,
    tag: 'enemy'
  });

  // Add zombie behavior component
  zombie.addComponent('ZombieBehavior', {
    speed: 2,
    
    update(deltaTime) {
      // Find the player
      const player = world.getEntitiesByTag('player').values().next().value;
      if (!player) return;
      
      const playerTransform = player.getComponent('Transform');
      const zombieTransform = this.entity.getComponent('Transform');
      const physics = this.entity.getComponent('Physics');
      
      // Calculate direction to player
      const dx = playerTransform.x - zombieTransform.x;
      const dy = playerTransform.y - zombieTransform.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize direction and set velocity
      if (distance > 0) {
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        physics.setVelocity(
          normalizedDx * this.speed * 60,
          normalizedDy * this.speed * 60
        );
      }

      // Check collision with player
      const zombieCollider = this.entity.getComponent('Collider');
      const playerCollider = player.getComponent('Collider');
      
      if (zombieCollider && playerCollider) {
        const collisionSystem = world.systems.find(s => s.constructor.name === 'CollisionSystem');
        if (collisionSystem && collisionSystem.checkCollision(this.entity, player)) {
          // Game over
          game.setGameState('gameover');
        }
      }
    }
  });

  return zombie;
}

/**
 * Set up enemy spawning intervals
 * @param {Game} game - The game instance
 */
function setupEnemySpawns(game) {
  // Spawn a new zombie every 2 seconds
  const zombieInterval = setInterval(() => {
    if (game.gameState !== 'playing') return;
    
    createZombie(game.world, game);
  }, 2000);

  // Clean up intervals when game is destroyed
  game.onDestroy = () => {
    clearInterval(zombieInterval);
  };
}

export default EcsGame; 