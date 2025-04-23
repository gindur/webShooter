/**
 * Entity class that represents a game object in the ECS architecture
 */
class Entity {
  /**
   * Creates a new entity
   * @param {import('./World').default} world - The world this entity belongs to
   * @param {string} id - The unique identifier for this entity
   */
  constructor(world, id) {
    /**
     * The world this entity belongs to
     * @type {import('./World').default}
     */
    this.world = world;
    
    /**
     * The unique identifier for this entity
     * @type {string}
     */
    this.id = id;
    
    /**
     * Map of component types to component instances
     * @type {Map<string, Object>}
     */
    this.components = new Map();
    
    /**
     * Set of tags for this entity
     * @type {Set<string>}
     */
    this.tags = new Set();
    
    /**
     * Whether this entity has been destroyed
     * @type {boolean}
     */
    this.destroyed = false;
  }

  /**
   * Adds a component to this entity
   * @param {string} type - The component type identifier
   * @param {Object} component - The component instance to add
   * @returns {Entity} This entity for chaining
   */
  addComponent(type, component) {
    if (this.destroyed) {
      console.warn('Cannot add component to destroyed entity');
      return this;
    }

    if (this.components.has(type)) {
      console.warn(`Entity already has a component of type ${type}. Replacing it.`);
      this.removeComponent(type);
    }
    
    this.components.set(type, component);
    
    // Register with the world
    this.world.registerComponent(type, this);
    
    // Let the component know it was added
    if (component.entity === undefined) {
      component.entity = this;
    }
    
    if (typeof component.onAdd === 'function') {
      component.onAdd(this);
    }
    
    return this;
  }

  /**
   * Removes a component from this entity
   * @param {string} type - The type of component to remove
   * @returns {Entity} This entity for chaining
   */
  removeComponent(type) {
    if (this.destroyed) {
      console.warn('Cannot remove component from destroyed entity');
      return this;
    }

    const component = this.components.get(type);
    if (component) {
      // Let the component know it was removed
      if (typeof component.onRemove === 'function') {
        component.onRemove();
      }
      
      if (component.entity === this) {
        component.entity = null;
      }
      
      this.components.delete(type);
      this.world.unregisterComponent(type, this);
    }
    
    return this;
  }

  /**
   * Gets a component from this entity
   * @param {string} type - The type of component to get
   * @returns {Object|null} The component or null if not found
   */
  getComponent(type) {
    return this.components.get(type) || null;
  }

  /**
   * Checks if this entity has a component
   * @param {string} type - The type of component to check for
   * @returns {boolean} True if the entity has the component
   */
  hasComponent(type) {
    return this.components.has(type);
  }

  /**
   * Adds a tag to this entity
   * @param {string} tag - The tag to add
   * @returns {Entity} This entity for chaining
   */
  addTag(tag) {
    if (this.destroyed) {
      console.warn('Cannot add tag to destroyed entity');
      return this;
    }

    if (!this.tags.has(tag)) {
      this.tags.add(tag);
      this.world.registerTag(tag, this);
    }
    
    return this;
  }

  /**
   * Removes a tag from this entity
   * @param {string} tag - The tag to remove
   * @returns {Entity} This entity for chaining
   */
  removeTag(tag) {
    if (this.destroyed) {
      console.warn('Cannot remove tag from destroyed entity');
      return this;
    }

    if (this.tags.has(tag)) {
      this.tags.delete(tag);
      this.world.unregisterTag(tag, this);
    }
    
    return this;
  }

  /**
   * Checks if this entity has a tag
   * @param {string} tag - The tag to check for
   * @returns {boolean} True if the entity has the tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * Gets all tags of this entity
   * @returns {Set<string>} Set of tags
   */
  getTags() {
    return this.tags;
  }

  /**
   * Destroys this entity, removing it from the world
   */
  destroy() {
    if (this.destroyed) {
      return;
    }
    
    // Remove all components
    for (const [type, component] of this.components.entries()) {
      if (typeof component.onRemove === 'function') {
        component.onRemove();
      }
      
      if (component.entity === this) {
        component.entity = null;
      }
      
      this.world.unregisterComponent(type, this);
    }
    this.components.clear();
    
    // Remove all tags
    for (const tag of this.tags) {
      this.world.unregisterTag(tag, this);
    }
    this.tags.clear();
    
    // Mark as destroyed
    this.destroyed = true;
    
    // Remove from world
    this.world.destroyEntity(this);
  }
}

export default Entity; 