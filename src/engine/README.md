# ECS Game Engine

A lightweight Entity-Component-System (ECS) game engine for JavaScript and Canvas-based games.

## Architecture

The engine is built around the ECS architecture:

- **Entities**: Game objects that serve as containers for components
- **Components**: Data structures that define the properties of entities
- **Systems**: Logic that processes entities with specific components

## Core Features

- Flexible ECS architecture
- Lightweight and performant
- Canvas rendering
- Physics simulation
- Collision detection
- Input handling
- Scene management
- Game loop

## Core Classes

### Entity
Represents a game object. Entities are containers for components and are identified by tags.

### Component
Base class for all components. Components are data containers attached to entities.

### System
Base class for all systems. Systems process entities with specific components.

### World
Manages all entities and systems. It handles the registration and retrieval of entities and components.

### Game
Main game class that manages the game loop, canvas, and core systems.

## Included Components

- **Transform**: Position, rotation, and scale
- **Renderer**: Visual representation
- **Physics**: Velocity, mass, and movement properties
- **Collider**: Collision detection

## Included Systems

- **RenderSystem**: Handles rendering entities to the canvas
- **MovementSystem**: Updates entity positions based on physics
- **CollisionSystem**: Detects and resolves collisions
- **InputSystem**: Handles keyboard and mouse input

## Example Usage

```javascript
import Game from './engine/Game';
import GameObject from './engine/ecs/GameObject';

// Create a game instance
const canvas = document.getElementById('game-canvas');
const game = new Game({
  canvas,
  width: 800,
  height: 600,
  debug: true
});

// Initialize the game
game.init();

// Create a scene
game.registerScene('main', (world, game) => {
  // Create a player entity
  const player = GameObject.createCircle(world, {
    x: 400,
    y: 300,
    radius: 20,
    fillStyle: 'red',
    physics: true,
    collider: true,
    tag: 'player'
  });
  
  // Add custom behavior
  player.addComponent('PlayerControl', {
    update: (deltaTime) => {
      // Custom logic here
    }
  });
});

// Load the scene and start the game
game.loadScene('main');
game.start();
```

## Running the Example

The engine includes a simple example game. To run it:

1. Import the example module:
```javascript
import { SimpleGame } from './engine/examples/main';
```

2. Create a canvas and initialize the example:
```javascript
const canvas = document.getElementById('game-canvas');
const game = SimpleGame.init(canvas);
```

## Creating Custom Components

To create a custom component, extend the Component class:

```javascript
import Component from './engine/ecs/Component';

class Health extends Component {
  constructor({ maxHealth = 100, currentHealth = 100 } = {}) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth;
  }
  
  damage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    return this.currentHealth <= 0;
  }
  
  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }
}
```

## Creating Custom Systems

To create a custom system, extend the System class:

```javascript
import System from './engine/ecs/System';

class HealthSystem extends System {
  constructor(world) {
    super(world);
    this.priority = 50; // Set priority (lower runs earlier)
  }
  
  update(deltaTime) {
    const entities = this.world.getEntitiesByComponent('Health');
    
    for (const entity of entities) {
      const health = entity.getComponent('Health');
      
      // Process health logic
      if (health.currentHealth <= 0) {
        entity.destroy();
      }
    }
  }
}
```

## License

MIT 