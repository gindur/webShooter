import Component from '../Component';

/**
 * Transform Component
 * 
 * Handles position, velocity, and rotation of entities
 */
class Transform extends Component {
  /**
   * Create a new Transform component
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {number} [options.velocityX=0] - X velocity
   * @param {number} [options.velocityY=0] - Y velocity
   * @param {number} [options.rotation=0] - Rotation in radians
   * @param {number} [options.scale=1] - Scale
   */
  constructor({
    x = 0,
    y = 0,
    velocityX = 0,
    velocityY = 0,
    rotation = 0,
    scale = 1
  } = {}) {
    super();
    
    /**
     * X position
     * @type {number}
     */
    this.x = x;
    
    /**
     * Y position
     * @type {number}
     */
    this.y = y;
    
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
     * Rotation in radians
     * @type {number}
     */
    this.rotation = rotation;
    
    /**
     * Scale
     * @type {number}
     */
    this.scale = scale;
  }

  /**
   * Set position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set velocity
   * @param {number} x - Velocity X
   * @param {number} y - Velocity Y
   */
  setVelocity(x, y) {
    this.velocityX = x;
    this.velocityY = y;
  }

  /**
   * Set rotation angle in radians
   * @param {number} angle - Rotation angle
   */
  setRotation(angle) {
    this.rotation = angle;
  }

  /**
   * Move by delta
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

export default Transform; 