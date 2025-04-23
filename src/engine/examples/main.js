import SimpleGame from './SimpleGame';

/**
 * Initialize the example game when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  canvas.style.backgroundColor = '#222222';
  
  // Add canvas to the document
  document.body.appendChild(canvas);
  
  // Initialize the game
  const game = SimpleGame.init(canvas);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.resize(canvas.width, canvas.height);
    
    // Update boundary entity
    const boundary = game.world.getEntitiesByTag('boundary').values().next().value;
    if (boundary) {
      const transform = boundary.getComponent('Transform');
      transform.x = canvas.width / 2;
      transform.y = canvas.height / 2;
    }
    
    // Update physics bounds for all entities with physics
    const entities = game.world.getEntitiesByComponent('Physics');
    for (const entity of entities) {
      const physics = entity.getComponent('Physics');
      const collider = entity.getComponent('Collider');
      
      // Skip if no collider or physics
      if (!collider) continue;
      
      let radius = 10;
      if (collider.type === 'circle') {
        radius = collider.radius;
      }
      
      // Set bounds to keep the entity within the canvas
      physics.setBounds(
        radius,
        radius,
        canvas.width - radius,
        canvas.height - radius
      );
    }
  });
  
  // Log some information
  console.log('ECS Example Game initialized!');
  console.log('Controls:');
  console.log('- WASD or Arrow Keys to move the player');
  console.log('- Click to add bouncing balls');
  console.log('- Space to add a new player');
});

// Export the SimpleGame class for testing
export { SimpleGame }; 