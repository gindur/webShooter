import Component from '../Component';

/**
 * Renderer Component
 * 
 * Handles the visual representation of an entity
 */
class Renderer extends Component {
  /**
   * Create a new Renderer component
   * @param {Object} options - Configuration options
   * @param {string} [options.type='circle'] - Shape type ('circle', 'rect', 'sprite')
   * @param {number} [options.radius=10] - Circle radius
   * @param {number} [options.width=20] - Rectangle width
   * @param {number} [options.height=20] - Rectangle height
   * @param {string} [options.color='#FFFFFF'] - Shape color
   * @param {HTMLImageElement} [options.spriteSheet=null] - Sprite sheet image
   * @param {number} [options.frameIndex=0] - Frame index in sprite sheet
   * @param {number} [options.alpha=1] - Alpha transparency
   * @param {boolean} [options.visible=true] - Whether the entity is visible
   * @param {Function} [options.render=null] - Custom render function
   * @param {number} [options.zIndex=0] - Z-index for rendering order
   */
  constructor({
    type = 'circle',
    radius = 10,
    width = 20,
    height = 20,
    color = '#FFFFFF',
    fillStyle = '#FFFFFF',
    spriteSheet = null,
    frameIndex = 0,
    alpha = 1,
    visible = true,
    render = null,
    zIndex = 0
  } = {}) {
    super('Renderer');
    
    /**
     * Shape type
     * @type {string}
     */
    this.type = type;
    
    /**
     * Shape radius
     * @type {number}
     */
    this.radius = radius;
    
    /**
     * Rectangle width
     * @type {number}
     */
    this.width = width;
    
    /**
     * Rectangle height
     * @type {number}
     */
    this.height = height;
    
    /**
     * Shape color
     * @type {string}
     */
    this.color = color;
    
    /**
     * Fill style (same as color, kept for compatibility)
     * @type {string}
     */
    this.fillStyle = fillStyle || color;
    
    /**
     * Sprite sheet image
     * @type {HTMLImageElement}
     */
    this.spriteSheet = spriteSheet;
    
    /**
     * Frame index in sprite sheet
     * @type {number}
     */
    this.frameIndex = frameIndex;
    
    /**
     * Alpha transparency
     * @type {number}
     */
    this.alpha = alpha;
    
    /**
     * Whether the entity is visible
     * @type {boolean}
     */
    this.visible = visible;
    
    /**
     * Custom render function
     * @type {Function}
     */
    this.render = render;
    
    /**
     * Z-index for rendering order
     * @type {number}
     */
    this.zIndex = zIndex;
  }
  
  /**
   * Draw this entity on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Transform} transform - Transform component of the entity
   */
  draw(ctx, transform) {
    if (!this.visible) return;
    
    ctx.save();
    
    // Apply alpha
    ctx.globalAlpha = this.alpha;
    
    // Apply fillStyle if available
    if (this.fillStyle) {
      ctx.fillStyle = this.fillStyle;
    }
    
    // Use custom render function if provided
    if (typeof this.render === 'function') {
      this.render(ctx);
    } else {
      // Draw based on type
      switch (this.type) {
        case 'circle':
          this.drawCircle(ctx);
          break;
        case 'rect':
          this.drawRect(ctx);
          break;
        case 'sprite':
          this.drawSprite(ctx);
          break;
        default:
          break;
      }
    }
    
    ctx.restore();
  }
  
  /**
   * Draw a circle
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawCircle(ctx) {
    ctx.fillStyle = this.fillStyle || this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw a rectangle
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawRect(ctx) {
    ctx.fillStyle = this.fillStyle || this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
  }
  
  /**
   * Draw a sprite
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawSprite(ctx) {
    if (!this.spriteSheet) return;
    
    const frameWidth = this.spriteSheet.width / this.spriteSheet.columns;
    const frameHeight = this.spriteSheet.height / this.spriteSheet.rows;
    
    const col = this.frameIndex % this.spriteSheet.columns;
    const row = Math.floor(this.frameIndex / this.spriteSheet.columns);
    
    ctx.drawImage(
      this.spriteSheet.image,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
  }
  
  /**
   * Set color
   * @param {string} color - CSS color string
   */
  setColor(color) {
    this.color = color;
    this.fillStyle = color;
  }
  
  /**
   * Set fill style
   * @param {string} fillStyle - CSS color string
   */
  setFillStyle(fillStyle) {
    this.fillStyle = fillStyle;
  }
  
  /**
   * Set visibility
   * @param {boolean} visible - Whether the entity should be visible
   */
  setVisible(visible) {
    this.visible = visible;
  }
  
  /**
   * Set alpha transparency
   * @param {number} alpha - Alpha value between 0 and 1
   */
  setAlpha(alpha) {
    this.alpha = alpha;
  }
}

export default Renderer; 