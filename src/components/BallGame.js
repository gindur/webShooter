import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import Shop from './Shop';
import {
  calculateDirection,
  checkCollision,
  createProjectile as createProjectileUtil,
  calculateNewPosition,
  isWithinBounds,
  generateRandomEdgePosition,
  calculateDistance
} from '../utils/gameUtils';

const breathe = keyframes`
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.3) translate(0, 0); }
  100% { transform: scale(1) translate(0, 0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const Ball = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'game-ball'
}))`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ff6b6b, #ff8e8e);
  position: absolute;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: ${breathe} 4s ease-in-out infinite;
  z-index: 2;
`;

const Projectile = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'projectile'
}))`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #fff 0%, #ff6b6b 100%);
  position: absolute;
  box-shadow: 0 0 20px #fff, 0 0 40px #ff6b6b;
  z-index: 1;
`;

const Zombie = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'zombie'
}))`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: linear-gradient(145deg, #2ecc71, #27ae60);
  position: absolute;
  box-shadow: 0 0 15px #2ecc71;
  animation: ${pulse} 2s ease-in-out infinite;
  z-index: 1;
`;

const RangedMinion = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'ranged-minion'
}))`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: linear-gradient(145deg, #9b59b6, #8e44ad);
  position: absolute;
  box-shadow: 0 0 15px #9b59b6;
  animation: ${pulse} 2s ease-in-out infinite;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: white;
    transform: translate(-50%, -50%);
  }
`;

const EnemyProjectile = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'enemy-projectile'
}))`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #fff 0%, #9b59b6 100%);
  position: absolute;
  box-shadow: 0 0 10px #fff, 0 0 20px #9b59b6;
  z-index: 1;
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  overflow: hidden;
`;

const Arena = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid #333;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px #ff6b6b;
`;

const Subtitle = styled.p`
  font-size: 24px;
  margin-bottom: 40px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 18px;
  background: linear-gradient(145deg, #ff6b6b, #ff8e8e);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const ScoreDisplay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-size: 24px;
  font-family: Arial, sans-serif;
  z-index: 3;
`;

const CoinDisplay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 20px;
  font-family: Arial, sans-serif;
  display: flex;
  align-items: center;
  z-index: 3;
`;

const CoinIcon = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, #ffd700, #ffaa00);
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 5px #ffd700;
`;

const ShopHint = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: white;
  font-size: 16px;
  font-family: Arial, sans-serif;
  opacity: 0.7;
  z-index: 3;
`;

const DifficultyDisplay = styled.div`
  position: absolute;
  top: 50px;
  left: 20px;
  color: white;
  font-size: 18px;
  font-family: Arial, sans-serif;
  z-index: 3;
`;

const RoundDisplay = styled.div`
  position: absolute;
  top: 80px;
  left: 20px;
  color: white;
  font-size: 18px;
  font-family: Arial, sans-serif;
  z-index: 3;
`;

const RoundProgressBar = styled.div`
  position: absolute;
  top: 110px;
  left: 20px;
  width: 200px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
  z-index: 3;
`;

const RoundProgressFill = styled.div`
  height: 100%;
  background-color: #ff6b6b;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease-out;
`;

const RoundCompleteOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 100px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
  animation: ${fadeIn} 0.5s ease-in-out;
  overflow-y: auto;
`;

const RoundCompleteMessage = styled.h2`
  font-size: 36px;
  color: #ff6b6b;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
  animation: ${pulse} 1s infinite;
`;

const RoundCompleteDetails = styled.p`
  font-size: 24px;
  margin-bottom: 40px;
`;

const RoundContinueButton = styled.button`
  padding: 12px 24px;
  font-size: 18px;
  background: linear-gradient(145deg, #ff6b6b, #ff8e8e);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const DebugPanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 10px;
  color: white;
`;

const DebugButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  background: linear-gradient(145deg, #3498db, #2980b9);
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const PowerUp = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
    backgroundColor: props.$color
  },
  'data-testid': 'power-up'
}))`
  width: 20px;
  height: 20px;
  position: absolute;
  border-radius: 5px;
  box-shadow: 0 0 15px ${props => props.$color};
  animation: ${float} 2s ease-in-out infinite, ${rotate} 3s linear infinite;
  z-index: 1;
  
  &::after {
    content: '${props => props.$icon}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    color: white;
  }
`;

const ActivePowerUpIndicator = styled.div`
  position: absolute;
  top: 150px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 3;
`;

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

