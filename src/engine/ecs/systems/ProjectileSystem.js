import System from '../System';

/**
 * System for managing projectiles, including lifetime and boundary checks
 */
class ProjectileSystem extends System {
  /**
   * Create a new ProjectileSystem
   * @param {Object} options - System configuration options
   * @param {number} options.width - Game width for boundary checks
   * @param {number} options.height - Game height for boundary checks
   */
  constructor(options = {}) {
    super({
      priority: 20, // Run after movement but before collision
      requiredComponents: ['Lifetime']
    });
    
    this.width = options.width || 800;
    this.height = options.height || 600;
  }
  
  /**
   * Update all projectiles, checking lifetime and boundaries
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    if (!this.enabled || !this.world) return;
    
    // Get all entities with Lifetime component
    const entities = this.getEntities();
    
    for (const entity of entities) {
      const transform = entity.getComponent('Transform');
      const lifetime = entity.getComponent('Lifetime');
      
      if (!transform || !lifetime) continue;
      
      // Calculate distance traveled
      const dx = transform.x - lifetime.originX;
      const dy = transform.y - lifetime.originY;
      lifetime.distanceTraveled = Math.sqrt(dx * dx + dy * dy);
      
      // Check if projectile should be destroyed
      if (lifetime.distanceTraveled > lifetime.maxDistance || 
          transform.x < 0 || transform.x > this.width ||
          transform.y < 0 || transform.y > this.height) {
        console.log(`Destroying projectile at (${transform.x}, ${transform.y})`);
        entity.destroy();
      }
    }
  }
}

export default ProjectileSystem; 