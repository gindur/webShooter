import Game from '../Game';
import GameObject from '../ecs/GameObject';
import Physics from '../ecs/components/Physics';

/**
 * Simple example game using the ECS framework
 */
class SimpleGame {
  /**
   * Initialize the game
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @returns {Game} The game instance
   */
  static init(canvas) {
    // Create the game instance
    const game = new Game({
      canvas,
      width: canvas.width,
      height: canvas.height,
      debug: true
    });
    
    // Initialize systems
    game.init();
    
    // Register scenes
    game.registerScene('main', this.setupMainScene);
    
    // Set up input handlers
    this.setupInputHandlers(game);
    
    // Load the main scene
    game.loadScene('main');
    
    // Start the game loop
    game.start();
    
    return game;
  }
  
  /**
   * Set up input handlers
   * @param {Game} game - The game instance
   */
  static setupInputHandlers(game) {
    const input = game.inputSystem;
    
    // Add a player when space is pressed
    input.onKeyPress(' ', () => {
      const mousePos = input.getMousePosition();
      this.createPlayer(game.world, mousePos.x, mousePos.y);
    });
    
    // Add a ball when clicking
    game.canvas.addEventListener('click', (event) => {
      const rect = game.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      this.createBall(game.world, x, y);
    });
  }
  
  /**
   * Set up the main scene
   * @param {World} world - The ECS world
   * @param {Game} game - The game instance
   */
  static setupMainScene(world, game) {
    const { width, height } = game;
    
    // Create some bouncing balls
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      SimpleGame.createBall(world, x, y);
    }
    
    // Create a player
    SimpleGame.createPlayer(world, width / 2, height / 2);
    
    // Create boundaries
    SimpleGame.createBoundaries(world, width, height);
    
    // Create instructions text
    GameObject.createText(world, {
      x: width / 2,
      y: 30,
      text: 'Click to add balls, Space to add player',
      font: '16px Arial',
      fillStyle: '#ffffff',
      align: 'center'
    });
  }
  
  /**
   * Create a bouncing ball
   * @param {World} world - The ECS world
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Entity} The created ball entity
   */
  static createBall(world, x, y) {
    const radius = 10 + Math.random() * 20;
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    
    const ball = GameObject.createCircle(world, {
      x,
      y,
      radius,
      fillStyle: color,
      physics: true,
      collider: true,
      tag: 'ball'
    });
    
    // Get the physics component and set properties
    const physics = ball.getComponent('Physics');
    physics.setVelocity(
      (Math.random() * 2 - 1) * 200,
      (Math.random() * 2 - 1) * 200
    );
    physics.bounceX = 0.8;
    physics.bounceY = 0.8;
    physics.friction = 0.01;
    
    // Set bounds to keep the ball within the canvas
    const canvas = world.getEntitiesByTag('boundary').values().next().value;
    const transform = canvas.getComponent('Transform');
    physics.setBounds(
      radius,
      radius,
      transform.x * 2 - radius,
      transform.y * 2 - radius
    );
    
    return ball;
  }
  
  /**
   * Create a player-controlled entity
   * @param {World} world - The ECS world
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Entity} The created player entity
   */
  static createPlayer(world, x, y) {
    const player = GameObject.createCircle(world, {
      x,
      y,
      radius: 25,
      fillStyle: '#ffff00',
      physics: true,
      collider: true,
      tag: 'player'
    });
    
    // Get the physics component and set properties
    const physics = player.getComponent('Physics');
    physics.friction = 0.1;
    physics.mass = 2;
    
    // Set bounds to keep the player within the canvas
    const canvas = world.getEntitiesByTag('boundary').values().next().value;
    const transform = canvas.getComponent('Transform');
    physics.setBounds(
      25,
      25,
      transform.x * 2 - 25,
      transform.y * 2 - 25
    );
    
    // Add a custom update component to handle player input
    player.addComponent('PlayerControl', {
      update: (deltaTime) => {
        const input = world.systems.find(s => s.constructor.name === 'InputSystem');
        const moveSpeed = 300;
        
        // Get input direction
        let dirX = 0;
        let dirY = 0;
        
        if (input.isKeyPressed('arrowleft') || input.isKeyPressed('a')) dirX -= 1;
        if (input.isKeyPressed('arrowright') || input.isKeyPressed('d')) dirX += 1;
        if (input.isKeyPressed('arrowup') || input.isKeyPressed('w')) dirY -= 1;
        if (input.isKeyPressed('arrowdown') || input.isKeyPressed('s')) dirY += 1;
        
        // Normalize diagonal movement
        if (dirX !== 0 && dirY !== 0) {
          const length = Math.sqrt(dirX * dirX + dirY * dirY);
          dirX /= length;
          dirY /= length;
        }
        
        // Apply force
        physics.setVelocity(
          dirX * moveSpeed,
          dirY * moveSpeed
        );
      }
    });
    
    return player;
  }
  
  /**
   * Create boundary entities
   * @param {World} world - The ECS world
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  static createBoundaries(world, width, height) {
    // Create an invisible boundary entity to track canvas size
    const boundary = GameObject.create(world, {
      x: width / 2,
      y: height / 2,
      tag: 'boundary'
    });
  }
}

export default SimpleGame; 