const BallGame = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });
  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 });
  const [projectiles, setProjectiles] = useState([]);
  const [zombies, setZombies] = useState([]);
  const [rangedMinions, setRangedMinions] = useState([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('pregame'); // 'pregame', 'playing', 'gameover'
  const [lastShotTime, setLastShotTime] = useState(0); // Track the last time a shot was fired
  const [coins, setCoins] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [round, setRound] = useState(1);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundShopOpen, setRoundShopOpen] = useState(true);
  const [debugPanelVisible, setDebugPanelVisible] = useState(true);
  const [basePlayerStats, setBasePlayerStats] = useState({
    speed: 5,
    projectileSpeed: 15,
    fireRate: 1000,
    damage: 1
  });
  const [playerStats, setPlayerStats] = useState(basePlayerStats);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [dropChance, setDropChance] = useState(20); // 20% default drop chance
  
  const ballSize = 30;
  const baseZombieSpeed = 2;
  const baseRangedMinionSpeed = 1.5;
  const enemyProjectileSpeed = 3.25; // 65% of 5 (reduced from 5)
  const shootIntervalRef = useRef(null);
  const zombieSpawnIntervalRef = useRef(null);
  const rangedMinionSpawnIntervalRef = useRef(null);
  const positionRef = useRef(position);
  const mousePosRef = useRef(mousePos);
  const projectilesRef = useRef(projectiles);
  const zombiesRef = useRef(zombies);
  const rangedMinionsRef = useRef(rangedMinions);
  const enemyProjectilesRef = useRef(enemyProjectiles);
  const arenaSizeRef = useRef(arenaSize);
  const lastUpdateRef = useRef(0);
  const FRAME_RATE = 1000 / 60; // 60 FPS
  const playerStatsRef = useRef(playerStats);
  const scoreRef = useRef(score);
  const roundRef = useRef(round);
  const roundCompleteRef = useRef(roundComplete);
  const activePowerUpsRef = useRef(activePowerUps);
  const basePlayerStatsRef = useRef(basePlayerStats);
  
  // Add optimization settings
  const [optimizationSettings, setOptimizationSettings] = useState({
    maxProjectiles: 100,      // Maximum allowed player projectiles
    cullingDistance: 800,     // Distance at which to remove projectiles from player (reduced from 1500)
    collisionGridSize: 200,   // Size of spatial grid cells for collision detection
    maxZombies: 40,           // Maximum zombies on screen at once
    maxMinions: 15,           // Maximum ranged minions on screen at once
    minEnemyDistance: 75,     // Minimum distance between spawned enemies
    projectileRange: 600,     // Maximum distance a projectile can travel before being removed
    enemyProjectileRange: 800 // Maximum distance an enemy projectile can travel
  });
  
  // Add spawning queues for enemies
  const zombieQueueRef = useRef([]);
  const minionQueueRef = useRef([]);
  
  // Add projectile pool for reusing objects
  const projectilePoolRef = useRef([]);
  const MAX_POOL_SIZE = 200;
  
  // Create a collision grid for spatial partitioning
  const collisionGridRef = useRef({});
  
  // Use deltaTime for smoother animations
  const lastFrameTimeRef = useRef(0);

  // Enemy type configuration
  const enemyTypes = {
    zombie: {
      speed: baseZombieSpeed,
      size: 25,
      shootsProjectiles: false,
      scoreValue: 10,
      coinValue: 1
    },
    rangedMinion: {
      speed: baseRangedMinionSpeed,
      size: 25,
      shootsProjectiles: true,
      projectileSpeed: enemyProjectileSpeed,
      shootRange: 400, // Maximum distance to shoot from
      shootInterval: 2000, // Time between shots in ms
      scoreValue: 15,
      coinValue: 2
    }
  };

  // Power-up type configuration
  const powerUpTypes = {
    rapidFire: {
      name: 'Rapid Fire',
      color: '#ff6b6b',
      icon: '⚡',
      duration: 4000, // 4 seconds
      apply: (stats) => ({
        ...stats,
        fireRate: stats.fireRate * 0.1 // 60% faster
      })
    },
    speedBoost: {
      name: 'Speed Boost',
      color: '#3498db',
      icon: '🏃',
      duration: 4000, // 4 seconds
      apply: (stats) => ({
        ...stats,
        speed: stats.speed * 2 // 100% faster
      })
    }
  };

  // Update refs when values change
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    zombiesRef.current = zombies;
  }, [zombies]);
  
  useEffect(() => {
    rangedMinionsRef.current = rangedMinions;
  }, [rangedMinions]);
  
  useEffect(() => {
    enemyProjectilesRef.current = enemyProjectiles;
  }, [enemyProjectiles]);

  useEffect(() => {
    arenaSizeRef.current = arenaSize;
  }, [arenaSize]);

  useEffect(() => {
    playerStatsRef.current = playerStats;
  }, [playerStats]);

  useEffect(() => {
    basePlayerStatsRef.current = basePlayerStats;
  }, [basePlayerStats]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  
  useEffect(() => {
    roundCompleteRef.current = roundComplete;
  }, [roundComplete]);
  
  useEffect(() => {
    activePowerUpsRef.current = activePowerUps;
  }, [activePowerUps]);
  
  // Create an enemy projectile directed at the player with origin tracking
  const createEnemyProjectile = useCallback((enemyPosition) => {
    const playerCenter = { 
      x: positionRef.current.x + ballSize/2, 
      y: positionRef.current.y + ballSize/2 
    };
    
    // Calculate direction to player
    const direction = calculateDirection(
      { x: enemyPosition.x, y: enemyPosition.y },
      playerCenter
    );
    
    const newProjectile = {
      id: Date.now() + Math.random(),
      x: enemyPosition.x,
      y: enemyPosition.y,
      dx: direction.dx * enemyProjectileSpeed,
      dy: direction.dy * enemyProjectileSpeed,
      size: 10,
      originX: enemyPosition.x,  // Store origin for range calculation
      originY: enemyPosition.y,
      distanceTraveled: 0 // Track distance traveled
    };
    
    setEnemyProjectiles(prev => [...prev, newProjectile]);
  }, []);

  // Optimization: Get projectile from pool or create new one
  const getProjectileFromPool = useCallback(() => {
    if (projectilePoolRef.current.length > 0) {
      return projectilePoolRef.current.pop();
    }
    return { id: Date.now() + Math.random() };
  }, []);
  
  // Optimization: Return projectile to pool
  const returnProjectileToPool = useCallback((projectile) => {
    if (projectilePoolRef.current.length < MAX_POOL_SIZE) {
      projectilePoolRef.current.push({
        id: projectile.id
      });
    }
  }, []);
  
  // Optimization: Update collision grid
  const updateCollisionGrid = useCallback(() => {
    const grid = {};
    const cellSize = optimizationSettings.collisionGridSize;
    
    // Add zombies to grid
    zombiesRef.current.forEach(zombie => {
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
  
  // Optimization: Check collision with grid
  const getCollidingEntities = useCallback((position, radius) => {
    const cellSize = optimizationSettings.collisionGridSize;
    const cellX = Math.floor(position.x / cellSize);
    const cellY = Math.floor(position.y / cellSize);
    const result = { zombies: [], minions: [] };
    
    // Check neighboring cells (3x3 grid around position)
    for (let x = cellX - 1; x <= cellX + 1; x++) {
      for (let y = cellY - 1; y <= cellY + 1; y++) {
        const cellKey = `${x},${y}`;
        const cell = collisionGridRef.current[cellKey];
        
        if (cell) {
          // Add zombies from this cell
          cell.zombies.forEach(zombie => {
            result.zombies.push(zombie);
          });
          
          // Add minions from this cell
          cell.minions.forEach(minion => {
            result.minions.push(minion);
          });
        }
      }
    }
    
    return result;
  }, [optimizationSettings.collisionGridSize]);

  // Modify createProjectile to use the pool and track origin
  const createProjectile = useCallback(() => {
    // Limit max projectiles
    if (projectilesRef.current.length >= optimizationSettings.maxProjectiles) {
      return;
    }
    
    const currentPos = positionRef.current;
    const currentMousePos = mousePosRef.current;
    const currentPlayerStats = playerStatsRef.current;
    
    // Get projectile from pool or create new
    const projectileBase = getProjectileFromPool();
    
    const originX = currentPos.x + ballSize/2;
    const originY = currentPos.y + ballSize/2;
    
    const newProjectile = {
      ...projectileBase,
      ...createProjectileUtil(
        { x: originX, y: originY },
        currentMousePos,
        currentPlayerStats.projectileSpeed
      ),
      originX,  // Store origin for range calculation
      originY,
      distanceTraveled: 0 // Track distance traveled
    };
    
    // Update using ref first for immediate use in other functions
    projectilesRef.current = [...projectilesRef.current, newProjectile];
    setProjectiles(projectilesRef.current);
  }, [getProjectileFromPool, optimizationSettings.maxProjectiles]);

  // Create a zombie with spawn distancing
  const createZombie = useCallback(() => {
    // Don't spawn if we're at the limit
    if (zombiesRef.current.length >= optimizationSettings.maxZombies) {
      // Add to spawn queue instead
      zombieQueueRef.current.push({
        timestamp: Date.now(),
        attemptCount: 0
      });
      return;
    }
    
    const currentArenaSize = arenaSizeRef.current;
    const zombieSize = enemyTypes.zombie.size;
    
    // Try to find a position that isn't too close to existing enemies
    let position;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops
    let validPosition = false;
    
    while (!validPosition && attempts < maxAttempts) {
      position = generateRandomEdgePosition(currentArenaSize, zombieSize);
      attempts++;
      
      // Check distance from existing zombies and minions
      validPosition = true;
      const minDistance = optimizationSettings.minEnemyDistance;
      
      // Check against zombies
      for (let i = 0; i < zombiesRef.current.length; i++) {
        const zombie = zombiesRef.current[i];
        const distance = calculateDistance(
          { x: position.x, y: position.y },
          { x: zombie.x, y: zombie.y }
        );
        
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }
      
      // Check against minions if position still valid
      if (validPosition) {
        for (let i = 0; i < rangedMinionsRef.current.length; i++) {
          const minion = rangedMinionsRef.current[i];
          const distance = calculateDistance(
            { x: position.x, y: position.y },
            { x: minion.x, y: minion.y }
          );
          
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
      }
    }
    
    // If we couldn't find a valid position after max attempts, just use the last one
    const newZombie = {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      size: zombieSize,
      type: 'zombie'
    };
    
    // Update ref first for immediate access
    zombiesRef.current = [...zombiesRef.current, newZombie];
    setZombies(zombiesRef.current);
  }, [optimizationSettings.maxZombies, optimizationSettings.minEnemyDistance]);
  
  // Create a ranged minion with spawn distancing
  const createRangedMinion = useCallback(() => {
    // Don't spawn if we're at the limit
    if (rangedMinionsRef.current.length >= optimizationSettings.maxMinions) {
      // Add to spawn queue instead
      minionQueueRef.current.push({
        timestamp: Date.now(),
        attemptCount: 0
      });
      return;
    }
    
    const currentArenaSize = arenaSizeRef.current;
    const minionSize = enemyTypes.rangedMinion.size;
    
    // Try to find a position that isn't too close to existing enemies
    let position;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops
    let validPosition = false;
    
    while (!validPosition && attempts < maxAttempts) {
      position = generateRandomEdgePosition(currentArenaSize, minionSize);
      attempts++;
      
      // Check distance from existing zombies and minions
      validPosition = true;
      const minDistance = optimizationSettings.minEnemyDistance;
      
      // Check against zombies
      for (let i = 0; i < zombiesRef.current.length; i++) {
        const zombie = zombiesRef.current[i];
        const distance = calculateDistance(
          { x: position.x, y: position.y },
          { x: zombie.x, y: zombie.y }
        );
        
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }
      
      // Check against minions if position still valid
      if (validPosition) {
        for (let i = 0; i < rangedMinionsRef.current.length; i++) {
          const minion = rangedMinionsRef.current[i];
          const distance = calculateDistance(
            { x: position.x, y: position.y },
            { x: minion.x, y: minion.y }
          );
          
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
      }
    }
    
    const newMinion = {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      size: minionSize,
      type: 'rangedMinion',
      lastShotTime: Date.now() - enemyTypes.rangedMinion.shootInterval // Make them shoot immediately
    };
    
    // Update ref first for immediate access
    rangedMinionsRef.current = [...rangedMinionsRef.current, newMinion];
    setRangedMinions(rangedMinionsRef.current);
  }, [optimizationSettings.maxMinions, optimizationSettings.minEnemyDistance]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCoins(0);
    setRound(1);
    setRoundComplete(false);
    setRoundShopOpen(true);
    setZombies([]);
    setRangedMinions([]);
    setProjectiles([]);
    setEnemyProjectiles([]);
    
    const initialStats = {
      speed: 5,
      projectileSpeed: 15,
      fireRate: 1000,
      damage: 1
    };
    
    setPosition({ 
      x: arenaSize.width / 2 - ballSize / 2, 
      y: arenaSize.height / 2 - ballSize / 2 
    });
    setPlayerStats(initialStats);
    setBasePlayerStats(initialStats);
  }, [arenaSize]);

  const resetGame = useCallback(() => {
    setGameState('pregame');
  }, []);

  // Handle proceeding to the next round
  const continueToNextRound = useCallback(() => {
    // Increment the round
    setRound(prevRound => prevRound + 1);
    setRoundComplete(false);
    roundCompleteRef.current = false; // Update ref immediately
    setRoundShopOpen(true); // Reset shop visibility for next round
    
    // Reset score to 0 for the new round
    setScore(0);
    
    setZombies([]);
    setRangedMinions([]);
    setProjectiles([]);
    setEnemyProjectiles([]);
    
    // Place player back in the center
    setPosition({ 
      x: arenaSize.width / 2 - ballSize / 2, 
      y: arenaSize.height / 2 - ballSize / 2 
    });
    
    // Ensure game state is 'playing' to trigger zombie spawning
    setGameState('playing');
    
    // Give the player a short grace period before enemies start spawning
    if (zombieSpawnIntervalRef.current) {
      clearInterval(zombieSpawnIntervalRef.current);
      zombieSpawnIntervalRef.current = null;
    }
    
    if (rangedMinionSpawnIntervalRef.current) {
      clearInterval(rangedMinionSpawnIntervalRef.current);
      rangedMinionSpawnIntervalRef.current = null;
    }
    
    // Start spawning zombies after a 2 second delay
    setTimeout(() => {
      if (!roundCompleteRef.current) {
        zombieSpawnIntervalRef.current = setInterval(() => {
          if (!roundCompleteRef.current) {
            createZombie();
          }
        }, 1500);
        
        // Start spawning ranged minions at a slower rate after round 1
        if (roundRef.current > 1) {
          rangedMinionSpawnIntervalRef.current = setInterval(() => {
            if (!roundCompleteRef.current) {
              createRangedMinion();
            }
          }, 3000);
        }
      }
    }, 2000);
  }, [arenaSize, createZombie, createRangedMinion]);

  useEffect(() => {
    const updateArenaSize = () => {
      setArenaSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateArenaSize();
    window.addEventListener('resize', updateArenaSize);
    return () => window.removeEventListener('resize', updateArenaSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (gameState === 'pregame' && e.key === ' ') {
        startGame();
        return;
      }
      
      if (gameState === 'gameover' && e.key === ' ') {
        resetGame();
        return;
      }
      
      if (roundComplete && e.key === ' ') {
        continueToNextRound();
        return;
      }
      
      if (gameState === 'playing' && !roundComplete) {
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
        } else if (key === 'p') {
          setShopOpen(prev => !prev);
        } else if (key === 'v') {
          setDebugPanelVisible(prev => !prev);
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e) => {
      e.preventDefault();
      if (gameState === 'playing') {
        const now = Date.now();
        if (now - lastShotTime >= playerStatsRef.current.fireRate) {
          createProjectile();
          setLastShotTime(now);
        }
        
      setIsAutoShooting(prev => {
        const newState = !prev;
        if (newState) {
          createProjectile();
            setLastShotTime(Date.now());
        }
        return newState;
      });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [createProjectile, gameState, startGame, resetGame, roundComplete, continueToNextRound, lastShotTime]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const moveSpeed = playerStatsRef.current.speed;
    const moveInterval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + (keys.d ? moveSpeed : 0) - (keys.a ? moveSpeed : 0);
        const newY = prev.y + (keys.s ? moveSpeed : 0) - (keys.w ? moveSpeed : 0);
        
        return {
          x: Math.max(0, Math.min(newX, arenaSize.width - ballSize)),
          y: Math.max(0, Math.min(newY, arenaSize.height - ballSize))
        };
      });
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, arenaSize, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (isAutoShooting) {
      // Clear any existing interval first
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
      }
      // Use the current player stats for fire rate
      shootIntervalRef.current = setInterval(createProjectile, playerStatsRef.current.fireRate);
    } else {
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
    }

    return () => {
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
    };
  }, [isAutoShooting, createProjectile, gameState, playerStats]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Start spawning zombies
    zombieSpawnIntervalRef.current = setInterval(() => {
      if (!roundCompleteRef.current) {
        createZombie();
      }
    }, 1500);
    
    // Start spawning ranged minions starting from round 2
    if (round > 1) {
      rangedMinionSpawnIntervalRef.current = setInterval(() => {
        if (!roundCompleteRef.current) {
          createRangedMinion();
        }
      }, 3000);
    }
    
    return () => {
      if (zombieSpawnIntervalRef.current) {
        clearInterval(zombieSpawnIntervalRef.current);
        zombieSpawnIntervalRef.current = null;
      }
      
      if (rangedMinionSpawnIntervalRef.current) {
        clearInterval(rangedMinionSpawnIntervalRef.current);
        rangedMinionSpawnIntervalRef.current = null;
      }
    };
  }, [createZombie, createRangedMinion, gameState, round]);

  // Calculate zombie speed based on score (scales up to 300% at 1000 points)
  const calculateZombieSpeed = useCallback((currentScore) => {
    if (currentScore <= 0) return baseZombieSpeed;
    
    // Calculate the speed multiplier (1.0 to 3.0) based on score
    // Score 0 = 1.0x speed, Score 1000 = 3.0x speed
    const maxMultiplier = 3.0;
    const scoreThreshold = 1000;
    const multiplier = Math.min(1.0 + (currentScore / scoreThreshold) * 2.0, maxMultiplier);
    
    return baseZombieSpeed * multiplier;
  }, []);
  
  // Calculate ranged minion speed based on score (scales up to 250% at 1000 points)
  const calculateRangedMinionSpeed = useCallback((currentScore) => {
    if (currentScore <= 0) return baseRangedMinionSpeed;
    
    // Calculate the speed multiplier (1.0 to 2.5) based on score
    // Score 0 = 1.0x speed, Score 1000 = 2.5x speed
    const maxMultiplier = 2.5;
    const scoreThreshold = 1000;
    const multiplier = Math.min(1.0 + (currentScore / scoreThreshold) * 1.5, maxMultiplier);
    
    return baseRangedMinionSpeed * multiplier;
  }, []);

  // Calculate target score for the current round
  const getRoundTargetScore = useCallback((roundNumber) => {
    // Round 1: 100 points, Round 2: 150 points, increasing by 50 each round
    // But cap the increase at round 5 to prevent excessive requirements
    const baseIncrease = 50;
    const maxRound = 5;
    const cappedRound = Math.min(roundNumber, maxRound);
    
    return 100 + (cappedRound - 1) * baseIncrease;
  }, []);
  
  // Get the round progress as a percentage
  const getRoundProgress = useCallback(() => {
    const targetScore = getRoundTargetScore(round);
    return Math.min((score / targetScore) * 100, 100);
  }, [score, round, getRoundTargetScore]);

  // Check if the round is complete based on score
  useEffect(() => {
    const targetScore = getRoundTargetScore(round);
    if (score >= targetScore && gameState === 'playing') {
      setRoundComplete(true);
      roundCompleteRef.current = true; // Update ref immediately
      
      // Immediately clear enemies and projectiles when round completes
      setZombies([]);
      setProjectiles([]);
      setRangedMinions([]); // Clear ranged minions too
      setEnemyProjectiles([]); // Clear enemy projectiles
      
      // Clear any active zombie spawning
      if (zombieSpawnIntervalRef.current) {
        clearInterval(zombieSpawnIntervalRef.current);
        zombieSpawnIntervalRef.current = null;
      }
      
      // Clear ranged minion spawning
      if (rangedMinionSpawnIntervalRef.current) {
        clearInterval(rangedMinionSpawnIntervalRef.current);
        rangedMinionSpawnIntervalRef.current = null;
      }
      
      // Clear auto-shooting if active
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
      setIsAutoShooting(false);
    }
  }, [score, round, getRoundTargetScore, gameState]);

  // Create a power-up at the given position
  const createPowerUp = useCallback((position) => {
    // Randomly select a power-up type
    const types = Object.keys(powerUpTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const powerUpConfig = powerUpTypes[randomType];
    
    const newPowerUp = {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      type: randomType,
      ...powerUpConfig
    };
    
    setPowerUps(prev => [...prev, newPowerUp]);
  }, [powerUpTypes]);
  
  // Apply a power-up effect
  const applyPowerUp = useCallback((powerUp) => {
    // Create the active power-up
    const activePowerUp = {
      ...powerUp,
      startTime: Date.now(),
      endTime: Date.now() + powerUp.duration
    };
    
    // Apply the effect
    setPlayerStats(prevStats => powerUp.apply(prevStats));
    
    // Add to active power-ups
    setActivePowerUps(prev => [...prev, activePowerUp]);
    
    // Restart auto-shooting if active to apply new fire rate immediately
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = setInterval(createProjectile, powerUp.apply(playerStatsRef.current).fireRate);
    }
    
    // Schedule removal
    setTimeout(() => {
      setActivePowerUps(prev => {
        // Find and remove the expired power-up
        const updatedPowerUps = prev.filter(p => p.id !== activePowerUp.id);
        
        // If power-up type is no longer active, revert its effect
        if (!updatedPowerUps.some(p => p.type === activePowerUp.type)) {
          // Revert the effect by reapplying the base stats with permanent upgrades
          let newStats = { ...basePlayerStatsRef.current };
          
          // Re-apply all active power-ups
          updatedPowerUps.forEach(p => {
            newStats = p.apply(newStats);
          });
          
          setPlayerStats(newStats);
          
          // Restart auto-shooting with new fire rate if active
          if (shootIntervalRef.current) {
            clearInterval(shootIntervalRef.current);
            shootIntervalRef.current = setInterval(createProjectile, newStats.fireRate);
          }
        }
        
        return updatedPowerUps;
      });
    }, powerUp.duration);
    
    // Remove the power-up from the game world
    setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
  }, [createProjectile]);
  
  // Update debug panel to include drop chance
  const updateDropChance = useCallback((newChance) => {
    setDropChance(Math.max(0, Math.min(100, newChance)));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let animationFrameId;
    
    const updateProjectiles = (timestamp) => {
      // Exit immediately if round is complete
      if (roundCompleteRef.current) {
        animationFrameId = requestAnimationFrame(updateProjectiles);
        return;
      }
      
      // Calculate delta time for smoother animations
      const deltaTime = timestamp - lastFrameTimeRef.current || 0;
      lastFrameTimeRef.current = timestamp;
      
      // Normalize delta time to avoid huge jumps after tab switch, etc.
      const normalizedDelta = Math.min(deltaTime, 100) / (1000 / 60);
      
      if (timestamp - lastUpdateRef.current >= FRAME_RATE) {
        // Update collision grid for optimized collision detection
        updateCollisionGrid();
        
        // Process spawn queues if we have space
        if (zombiesRef.current.length < optimizationSettings.maxZombies && zombieQueueRef.current.length > 0) {
          // Spawn oldest queued zombie
          const queued = zombieQueueRef.current.shift();
          createZombie();
        }
        
        if (rangedMinionsRef.current.length < optimizationSettings.maxMinions && minionQueueRef.current.length > 0) {
          // Spawn oldest queued minion
          const queued = minionQueueRef.current.shift();
          createRangedMinion();
        }
        
        // Track zombies hit in this update cycle to prevent multiple hits on the same zombie
        const hitZombieIds = new Set();
        const hitMinionIds = new Set();
        const now = Date.now();
        
        // Create an array to collect projectiles to remove
        const projectilesToRemove = [];
        const updatedProjectiles = [];
        
        // Update player projectiles
        for (let i = 0; i < projectilesRef.current.length; i++) {
          const projectile = projectilesRef.current[i];
          
          // Calculate new position
          const newPosition = calculateNewPosition(projectile, {
            dx: projectile.dx * normalizedDelta,
            dy: projectile.dy * normalizedDelta
          });
          
          // Calculate distance moved this frame
          const distanceMoved = calculateDistance(
            { x: projectile.x, y: projectile.y },
            newPosition
          );
          
          // Add to total distance traveled
          const totalDistanceTraveled = (projectile.distanceTraveled || 0) + distanceMoved;
          
          // Remove projectile if it hits a wall, goes too far from player, or exceeds range
          if (!isWithinBounds(newPosition, arenaSizeRef.current, projectile.size || 15) ||
              calculateDistance(
                { x: positionRef.current.x, y: positionRef.current.y },
                newPosition
              ) > optimizationSettings.cullingDistance ||
              totalDistanceTraveled > optimizationSettings.projectileRange) {
            projectilesToRemove.push(projectile);
            continue;
          }
          
          // Get nearby entities for collision check
          const nearbyEntities = getCollidingEntities(newPosition, projectile.size || 15);
          let hitSomething = false;
          
          // Check for zombie collisions
          for (let j = 0; j < nearbyEntities.zombies.length && !hitSomething; j++) {
            const zombie = nearbyEntities.zombies[j];
            
            // Skip zombies already hit in this frame
            if (hitZombieIds.has(zombie.id)) continue;
            
            if (checkCollision(
              { ...newPosition, size: projectile.size || 15 },
              zombie
            )) {
              // Mark this zombie as hit
              hitZombieIds.add(zombie.id);
              
              // Remove zombie directly from the reference to avoid collision detection race conditions
              zombiesRef.current = zombiesRef.current.filter(z => z.id !== zombie.id);
              
              // Update zombie state and add points
              setZombies(prevZombies => prevZombies.filter(z => z.id !== zombie.id));
              setScore(prevScore => prevScore + enemyTypes.zombie.scoreValue);
              setCoins(prevCoins => prevCoins + enemyTypes.zombie.coinValue);
              
              // Chance to spawn a power-up (20% by default)
              if (Math.random() * 100 < dropChance) {
                createPowerUp({ x: zombie.x, y: zombie.y });
              }
              
              hitSomething = true;
              projectilesToRemove.push(projectile);
              break;
            }
          }
          
          // If already hit something, skip further checks
          if (hitSomething) continue;
          
          // Check for ranged minion collisions
          for (let j = 0; j < nearbyEntities.minions.length && !hitSomething; j++) {
            const minion = nearbyEntities.minions[j];
            
            // Skip minions already hit in this frame
            if (hitMinionIds.has(minion.id)) continue;
            
            if (checkCollision(
              { ...newPosition, size: projectile.size || 15 },
              minion
            )) {
              // Mark this minion as hit
              hitMinionIds.add(minion.id);
              
              // Remove minion directly from the reference to avoid collision detection race conditions
              rangedMinionsRef.current = rangedMinionsRef.current.filter(m => m.id !== minion.id);
              
              // Update minion state and add points
              setRangedMinions(prevMinions => prevMinions.filter(m => m.id !== minion.id));
              setScore(prevScore => prevScore + enemyTypes.rangedMinion.scoreValue);
              setCoins(prevCoins => prevCoins + enemyTypes.rangedMinion.coinValue);
              
              // Chance to spawn a power-up (20% by default)
              if (Math.random() * 100 < dropChance) {
                createPowerUp({ x: minion.x, y: minion.y });
              }
              
              hitSomething = true;
              projectilesToRemove.push(projectile);
              break;
            }
            }
            
            // Update position if no collision
          if (!hitSomething) {
            projectile.x = newPosition.x;
            projectile.y = newPosition.y;
            projectile.distanceTraveled = totalDistanceTraveled; // Update distance traveled
            updatedProjectiles.push(projectile);
          }
        }
        
        // Return removed projectiles to the pool
        projectilesToRemove.forEach(returnProjectileToPool);
        
        // Filter out old projectiles based on age (no longer needed with range check)
        // Just use the updatedProjectiles directly
        
        // Update the ref and state with the new projectiles
        projectilesRef.current = updatedProjectiles;
        setProjectiles(updatedProjectiles);
        
        // Check for power-up collisions with player
        setPowerUps(prev => {
          const currentPos = positionRef.current;
          const playerCenter = { 
            x: currentPos.x + ballSize/2, 
            y: currentPos.y + ballSize/2, 
            size: ballSize
          };
          
          const remainingPowerUps = [];
          
          prev.forEach(powerUp => {
            if (checkCollision(
              { x: powerUp.x, y: powerUp.y, size: 20 },
              playerCenter
            )) {
              // Player collided with power-up, apply it
              applyPowerUp(powerUp);
            } else {
              // No collision, keep the power-up
              remainingPowerUps.push(powerUp);
            }
          });
          
          return remainingPowerUps;
        });
        
        // Update enemy projectiles with optimized approach
        const enemyProjectilesToRemove = [];
        const updatedEnemyProjectiles = [];
        
        for (let i = 0; i < enemyProjectilesRef.current.length; i++) {
          const projectile = enemyProjectilesRef.current[i];
          
          // Calculate new position with normalized delta
          const newPosition = calculateNewPosition(projectile, {
            dx: projectile.dx * normalizedDelta,
            dy: projectile.dy * normalizedDelta
          });
          
          // Calculate distance moved this frame
          const distanceMoved = calculateDistance(
            { x: projectile.x, y: projectile.y },
            newPosition
          );
          
          // Add to total distance traveled
          const totalDistanceTraveled = (projectile.distanceTraveled || 0) + distanceMoved;
          
          // Remove projectile if it hits a wall or exceeds range
          if (!isWithinBounds(newPosition, arenaSizeRef.current, projectile.size) ||
              totalDistanceTraveled > optimizationSettings.enemyProjectileRange) {
            enemyProjectilesToRemove.push(projectile);
            continue;
          }
          
          // Check for player collision
          const playerCenter = { 
            x: positionRef.current.x + ballSize/2, 
            y: positionRef.current.y + ballSize/2 
          };
          
          if (checkCollision(
            { ...newPosition, size: projectile.size },
            { ...playerCenter, size: ballSize }
          )) {
            // Game over if player is hit by enemy projectile and round is not complete
            if (!roundCompleteRef.current) {
              setGameState('gameover');
            }
            enemyProjectilesToRemove.push(projectile);
            continue;
          }
          
          // Update position if no collision
          projectile.x = newPosition.x;
          projectile.y = newPosition.y;
          projectile.distanceTraveled = totalDistanceTraveled; // Update distance traveled
          updatedEnemyProjectiles.push(projectile);
        }
        
        // Filter out old enemy projectiles based on age
        // No need to filter by age anymore, range handles it
        
        // Update the refs and state
        enemyProjectilesRef.current = updatedEnemyProjectiles;
        setEnemyProjectiles(updatedEnemyProjectiles);
        
        // Update zombies movement with optimized approach
        const currentPos = positionRef.current;
        const currentScore = scoreRef.current;
        const playerCenter = { 
          x: currentPos.x + ballSize/2, 
          y: currentPos.y + ballSize/2,
          size: ballSize
        };
        
        // Calculate current zombie speed based on score
        const currentZombieSpeed = calculateZombieSpeed(currentScore);
        
        // Check for player collision with zombies
        let playerHit = false;
        for (let i = 0; i < zombiesRef.current.length && !playerHit; i++) {
          const zombie = zombiesRef.current[i];
          
          if (checkCollision(playerCenter, zombie)) {
            // Game over if zombie touches player and round is not complete
            if (!roundCompleteRef.current) {
              setGameState('gameover');
              playerHit = true;
            }
          }
        }
        
        // If player wasn't hit, update zombie positions
        if (!playerHit) {
          const updatedZombies = zombiesRef.current.map(zombie => {
            // Calculate direction to player
            const direction = calculateDirection(zombie, playerCenter);
            
            // Move zombie towards player with dynamic speed adjusted by deltaTime
            return {
              ...zombie,
              x: zombie.x + direction.dx * currentZombieSpeed * normalizedDelta,
              y: zombie.y + direction.dy * currentZombieSpeed * normalizedDelta
            };
          });
          
          // Update both ref and state
          zombiesRef.current = updatedZombies;
          setZombies(updatedZombies);
        }
        
        // Update ranged minions with optimized approach
        const currentMinionSpeed = calculateRangedMinionSpeed(currentScore);
        
        // Check for player collision with minions
        for (let i = 0; i < rangedMinionsRef.current.length && !playerHit; i++) {
          const minion = rangedMinionsRef.current[i];
          
          if (checkCollision(playerCenter, minion)) {
            // Game over if minion touches player and round is not complete
            if (!roundCompleteRef.current) {
              setGameState('gameover');
              playerHit = true;
            }
          }
        }
        
        // If player wasn't hit, update minion positions
        if (!playerHit) {
          const updatedMinions = rangedMinionsRef.current.map(minion => {
            // Calculate distance to player
            const distanceToPlayer = calculateDistance(
              { x: minion.x, y: minion.y },
              playerCenter
            );
            
            // Check if minion should shoot
            const shootInterval = enemyTypes.rangedMinion.shootInterval;
            const shootRange = enemyTypes.rangedMinion.shootRange;
            const timeSinceLastShot = now - (minion.lastShotTime || 0);
            
            if (distanceToPlayer <= shootRange && timeSinceLastShot >= shootInterval && !roundCompleteRef.current) {
              createEnemyProjectile({ x: minion.x, y: minion.y });
              minion.lastShotTime = now;
            }
            
            // Ranged minions try to maintain distance from the player
            let direction;
            const idealDistance = shootRange * 0.8; // They'll try to stay at 80% of their shooting range
            
            if (distanceToPlayer < idealDistance - 50) {
              // Too close, move away
              direction = calculateDirection(playerCenter, minion);
            } else if (distanceToPlayer > idealDistance + 50) {
              // Too far, move closer
              direction = calculateDirection(minion, playerCenter);
            } else {
              // Ideal range, stop moving or move sideways
              return { ...minion, lastShotTime: minion.lastShotTime };
            }
            
            // Move minion with dynamic speed adjusted by deltaTime
            return {
              ...minion,
              x: minion.x + direction.dx * currentMinionSpeed * normalizedDelta,
              y: minion.y + direction.dy * currentMinionSpeed * normalizedDelta,
              lastShotTime: minion.lastShotTime // Preserve the last shot time
            };
          });
          
          // Update both ref and state
          rangedMinionsRef.current = updatedMinions;
          setRangedMinions(updatedMinions);
        }
        
        lastUpdateRef.current = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateProjectiles);
    };

    animationFrameId = requestAnimationFrame(updateProjectiles);
    return () => cancelAnimationFrame(animationFrameId);
  }, [FRAME_RATE, gameState, calculateZombieSpeed, calculateRangedMinionSpeed, createEnemyProjectile, applyPowerUp, createPowerUp, dropChance, getCollidingEntities, returnProjectileToPool, updateCollisionGrid, optimizationSettings]);

  // Add a function to display the current difficulty level
  const getDifficultyText = useCallback(() => {
    const currentSpeed = calculateZombieSpeed(score);
    const speedPercentage = Math.round((currentSpeed / baseZombieSpeed) * 100);
    
    if (score < 1000) {
      return `Difficulty: ${speedPercentage}%`;
    } else if (score >= 1000 && score < 10000) {
      return `Difficulty: MAX (300%)`;
    } else {
      return `Difficulty: NIGHTMARE (300%)`;
    }
  }, [score, calculateZombieSpeed]);

  // Shop items configuration
  const shopItems = [
    {
      id: 'speed',
      name: 'Speed Boost',
      description: 'Move 30% faster',
      price: 50,
      icon: '⚡',
      iconColor: '#ffc107',
      apply: (stats) => ({
        ...stats,
        speed: stats.speed * 1.3
      })
    },
    {
      id: 'fire_rate',
      name: 'Rapid Fire',
      description: 'Shoot 40% faster',
      price: 50,
      icon: '🔥',
      iconColor: '#dc3545',
      apply: (stats) => ({
        ...stats,
        fireRate: stats.fireRate * 0.6 // Lower is faster
      })
    },
    {
      id: 'projectile_speed',
      name: 'Bullet Velocity',
      description: 'Projectiles move 25% faster',
      price: 50,
      icon: '💨',
      iconColor: '#17a2b8',
      apply: (stats) => ({
        ...stats,
        projectileSpeed: stats.projectileSpeed * 1.25
      })
    }
  ];

  // Handle shop purchase
  const handlePurchase = (itemId) => {
    const item = shopItems.find(item => item.id === itemId);
    
    if (item && coins >= item.price) {
      setCoins(prevCoins => prevCoins - item.price);
      
      // Update both current and base stats
      const updatedStats = item.apply(basePlayerStatsRef.current);
      setBasePlayerStats(updatedStats);
      
      // Apply the same update to current stats, preserving any active power-ups
      setPlayerStats(prevStats => {
        // Compute the ratio of current stats to base stats to preserve power-up effects
        const ratios = {
          speed: prevStats.speed / basePlayerStatsRef.current.speed,
          projectileSpeed: prevStats.projectileSpeed / basePlayerStatsRef.current.projectileSpeed,
          fireRate: prevStats.fireRate / basePlayerStatsRef.current.fireRate,
          damage: prevStats.damage / basePlayerStatsRef.current.damage
        };
        
        // Apply the same ratios to the new stats
        return {
          speed: updatedStats.speed * ratios.speed,
          projectileSpeed: updatedStats.projectileSpeed * ratios.projectileSpeed,
          fireRate: updatedStats.fireRate * ratios.fireRate,
          damage: updatedStats.damage * ratios.damage
        };
      });
    }
  };

  // Add optimizations controls to the debug panel
  const updateOptimizationSetting = useCallback((setting, value) => {
    setOptimizationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  }, []);

  return (
    <Container>
      <Arena>
        {gameState === 'playing' && (
          <>
            <Ball $x={position.x} $y={position.y} data-testid="game-ball" />
        {projectiles.map(projectile => (
          <Projectile
            key={projectile.id}
            $x={projectile.x}
            $y={projectile.y}
                data-testid="projectile"
          />
        ))}
            {zombies.map(zombie => (
              <Zombie
                key={zombie.id}
                $x={zombie.x}
                $y={zombie.y}
                data-testid="zombie"
              />
            ))}
            {rangedMinions.map(minion => (
              <RangedMinion
                key={minion.id}
                $x={minion.x}
                $y={minion.y}
                data-testid="ranged-minion"
              />
            ))}
            {enemyProjectiles.map(projectile => (
              <EnemyProjectile
                key={projectile.id}
                $x={projectile.x}
                $y={projectile.y}
                data-testid="enemy-projectile"
              />
            ))}
            {powerUps.map(powerUp => (
              <PowerUp
                key={powerUp.id}
                $x={powerUp.x}
                $y={powerUp.y}
                $color={powerUp.color}
                $icon={powerUp.icon}
                data-testid="power-up"
              />
            ))}
            
            {/* Active power-ups display */}
            {activePowerUps.length > 0 && (
              <ActivePowerUpIndicator>
                {activePowerUps.map(powerUp => {
                  const timeLeft = Math.max(0, powerUp.endTime - Date.now());
                  const percentLeft = (timeLeft / powerUp.duration) * 100;
                  
                  return (
                    <PowerUpItem key={powerUp.id}>
                      <PowerUpIcon $color={powerUp.color}>{powerUp.icon}</PowerUpIcon>
                      <div>
                        {powerUp.name}
                        <PowerUpTimer $timeLeft={percentLeft} />
                      </div>
                    </PowerUpItem>
                  );
                })}
              </ActivePowerUpIndicator>
            )}
            
            <ScoreDisplay>Score: {score}</ScoreDisplay>
            <CoinDisplay>
              <CoinIcon /> {coins}
            </CoinDisplay>
            <ShopHint>Press P to open shop</ShopHint>
            
            <DifficultyDisplay>
              {getDifficultyText()}
            </DifficultyDisplay>
            
            <RoundDisplay>
              Round: {round} - Target: {getRoundTargetScore(round)}
            </RoundDisplay>
            
            <RoundProgressBar>
              <RoundProgressFill $progress={getRoundProgress()} />
            </RoundProgressBar>
            
            {/* Debug Panel with drop chance */}
            {debugPanelVisible && (
              <DebugPanel>
                <DebugButton onClick={continueToNextRound}>
                  Next Round
                </DebugButton>
                <DebugButton onClick={() => setCoins(prev => prev + 100)}>
                  +100 Coins
                </DebugButton>
                <DebugButton onClick={() => setScore(prev => prev + 100)}>
                  +100 Score
                </DebugButton>
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  Drop Chance: {dropChance}%
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <DebugButton onClick={() => updateDropChance(dropChance - 5)}>-</DebugButton>
                  <DebugButton onClick={() => updateDropChance(dropChance + 5)}>+</DebugButton>
                </div>
                
                {/* Player Stats Display */}
                <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>⚙️ Player Stats</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', marginRight: '6px' }}>⚡</span>
                    <span>Speed: {playerStats.speed.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', marginRight: '6px' }}>🔥</span>
                    <span>Fire Rate: {playerStats.fireRate.toFixed(0)}ms</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', marginRight: '6px' }}>🚀</span>
                    <span>Projectile Speed: {playerStats.projectileSpeed.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', marginRight: '6px' }}>💥</span>
                    <span>Damage: {playerStats.damage.toFixed(1)}</span>
                  </div>
                </div>
                
                {/* Performance Settings */}
                <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📊 Performance</div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Max Projectiles: {optimizationSettings.maxProjectiles}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      <DebugButton onClick={() => updateOptimizationSetting('maxProjectiles', Math.max(10, optimizationSettings.maxProjectiles - 10))}>-</DebugButton>
                      <DebugButton onClick={() => updateOptimizationSetting('maxProjectiles', optimizationSettings.maxProjectiles + 10)}>+</DebugButton>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Projectile Range: {optimizationSettings.projectileRange}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      <DebugButton onClick={() => updateOptimizationSetting('projectileRange', Math.max(200, optimizationSettings.projectileRange - 100))}>-</DebugButton>
                      <DebugButton onClick={() => updateOptimizationSetting('projectileRange', optimizationSettings.projectileRange + 100)}>+</DebugButton>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Culling Distance: {optimizationSettings.cullingDistance}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      <DebugButton onClick={() => updateOptimizationSetting('cullingDistance', Math.max(500, optimizationSettings.cullingDistance - 100))}>-</DebugButton>
                      <DebugButton onClick={() => updateOptimizationSetting('cullingDistance', optimizationSettings.cullingDistance + 100)}>+</DebugButton>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Max Zombies: {optimizationSettings.maxZombies}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      <DebugButton onClick={() => updateOptimizationSetting('maxZombies', Math.max(5, optimizationSettings.maxZombies - 5))}>-</DebugButton>
                      <DebugButton onClick={() => updateOptimizationSetting('maxZombies', optimizationSettings.maxZombies + 5)}>+</DebugButton>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Max Minions: {optimizationSettings.maxMinions}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      <DebugButton onClick={() => updateOptimizationSetting('maxMinions', Math.max(2, optimizationSettings.maxMinions - 2))}>-</DebugButton>
                      <DebugButton onClick={() => updateOptimizationSetting('maxMinions', optimizationSettings.maxMinions + 2)}>+</DebugButton>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Min Enemy Distance: {optimizationSettings.minEnemyDistance}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      <DebugButton onClick={() => updateOptimizationSetting('minEnemyDistance', Math.max(25, optimizationSettings.minEnemyDistance - 10))}>-</DebugButton>
                      <DebugButton onClick={() => updateOptimizationSetting('minEnemyDistance', optimizationSettings.minEnemyDistance + 10)}>+</DebugButton>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '6px' }}>
                    Queue: Z:{zombieQueueRef.current.length} M:{minionQueueRef.current.length}
                  </div>
                </div>
              </DebugPanel>
            )}
            
            {roundComplete && (
              <RoundCompleteOverlay>
                <RoundCompleteMessage>Round {round} Complete!</RoundCompleteMessage>
                <RoundCompleteDetails>
                  Score: {score} / {getRoundTargetScore(round)}
                </RoundCompleteDetails>
                <RoundContinueButton onClick={continueToNextRound}>
                  Continue to Round {round + 1}
                </RoundContinueButton>
                
                {roundShopOpen && (
                  <>
                    <RoundCompleteDetails style={{ marginTop: '20px' }}>
                      Shop for Upgrades
                    </RoundCompleteDetails>
                    
                    <Shop 
                      coins={coins}
                      onPurchase={handlePurchase}
                      onClose={() => setRoundShopOpen(false)}
                      shopItems={shopItems}
                    />
                  </>
                )}
                
                {!roundShopOpen && (
                  <RoundContinueButton onClick={() => setRoundShopOpen(true)}>
                    Open Shop
                  </RoundContinueButton>
                )}
              </RoundCompleteOverlay>
            )}
            
            {shopOpen && !roundComplete && (
              <Shop 
                coins={coins}
                onPurchase={handlePurchase}
                onClose={() => setShopOpen(false)}
                shopItems={shopItems}
              />
            )}
          </>
        )}
        
        {gameState === 'pregame' && (
          <Overlay>
            <Title>Web Shooter</Title>
            <Subtitle>Press SPACE to start</Subtitle>
            <Button onClick={startGame}>Start Game</Button>
          </Overlay>
        )}
        
        {gameState === 'gameover' && (
          <Overlay>
            <Title>Game Over</Title>
            <Subtitle>Your score: {score}</Subtitle>
            <Subtitle>Press SPACE to play again</Subtitle>
            <Button onClick={resetGame}>Play Again</Button>
          </Overlay>
        )}
      </Arena>
    </Container>
  );
};

export default BallGame; 