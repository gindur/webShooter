import Component from '../Component';

/**
 * Collider component for collision detection
 */
class Collider extends Component {
  /**
   * Create a new Collider component
   * @param {Object} options - Configuration options
   * @param {string} [options.type='circle'] - Collider type ('circle', 'rectangle')
   * @param {number} [options.radius=10] - Radius for circle colliders
   * @param {number} [options.width=10] - Width for rectangle colliders
   * @param {number} [options.height=10] - Height for rectangle colliders
   * @param {number} [options.offsetX=0] - X offset from entity center
   * @param {number} [options.offsetY=0] - Y offset from entity center
   * @param {number} [options.layer=0] - Collision layer
   * @param {Array<number>} [options.collidesWith=[0]] - Layers this collider collides with
   * @param {boolean} [options.isTrigger=false] - If true, generates events but doesn't physically collide
   */
  constructor({
    type = 'circle',
    radius = 10,
    width = 10,
    height = 10,
    offsetX = 0,
    offsetY = 0,
    layer = 0,
    collidesWith = [0],
    isTrigger = false
  } = {}) {
    super();
    
    /**
     * Collider type
     * @type {string}
     */
    this.type = type;
    
    /**
     * Radius for circle colliders
     * @type {number}
     */
    this.radius = radius;
    
    /**
     * Width for rectangle colliders
     * @type {number}
     */
    this.width = width;
    
    /**
     * Height for rectangle colliders
     * @type {number}
     */
    this.height = height;
    
    /**
     * X offset from entity center
     * @type {number}
     */
    this.offsetX = offsetX;
    
    /**
     * Y offset from entity center
     * @type {number}
     */
    this.offsetY = offsetY;
    
    /**
     * Collision layer
     * @type {number}
     */
    this.layer = layer;
    
    /**
     * Layers this collider collides with
     * @type {Array<number>}
     */
    this.collidesWith = collidesWith;
    
    /**
     * If true, generates events but doesn't physically collide
     * @type {boolean}
     */
    this.isTrigger = isTrigger;
  }
  
  /**
   * Check if this collider can collide with another collider
   * @param {Collider} other - Other collider
   * @returns {boolean} True if collision is possible
   */
  canCollideWith(other) {
    return this.collidesWith.includes(other.layer);
  }
  
  /**
   * Called when a collision starts
   * Override this in derived classes
   * @param {Entity} other - Other entity
   */
  onCollisionStart(other) {
    // Default implementation does nothing
  }
  
  /**
   * Called every frame for ongoing collisions
   * Override this in derived classes
   * @param {Entity} other - Other entity
   */
  onCollisionStay(other) {
    // Default implementation does nothing
  }
  
  /**
   * Called when a collision ends
   * Override this in derived classes
   * @param {Entity} other - Other entity
   */
  onCollisionEnd(other) {
    // Default implementation does nothing
  }
  
  /**
   * Set collision layers
   * @param {number} layer - This collider's layer
   * @param {Array<number>} collidesWith - Layers this collider collides with
   * @returns {Collider} This component for chaining
   */
  setLayers(layer, collidesWith) {
    this.layer = layer;
    this.collidesWith = collidesWith;
    return this;
  }
  
  /**
   * Set circle properties
   * @param {number} radius - Circle radius
   * @returns {Collider} This component for chaining
   */
  setCircle(radius) {
    this.type = 'circle';
    this.radius = radius;
    return this;
  }
  
  /**
   * Set rectangle properties
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {Collider} This component for chaining
   */
  setRectangle(width, height) {
    this.type = 'rectangle';
    this.width = width;
    this.height = height;
    return this;
  }
  
  /**
   * Set offset from entity center
   * @param {number} x - X offset
   * @param {number} y - Y offset
   * @returns {Collider} This component for chaining
   */
  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
    return this;
  }
  
  /**
   * Set trigger state
   * @param {boolean} isTrigger - If true, generates events but doesn't physically collide
   * @returns {Collider} This component for chaining
   */
  setTrigger(isTrigger) {
    this.isTrigger = isTrigger;
    return this;
  }
}

export default Collider; 