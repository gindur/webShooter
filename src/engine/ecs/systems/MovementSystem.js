import System from '../System';

/**
 * System responsible for updating entity positions based on velocity
 */
class MovementSystem extends System {
  /**
   * Creates a new MovementSystem
   */
  constructor() {
    super({
      priority: 10,
      requiredComponents: ['Transform', 'Physics']
    });
  }
  
  /**
   * Updates the position of entities based on their velocity
   * @param {number} deltaTime - Time elapsed since the last update in seconds
   */
  update(deltaTime) {
    // Get all entities with both Transform and Physics components
    const movingEntities = this.getEntities();
    
    for (const entity of movingEntities) {
      const transform = entity.getComponent('Transform');
      const physics = entity.getComponent('Physics');
      
      if (!transform || !physics) continue;
      
      // Apply velocity to position
      transform.x += physics.velocityX * deltaTime;
      transform.y += physics.velocityY * deltaTime;
      
      // Apply friction if enabled
      if (physics.friction > 0) {
        const frictionFactor = Math.pow(1 - physics.friction, deltaTime);
        physics.velocityX *= frictionFactor;
        physics.velocityY *= frictionFactor;
        
        // Stop very slow movement
        if (Math.abs(physics.velocityX) < 0.001) physics.velocityX = 0;
        if (Math.abs(physics.velocityY) < 0.001) physics.velocityY = 0;
      }
      
      // Apply rotation velocity
      if (physics.rotationVelocity !== 0) {
        transform.rotation += physics.rotationVelocity * deltaTime;
      }
      
      // Apply bounds constraints if defined
      if (physics.bounds) {
        const { minX, minY, maxX, maxY } = physics.bounds;
        
        if (transform.x < minX) {
          transform.x = minX;
          if (physics.bounceX) {
            physics.velocityX = -physics.velocityX * physics.bounceX;
          } else {
            physics.velocityX = 0;
          }
        } else if (transform.x > maxX) {
          transform.x = maxX;
          if (physics.bounceX) {
            physics.velocityX = -physics.velocityX * physics.bounceX;
          } else {
            physics.velocityX = 0;
          }
        }
        
        if (transform.y < minY) {
          transform.y = minY;
          if (physics.bounceY) {
            physics.velocityY = -physics.velocityY * physics.bounceY;
          } else {
            physics.velocityY = 0;
          }
        } else if (transform.y > maxY) {
          transform.y = maxY;
          if (physics.bounceY) {
            physics.velocityY = -physics.velocityY * physics.bounceY;
          } else {
            physics.velocityY = 0;
          }
        }
      }
    }
  }
}

export default MovementSystem; 