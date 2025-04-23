import World from './World';
import Component from './Component';
import System from './System';

// Example usage of the ECS architecture

// 1. Define some component types
class PositionComponent extends Component {
  constructor(x = 0, y = 0) {
    super('position', { x, y });
  }
}

class VelocityComponent extends Component {
  constructor(vx = 0, vy = 0) {
    super('velocity', { vx, vy });
  }
}

class RenderableComponent extends Component {
  constructor(shape = 'circle', color = 'red', radius = 10) {
    super('renderable', { shape, color, radius });
  }
}

// 2. Define some systems
class MovementSystem extends System {
  constructor() {
    super({
      priority: 1,
      requiredComponents: ['position', 'velocity']
    });
  }

  update(deltaTime) {
    const entities = this.getEntities();
    
    entities.forEach(entity => {
      const position = entity.getComponent('position');
      const velocity = entity.getComponent('velocity');
      
      // Update position based on velocity
      position.x += velocity.vx * deltaTime;
      position.y += velocity.vy * deltaTime;
    });
  }
}

class RenderSystem extends System {
  constructor(context) {
    super({
      priority: 2,
      requiredComponents: ['position', 'renderable']
    });
    this.context = context;
  }

  update() {
    const entities = this.getEntities();
    
    // Clear the canvas
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    
    entities.forEach(entity => {
      const position = entity.getComponent('position');
      const renderable = entity.getComponent('renderable');
      
      // Draw the entity
      this.context.fillStyle = renderable.color;
      this.context.beginPath();
      
      if (renderable.shape === 'circle') {
        this.context.arc(position.x, position.y, renderable.radius, 0, Math.PI * 2);
      } else if (renderable.shape === 'square') {
        const size = renderable.radius * 2;
        this.context.rect(position.x - renderable.radius, position.y - renderable.radius, size, size);
      }
      
      this.context.fill();
    });
  }
}

// Example of how to use the ECS to create a simple game
function createSimpleGame(canvasContext) {
  // Create the world
  const world = new World();
  
  // Add systems
  world.addSystem(new MovementSystem());
  world.addSystem(new RenderSystem(canvasContext));
  
  // Create some entities
  // Player
  const player = world.createEntity();
  player.addComponent(new PositionComponent(100, 100));
  player.addComponent(new VelocityComponent(0, 0));
  player.addComponent(new RenderableComponent('circle', 'blue', 15));
  player.addTag('player');
  
  // Some enemies
  for (let i = 0; i < 5; i++) {
    const enemy = world.createEntity();
    enemy.addComponent(new PositionComponent(Math.random() * 400, Math.random() * 400));
    enemy.addComponent(new VelocityComponent((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50));
    enemy.addComponent(new RenderableComponent('square', 'red', 10));
    enemy.addTag('enemy');
  }
  
  // Game loop
  let lastTime = 0;
  
  function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;
    
    // Update the world
    world.update(deltaTime);
    
    // Request the next frame
    requestAnimationFrame(gameLoop);
  }
  
  // Start the game loop
  requestAnimationFrame(gameLoop);
  
  // Return the world for further manipulation
  return world;
}

export { 
  PositionComponent,
  VelocityComponent,
  RenderableComponent,
  MovementSystem,
  RenderSystem,
  createSimpleGame
}; 