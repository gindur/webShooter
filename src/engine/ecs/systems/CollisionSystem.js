import System from '../System';

/**
 * System responsible for detecting and resolving collisions between entities
 */
class CollisionSystem extends System {
  /**
   * Creates a new CollisionSystem
   */
  constructor() {
    super({
      priority: 20,
      requiredComponents: ['Collider']
    });
    
    /**
     * Map of collision pairs that are currently colliding
     * @type {Map<string, boolean>}
     */
    this.collidingPairs = new Map();
    
    /**
     * Collision callbacks
     * @type {Map<string, Function>}
     */
    this.collisionCallbacks = new Map();
  }
  
  /**
   * Generate a unique key for a collision pair
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   * @returns {string} Unique key
   */
  getPairKey(entityA, entityB) {
    // Ensure the key is the same regardless of parameter order
    const idA = entityA.id;
    const idB = entityB.id;
    return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
  }
  
  /**
   * Register a collision callback
   * @param {string} tagA - First entity tag
   * @param {string} tagB - Second entity tag
   * @param {Function} callback - Callback function
   * @returns {CollisionSystem} This system for chaining
   */
  onCollision(tagA, tagB, callback) {
    const key = tagA < tagB ? `${tagA}:${tagB}` : `${tagB}:${tagA}`;
    this.collisionCallbacks.set(key, callback);
    return this;
  }
  
  /**
   * Check if two entities are colliding
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   * @returns {boolean} True if colliding
   */
  checkCollision(entityA, entityB) {
    if (!entityA || !entityB) return false;
    
    const colliderA = entityA.getComponent('Collider');
    const colliderB = entityB.getComponent('Collider');
    const transformA = entityA.getComponent('Transform');
    const transformB = entityB.getComponent('Transform');
    
    if (!colliderA || !colliderB || !transformA || !transformB) return false;
    
    // For now, we only support circle colliders
    if (colliderA.type === 'circle' && colliderB.type === 'circle') {
      const dx = transformA.x - transformB.x;
      const dy = transformA.y - transformB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (colliderA.radius + colliderB.radius);
    }
    
    // We could add rectangle and other collision types later
    return false;
  }
  
  /**
   * Resolve a collision between two entities with physics
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   */
  resolveCollision(entityA, entityB) {
    const physicsA = entityA.getComponent('Physics');
    const physicsB = entityB.getComponent('Physics');
    const transformA = entityA.getComponent('Transform');
    const transformB = entityB.getComponent('Transform');
    const colliderA = entityA.getComponent('Collider');
    const colliderB = entityB.getComponent('Collider');
    
    if (!physicsA || !physicsB || !transformA || !transformB || !colliderA || !colliderB) return;
    
    // Calculate collision normal
    const dx = transformB.x - transformA.x;
    const dy = transformB.y - transformA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Avoid division by zero
    
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate relative velocity
    const relVelocityX = physicsB.velocityX - physicsA.velocityX;
    const relVelocityY = physicsB.velocityY - physicsA.velocityY;
    
    // Calculate relative velocity in terms of the normal direction
    const velocityAlongNormal = relVelocityX * nx + relVelocityY * ny;
    
    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;
    
    // Calculate restitution (bounce)
    const restitution = Math.min(
      Math.max(physicsA.bounceX || 0, physicsA.bounceY || 0),
      Math.max(physicsB.bounceX || 0, physicsB.bounceY || 0)
    );
    
    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = (physicsA.mass || 1) + (physicsB.mass || 1);
    
    if (totalMass === 0) return; // Avoid division by zero
    
    const impulseA = impulseScalar * ((physicsB.mass || 1) / totalMass);
    const impulseB = impulseScalar * ((physicsA.mass || 1) / totalMass);
    
    // Apply impulse
    physicsA.velocityX -= nx * impulseA;
    physicsA.velocityY -= ny * impulseA;
    physicsB.velocityX += nx * impulseB;
    physicsB.velocityY += ny * impulseB;
    
    // Correct position (move entities apart)
    const correctionDistance = (colliderA.radius + colliderB.radius) - distance;
    const percent = 0.5; // Penetration percentage to correct
    const correction = percent * correctionDistance;
    
    if (correctionDistance > 0) {
      transformA.x -= nx * correction * ((physicsB.mass || 1) / totalMass);
      transformA.y -= ny * correction * ((physicsB.mass || 1) / totalMass);
      transformB.x += nx * correction * ((physicsA.mass || 1) / totalMass);
      transformB.y += ny * correction * ((physicsA.mass || 1) / totalMass);
    }
  }
  
