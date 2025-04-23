import * as PIXI from 'pixi.js';
import { World } from 'tiny-ecs';
import { SpatialHashGrid } from './SpatialHashGrid';

// Game engine class that handles rendering, physics, and entity management
export class GameEngine {
  constructor(options = {}) {
    // Default options
    this.options = {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a1a,
      targetFPS: 60,
      cullingDistance: 800,
      spatialGridCellSize: 200,
      ...options
    };
    
    // Initialize PixiJS renderer
    this.app = new PIXI.Application({
      width: this.options.width,
      height: this.options.height,
      backgroundColor: this.options.backgroundColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });
    
    // Create container for game objects
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    // Create ECS world
    this.world = new World();
    
    // Create spatial hash grid for efficient collision detection
    this.spatialGrid = new SpatialHashGrid(
      this.options.width,
      this.options.height,
      this.options.spatialGridCellSize
    );
    
    // Game state
    this.gameState = 'pregame'; // pregame, playing, paused, gameover
    this.lastUpdateTime = 0;
    this.deltaTime = 0;
    this.isPaused = false;
    this.debug = {
      showGrid: false,
      showFPS: false,
      showColliders: false
    };
    
    // Initialize subsystems
    this.systems = [];
    
    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Stats
    this.stats = {
      fps: 0,
      entityCount: 0,
      drawCalls: 0,
      collisionChecks: 0
    };
    
    // Debug graphics
    this.debugGraphics = new PIXI.Graphics();
    this.app.stage.addChild(this.debugGraphics);
  }
  
  // Initialize the game engine
  init(mountElement) {
    // Mount PixiJS canvas to DOM
    mountElement.appendChild(this.app.view);
    
    // Start update loop
    this.app.ticker.add(this.update.bind(this));
    
    return this;
  }
  
  // Add a system to the engine
  addSystem(system) {
    this.systems.push(system);
    if (system.init) {
      system.init(this);
    }
    return this;
  }
  
  // Main update loop
  update(deltaFrame) {
    if (this.isPaused) return;
    
    // Calculate delta time (in seconds)
    const now = performance.now();
    this.deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;
    
    // Reset stats
    this.stats.collisionChecks = 0;
    this.stats.entityCount = this.world.count();
    
    // Update FPS counter
    this.stats.fps = Math.round(this.app.ticker.FPS);
    
    // Clear debug graphics
    if (this.debug.showGrid || this.debug.showColliders) {
      this.debugGraphics.clear();
    }
    
    // Update spatial grid
    this.updateSpatialGrid();
    
    // Update all systems
    for (const system of this.systems) {
      if (system.update) {
        system.update(this, this.deltaTime);
      }
    }
    
    // Render debug info
    if (this.debug.showGrid) {
      this.renderDebugGrid();
    }
  }
  
  // Update spatial hash grid with current entities
  updateSpatialGrid() {
    this.spatialGrid.clear();
    
    // Get all entities with position and collider components
    this.world.each((entity) => {
      if (entity.position && entity.collider) {
        this.spatialGrid.insertEntity(entity);
        
        // Render collider debug visuals
        if (this.debug.showColliders) {
          this.debugGraphics.lineStyle(1, 0xff0000);
          this.debugGraphics.drawCircle(
            entity.position.x,
            entity.position.y,
            entity.collider.radius
          );
        }
      }
    });
  }
  
  // Find potential collision candidates efficiently
  findCollisionCandidates(entity, entityType = null) {
    return this.spatialGrid.getNearbyEntities(entity, entityType);
  }
  
  // Check collision between two entities
  checkCollision(entityA, entityB) {
    this.stats.collisionChecks++;
    
    if (!entityA.position || !entityA.collider || 
        !entityB.position || !entityB.collider) {
      return false;
    }
    
    const dx = entityB.position.x - entityA.position.x;
    const dy = entityB.position.y - entityA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (entityA.collider.radius + entityB.collider.radius);
  }
  
  // Create a new entity
  createEntity() {
    return this.world.createEntity();
  }
  
  // Remove an entity
  removeEntity(entity) {
    // Remove from spatial grid if it has position
    if (entity.position) {
      this.spatialGrid.removeEntity(entity);
    }
    
    // Remove sprite from container if it has one
    if (entity.sprite && entity.sprite.pixiSprite) {
      this.gameContainer.removeChild(entity.sprite.pixiSprite);
    }
    
    // Remove from world
    entity.destroy();
  }
  
  // Change game state
  setGameState(state) {
    this.gameState = state;
    // Trigger event for systems to respond
    for (const system of this.systems) {
      if (system.onGameStateChanged) {
        system.onGameStateChanged(this, state);
      }
    }
  }
  
  // Handle window resize
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.options.width = width;
    this.options.height = height;
    
    this.app.renderer.resize(width, height);
    
    // Update spatial grid dimensions
    this.spatialGrid.resize(width, height);
    
    // Notify systems of resize
    for (const system of this.systems) {
      if (system.onResize) {
        system.onResize(this, width, height);
      }
    }
  }
  
  // Render debug grid
  renderDebugGrid() {
    const grid = this.spatialGrid;
    this.debugGraphics.lineStyle(1, 0x00ff00, 0.3);
    
    // Draw vertical grid lines
    for (let x = 0; x <= this.options.width; x += grid.cellSize) {
      this.debugGraphics.moveTo(x, 0);
      this.debugGraphics.lineTo(x, this.options.height);
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= this.options.height; y += grid.cellSize) {
      this.debugGraphics.moveTo(0, y);
      this.debugGraphics.lineTo(this.options.width, y);
    }
  }
  
  // Start the game
  start() {
    this.setGameState('playing');
    this.isPaused = false;
    this.lastUpdateTime = performance.now();
  }
  
  // Pause the game
  pause() {
    this.isPaused = true;
  }
  
  // Resume the game
  resume() {
    this.isPaused = false;
    this.lastUpdateTime = performance.now();
  }
  
  // Stop the game
  stop() {
    this.setGameState('gameover');
  }
  
  // Destroy the game engine
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    
    // Destroy all systems
    for (const system of this.systems) {
      if (system.destroy) {
        system.destroy();
      }
    }
    
    // Destroy PIXI application
    this.app.destroy(true, {
      children: true,
      texture: true,
      baseTexture: true
    });
  }
}

export default GameEngine; 