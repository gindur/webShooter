import Transform from './components/Transform';
import Renderer from './components/Renderer';
import Physics from './components/Physics';
import Collider from './components/Collider';

/**
 * Helper class for creating game objects with common components
 */
class GameObject {
  /**
   * Create a new game object (entity with common components)
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @returns {Entity} The created entity
   */
  static create(world, { x = 0, y = 0, tag } = {}) {
    const entity = world.createEntity();
    
    // Add a transform component
    entity.addComponent('Transform', new Transform({ x, y }));
    
    // Add tag if provided
    if (tag) {
      entity.addTag(tag);
    }
    
    return entity;
  }
  
  /**
   * Create a new game object with rendering
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @param {Object} [options.renderer] - Renderer options
   * @returns {Entity} The created entity
   */
  static createRenderable(world, { x = 0, y = 0, tag, renderer = {} } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Add a renderer component
    entity.addComponent('Renderer', new Renderer(renderer));
    
    return entity;
  }
  
  /**
   * Create a new game object with physics
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @param {Object} [options.physics] - Physics options
   * @returns {Entity} The created entity
   */
  static createPhysics(world, { x = 0, y = 0, tag, physics = {} } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Add a physics component
    entity.addComponent('Physics', new Physics(physics));
    
    return entity;
  }
  
  /**
   * Create a new game object with collision
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @param {Object} [options.collider] - Collider options
   * @returns {Entity} The created entity
   */
  static createCollider(world, { x = 0, y = 0, tag, collider = {} } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Add a collider component
    entity.addComponent('Collider', new Collider(collider));
    
    return entity;
  }
  
  /**
   * Create a complete game object with transform, renderer, physics, and collider
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @param {Object} [options.renderer] - Renderer options
   * @param {Object} [options.physics] - Physics options
   * @param {Object} [options.collider] - Collider options
   * @returns {Entity} The created entity
   */
  static createComplete(world, { 
    x = 0, 
    y = 0, 
    tag,
    renderer = {},
    physics = {},
    collider = {}
  } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Add components
    entity.addComponent('Renderer', new Renderer(renderer));
    entity.addComponent('Physics', new Physics(physics));
    entity.addComponent('Collider', new Collider(collider));
    
    return entity;
  }
  
  /**
   * Create a circle
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {number} [options.radius=10] - Circle radius
   * @param {string} [options.fillStyle='#ff0000'] - Fill color
   * @param {boolean} [options.physics=false] - Whether to add physics
   * @param {boolean} [options.collider=false] - Whether to add a collider
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @returns {Entity} The created entity
   */
  static createCircle(world, {
    x = 0,
    y = 0,
    radius = 10,
    fillStyle = '#ff0000',
    physics = false,
    collider = false,
    tag
  } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Create a renderer for a circle
    entity.addComponent('Renderer', new Renderer({
      type: 'circle',
      radius,
      fillStyle,
      visible: true
    }));
    
    // Add physics if requested
    if (physics) {
      entity.addComponent('Physics', new Physics());
    }
    
    // Add collider if requested
    if (collider) {
      entity.addComponent('Collider', new Collider({
        type: 'circle',
        radius
      }));
    }
    
    return entity;
  }
  
  /**
   * Create a rectangle
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {number} [options.width=20] - Rectangle width
   * @param {number} [options.height=20] - Rectangle height
   * @param {string} [options.fillStyle='#ff0000'] - Fill color
   * @param {boolean} [options.physics=false] - Whether to add physics
   * @param {boolean} [options.collider=false] - Whether to add a collider
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @returns {Entity} The created entity
   */
  static createRectangle(world, {
    x = 0,
    y = 0,
    width = 20,
    height = 20,
    fillStyle = '#ff0000',
    physics = false,
    collider = false,
    tag
  } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Create a renderer for a rectangle
    entity.addComponent('Renderer', new Renderer({
      type: 'rect',
      width,
      height,
      fillStyle,
      visible: true
    }));
    
    // Add physics if requested
    if (physics) {
      entity.addComponent('Physics', new Physics());
    }
    
    // Add collider if requested
    if (collider) {
      entity.addComponent('Collider', new Collider({
        type: 'rectangle',
        width,
        height
      }));
    }
    
    return entity;
  }
  
  /**
   * Create a text entity
   * @param {World} world - The world to create the entity in
   * @param {Object} options - Configuration options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {string} [options.text=''] - Text to display
   * @param {string} [options.font='16px Arial'] - Font to use
   * @param {string} [options.fillStyle='#ffffff'] - Text color
   * @param {string} [options.align='center'] - Text alignment
   * @param {string} [options.tag] - Optional tag to add to the entity
   * @returns {Entity} The created entity
   */
  static createText(world, {
    x = 0,
    y = 0,
    text = '',
    font = '16px Arial',
    fillStyle = '#ffffff',
    align = 'center',
    tag
  } = {}) {
    const entity = this.create(world, { x, y, tag });
    
    // Store text in a closure to allow updates
    let currentText = text;
    
    // Create a renderer for text
    entity.addComponent('Renderer', new Renderer({
      fillStyle,
      render: (ctx) => {
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(currentText, 0, 0);
      },
      visible: true
    }));
    
    // Add text methods to the entity
    entity.setText = function(newText) {
      currentText = newText;
    };
    
    entity.getText = function() {
      return currentText;
    };
    
    return entity;
  }
}

export default GameObject; 