  /**
   * Updates the collision system, detecting and resolving collisions
   * @param {number} deltaTime - Time elapsed since the last update
   */
  update(deltaTime) {
    const collidableArray = this.getEntities();
    
    // Reset the colliding state of all pairs
    const newCollidingPairs = new Map();
    
    // Check all pairs of collidable entities
    for (let i = 0; i < collidableArray.length; i++) {
      const entityA = collidableArray[i];
      
      for (let j = i + 1; j < collidableArray.length; j++) {
        const entityB = collidableArray[j];
        
        // Skip if entities are on different collision layers that don't interact
        const colliderA = entityA.getComponent('Collider');
        const colliderB = entityB.getComponent('Collider');
        
        if (colliderA.canCollideWith && !colliderA.canCollideWith(colliderB)) continue;
        
        const pairKey = this.getPairKey(entityA, entityB);
        const wasColliding = this.collidingPairs.get(pairKey) || false;
        const isColliding = this.checkCollision(entityA, entityB);
        
        if (isColliding) {
          newCollidingPairs.set(pairKey, true);
          
          // Resolve the collision if both entities have physics components
          if (entityA.hasComponent('Physics') && entityB.hasComponent('Physics')) {
            this.resolveCollision(entityA, entityB);
          }
          
          // Call appropriate collision callbacks
          if (!wasColliding) {
            // First time collision this frame
            this.handleCollisionStart(entityA, entityB);
          }
          
          // Collision is ongoing
          this.handleCollisionStay(entityA, entityB);
        } else if (wasColliding) {
          // Collision just ended
          this.handleCollisionEnd(entityA, entityB);
        }
      }
    }
    
    // Update the colliding pairs
    this.collidingPairs = newCollidingPairs;
  }
  
  /**
   * Handle the start of a collision between two entities
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   */
  handleCollisionStart(entityA, entityB) {
    // Get all tags from both entities
    const tagsA = Array.from(entityA.getTags());
    const tagsB = Array.from(entityB.getTags());
    
    // Check for callbacks registered for any combination of tags
    for (const tagA of tagsA) {
      for (const tagB of tagsB) {
        const key = tagA < tagB ? `${tagA}:${tagB}` : `${tagB}:${tagA}`;
        const callback = this.collisionCallbacks.get(key);
        
        if (callback) {
          callback(entityA, entityB, 'start');
        }
      }
    }
    
    // Notify colliders about the collision start
    const colliderA = entityA.getComponent('Collider');
    const colliderB = entityB.getComponent('Collider');
    
    if (colliderA && typeof colliderA.onCollisionStart === 'function') {
      colliderA.onCollisionStart(entityB);
    }
    
    if (colliderB && typeof colliderB.onCollisionStart === 'function') {
      colliderB.onCollisionStart(entityA);
    }
  }
  
  /**
   * Handle an ongoing collision between two entities
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   */
  handleCollisionStay(entityA, entityB) {
    // Notify colliders about the ongoing collision
    const colliderA = entityA.getComponent('Collider');
    const colliderB = entityB.getComponent('Collider');
    
    if (colliderA && typeof colliderA.onCollisionStay === 'function') {
      colliderA.onCollisionStay(entityB);
    }
    
    if (colliderB && typeof colliderB.onCollisionStay === 'function') {
      colliderB.onCollisionStay(entityA);
    }
  }
  
  /**
   * Handle the end of a collision between two entities
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   */
  handleCollisionEnd(entityA, entityB) {
    // Notify colliders about the collision end
    const colliderA = entityA.getComponent('Collider');
    const colliderB = entityB.getComponent('Collider');
    
    if (colliderA && typeof colliderA.onCollisionEnd === 'function') {
      colliderA.onCollisionEnd(entityB);
    }
    
    if (colliderB && typeof colliderB.onCollisionEnd === 'function') {
      colliderB.onCollisionEnd(entityA);
    }
  }
}

export default CollisionSystem; 