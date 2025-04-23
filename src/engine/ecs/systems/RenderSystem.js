import System from '../System';

/**
 * System responsible for rendering all entities with Renderer components
 */
class RenderSystem extends System {
  /**
   * Creates a new RenderSystem
   * @param {Object} options - Configuration options
   * @param {HTMLCanvasElement} options.canvas - The canvas to render to
   * @param {boolean} [options.clearBeforeRender=true] - Whether to clear the canvas before rendering
   * @param {string} [options.backgroundColor='#000000'] - Background color when clearing the canvas
   */
  constructor({ canvas, clearBeforeRender = true, backgroundColor = '#000000' } = {}) {
    super({
      priority: 100,
      requiredComponents: ['Renderer']
    });
    
    /**
     * Canvas element
     * @type {HTMLCanvasElement}
     */
    this.canvas = canvas;
    
    /**
     * Canvas rendering context
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = canvas ? canvas.getContext('2d') : null;
    
    /**
     * Whether to clear the canvas before rendering
     * @type {boolean}
     */
    this.clearBeforeRender = clearBeforeRender;
    
    /**
     * Background color when clearing the canvas
     * @type {string}
     */
    this.backgroundColor = backgroundColor;
  }
  
  /**
   * Sorts entities by z-index before rendering
   * @param {Array<Entity>} entities - Entities to sort
   * @returns {Array<Entity>} Sorted entities
   */
  sortByZIndex(entities) {
    return entities.sort((a, b) => {
      const rendererA = a.getComponent('Renderer');
      const rendererB = b.getComponent('Renderer');
      
      if (!rendererA || !rendererB) return 0;
      const zIndexA = rendererA.zIndex || 0;
      const zIndexB = rendererB.zIndex || 0;
      
      return zIndexA - zIndexB;
    });
  }
  
  /**
   * Updates the system, rendering all entities with Renderer and Transform components
   * @param {number} deltaTime - Time elapsed since the last update
   */
  update(deltaTime) {
    if (!this.canvas || !this.ctx) {
      console.error("RenderSystem: Canvas or context is missing");
      return;
    }
    
    // Clear the canvas if needed
    if (this.clearBeforeRender) {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Get all entities with Renderer components
    const renderableEntities = this.getEntities();
    console.log(`RenderSystem: Found ${renderableEntities.length} renderable entities`);
    
    // Sort entities by z-index
    const sortedEntities = this.sortByZIndex(renderableEntities);
    
    // Render each entity
    for (const entity of sortedEntities) {
      const renderer = entity.getComponent('Renderer');
      
      // Skip if not visible
      if (!renderer || !renderer.visible) continue;
      
      const transform = entity.getComponent('Transform');
      if (!transform) {
        console.warn(`RenderSystem: Entity has renderer but no transform`, entity.id);
        continue;
      }
      
      // Log entity being rendered
      console.log(`RenderSystem: Rendering entity ${entity.id} at (${transform.x}, ${transform.y})`);
      
      // Save the current context state
      this.ctx.save();
      
      // Set up the transform
      this.ctx.translate(transform.x, transform.y);
      this.ctx.rotate(transform.rotation);
      this.ctx.scale(transform.scale || 1, transform.scale || 1);
      
      // Use custom render function if available
      if (typeof renderer.render === 'function') {
        renderer.render(this.ctx, entity);
      } else if (renderer.type) {
        // Draw based on renderer type
        renderer.draw(this.ctx, transform);
      } else {
        console.warn(`RenderSystem: Entity ${entity.id} has no render method or type`);
      }
      
      // Restore the context state
      this.ctx.restore();
    }
  }
}

export default RenderSystem; 