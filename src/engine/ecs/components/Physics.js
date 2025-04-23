import Component from '../Component';

/**
 * Physics component for handling velocity and physical properties
 */
class Physics extends Component {
  /**
   * Create a new Physics component
   * @param {Object} options - Configuration options
   * @param {number} [options.velocityX=0] - X velocity
   * @param {number} [options.velocityY=0] - Y velocity
   * @param {number} [options.rotationVelocity=0] - Rotation velocity in radians per second
   * @param {number} [options.friction=0] - Friction factor (0-1)
   * @param {number} [options.bounceX=0] - X bounce factor (0-1)
   * @param {number} [options.bounceY=0] - Y bounce factor (0-1)
   * @param {Object} [options.bounds=null] - Movement bounds
   * @param {number} [options.bounds.minX] - Minimum X position
   * @param {number} [options.bounds.minY] - Minimum Y position
   * @param {number} [options.bounds.maxX] - Maximum X position
   * @param {number} [options.bounds.maxY] - Maximum Y position
   * @param {number} [options.mass=1] - Mass for collision calculations
   */
  constructor({
    velocityX = 0,
    velocityY = 0,
    rotationVelocity = 0,
    friction = 0,
    bounceX = 0,
    bounceY = 0,
    bounds = null,
    mass = 1
  } = {}) {
    super();
    
    /**
     * X velocity
     * @type {number}
     */
    this.velocityX = velocityX;
    
    /**
     * Y velocity
     * @type {number}
     */
    this.velocityY = velocityY;
    
    /**
     * Rotation velocity in radians per second
     * @type {number}
     */
    this.rotationVelocity = rotationVelocity;
    
    /**
     * Friction factor (0-1)
     * @type {number}
     */
    this.friction = Math.max(0, Math.min(1, friction));
    
    /**
     * X bounce factor (0-1)
     * @type {number}
     */
    this.bounceX = Math.max(0, Math.min(1, bounceX));
    
    /**
     * Y bounce factor (0-1)
     * @type {number}
     */
    this.bounceY = Math.max(0, Math.min(1, bounceY));
    
    /**
     * Movement bounds
     * @type {Object|null}
     */
    this.bounds = bounds;
    
    /**
     * Mass for collision calculations
     * @type {number}
     */
    this.mass = Math.max(0.001, mass);
  }
  
  /**
   * Set the velocity
   * @param {number} x - X velocity
   * @param {number} y - Y velocity
   * @returns {Physics} This component for chaining
   */
  setVelocity(x, y) {
    this.velocityX = x;
    this.velocityY = y;
    return this;
  }
  
  /**
   * Apply a force to the entity
   * @param {number} forceX - X force
   * @param {number} forceY - Y force
   * @returns {Physics} This component for chaining
   */
  applyForce(forceX, forceY) {
    this.velocityX += forceX / this.mass;
    this.velocityY += forceY / this.mass;
    return this;
  }
  
  /**
   * Apply an impulse in a direction
   * @param {number} angle - Angle in radians
   * @param {number} force - Force magnitude
   * @returns {Physics} This component for chaining
   */
  applyImpulse(angle, force) {
    const forceX = Math.cos(angle) * force;
    const forceY = Math.sin(angle) * force;
    return this.applyForce(forceX, forceY);
  }
  
  /**
   * Set movement bounds
   * @param {number} minX - Minimum X position
   * @param {number} minY - Minimum Y position
   * @param {number} maxX - Maximum X position
   * @param {number} maxY - Maximum Y position
   * @returns {Physics} This component for chaining
   */
  setBounds(minX, minY, maxX, maxY) {
    this.bounds = { minX, minY, maxX, maxY };
    return this;
  }
  
  /**
   * Get the current speed
   * @returns {number} Current speed
   */
  getSpeed() {
    return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
  }
  
  /**
   * Get the current direction
   * @returns {number} Current direction in radians
   */
  getDirection() {
    return Math.atan2(this.velocityY, this.velocityX);
  }
}

export default Physics; 