import { World } from './ecs';
import RenderSystem from './ecs/systems/RenderSystem';
import MovementSystem from './ecs/systems/MovementSystem';
import CollisionSystem from './ecs/systems/CollisionSystem';
import InputSystem from './ecs/systems/InputSystem';

/**
 * Main game class that manages the game loop and systems
 */
class Game {
  /**
   * Create a new game
   * @param {Object} options - Configuration options
   * @param {HTMLCanvasElement} options.canvas - The canvas element to render to
   * @param {number} [options.width] - Canvas width (if not set, uses canvas width)
   * @param {number} [options.height] - Canvas height (if not set, uses canvas height)
   * @param {number} [options.fps=60] - Target frames per second
   * @param {boolean} [options.debug=false] - Whether to show debug info
   */
  constructor({
    canvas,
    width,
    height,
    fps = 60,
    debug = false
  }) {
    /**
     * Canvas element
     * @type {HTMLCanvasElement}
     */
    this.canvas = canvas;
    
    /**
     * Canvas rendering context
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = canvas.getContext('2d');
    
    /**
     * Canvas width
     * @type {number}
     */
    this.width = width || canvas.width;
    
    /**
     * Canvas height
     * @type {number}
     */
    this.height = height || canvas.height;
    
    /**
     * Target frames per second
     * @type {number}
     */
    this.fps = fps;
    
    /**
     * Whether the game is currently running
     * @type {boolean}
     */
    this.running = false;
    
    /**
     * Whether to show debug info
     * @type {boolean}
     */
    this.debug = debug;
    
    /**
     * Time of the last frame
     * @type {number}
     */
    this.lastFrameTime = 0;
    
    /**
     * Current frame count
     * @type {number}
     */
    this.frameCount = 0;
    
    /**
     * Current FPS
     * @type {number}
     */
    this.currentFps = 0;
    
    /**
     * Time since last FPS update
     * @type {number}
     */
    this.fpsUpdateTime = 0;
    
    /**
     * Animation frame request ID
     * @type {number}
     */
    this.animationFrameId = null;
    
    /**
     * ECS world
     * @type {World}
     */
    this.world = new World();
    
    /**
     * Map of scenes
     * @type {Map<string, Function>}
     */
    this.scenes = new Map();
    
    /**
     * Current scene name
     * @type {string|null}
     */
    this.currentScene = null;
    
    /**
     * Input system
     * @type {InputSystem}
     */
    this.inputSystem = null;
    
    /**
     * Render system
     * @type {RenderSystem}
     */
    this.renderSystem = null;
    
    /**
     * Movement system
     * @type {MovementSystem}
     */
    this.movementSystem = null;
    
    /**
     * Collision system
     * @type {CollisionSystem}
     */
    this.collisionSystem = null;
    
    /**
     * Resize handler
     * @type {Function}
     */
    this.resizeHandler = this.handleResize.bind(this);
    
    // Set up the canvas size
    this.resize(this.width, this.height);
    
    // Add resize listener
    window.addEventListener('resize', this.resizeHandler);
  }
  
  /**
   * Initialize the game
   */
  init() {
    // Add core systems
    this.inputSystem = new InputSystem({ 
      element: this.canvas 
    });
    this.world.addSystem(this.inputSystem);
    
    this.movementSystem = new MovementSystem();
    this.world.addSystem(this.movementSystem);
    
    this.collisionSystem = new CollisionSystem();
    this.world.addSystem(this.collisionSystem);
    
    this.renderSystem = new RenderSystem({ 
      canvas: this.canvas, 
      clearBeforeRender: true 
    });
    this.world.addSystem(this.renderSystem);
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Stop the game loop
   */
  stop() {
    if (!this.running) return;
    
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
  }
  
  /**
   * Main game loop
   * @param {number} timestamp - Current timestamp
   */
  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    
    // Update FPS counter
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;
    if (this.fpsUpdateTime >= 1) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime -= 1;
    }
    
    // Update all systems
    this.world.update(deltaTime);
    
    // Draw debug info if enabled
    if (this.debug) {
      this.drawDebugInfo();
    }
    
    // Continue the loop if still running
    if (this.running) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  /**
   * Draw debug information
   */
  drawDebugInfo() {
    const ctx = this.ctx;
    const padding = 10;
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(padding, padding, 150, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    ctx.fillText(`FPS: ${this.currentFps}`, padding + 10, padding + 10);
    ctx.fillText(`Entities: ${this.world.entities.size}`, padding + 10, padding + 30);
    
    ctx.restore();
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // This can be overridden to handle responsive behavior
  }
  
  /**
   * Resize the canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    
    // Update canvas size
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Update canvas style if needed
    if (this.canvas.style) {
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    }
  }
  
  /**
   * Register a scene
   * @param {string} name - Scene name
   * @param {Function} setupFn - Scene setup function
   */
  registerScene(name, setupFn) {
    this.scenes.set(name, setupFn);
  }
  
  /**
   * Load a scene
   * @param {string} name - Scene name
   */
  loadScene(name) {
    // Exit if scene doesn't exist
    if (!this.scenes.has(name)) {
      console.error(`Scene '${name}' doesn't exist`);
      return;
    }
    
    // Clear existing entities
    for (const [id, entity] of this.world.entities.entries()) {
      entity.destroy();
    }
    
    // Call the scene setup function
    const setupFn = this.scenes.get(name);
    setupFn(this.world, this);
    
    // Update current scene
    this.currentScene = name;
  }
  
  /**
   * Clean up the game
   */
  destroy() {
    // Stop the game loop
    this.stop();
    
    // Remove resize listener
    window.removeEventListener('resize', this.resizeHandler);
    
    // Clean up systems
    if (this.inputSystem) {
      this.world.removeSystem(this.inputSystem);
    }
    
    // Clear all entities
    for (const [id, entity] of this.world.entities.entries()) {
      entity.destroy();
    }
  }
}

export default Game; 