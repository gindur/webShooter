/**
 * Base class for all systems in the ECS architecture
 * Systems contain game logic that operates on entities with specific components
 */
class System {
  /**
   * Creates a new system
   * @param {Object} options - System configuration options
   * @param {number} [options.priority=0] - Priority for system execution (lower runs first)
   * @param {Array<string>} [options.requiredComponents=[]] - Component types required for entities
   */
  constructor(options = {}) {
    /**
     * The world this system belongs to
     * @type {import('./World').default|null}
     */
    this.world = null;
    
    /**
     * Priority of this system (lower numbers run first)
     * @type {number}
     */
    this.priority = options.priority || 0;
    
    /**
     * Whether this system is enabled
     * @type {boolean}
     */
    this.enabled = true;
    
    /**
     * Required component types for entities to be processed by this system
     * @type {Array<string>}
     */
    this.requiredComponents = options.requiredComponents || [];
  }
  
  /**
   * Called when the system is added to a world
   * @param {import('./World').default} world - The world this system is being added to
   */
  onAdd(world) {
    this.world = world;
  }
  
  /**
   * Called when the system is removed from a world
   */
  onRemove() {
    this.world = null;
  }
  
  /**
   * Sets the priority for this system
   * @param {number} priority - Lower numbers run first
   * @returns {System} This system for chaining
   */
  setPriority(priority) {
    this.priority = priority;
    return this;
  }
  
  /**
   * Enable or disable this system
   * @param {boolean} enabled - Whether the system should be enabled
   * @returns {System} This system for chaining
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    return this;
  }
  
  /**
   * Sets required components for entities to be processed by this system
   * @param {Array<string>} componentTypes - Array of component type names
   * @returns {System} This system for chaining
   */
  setRequiredComponents(componentTypes) {
    this.requiredComponents = componentTypes;
    return this;
  }
  
  /**
   * Get all entities that match the required components
   * @returns {Array<import('./Entity').default>} Array of matching entities
   */
  getEntities() {
    if (!this.world) return [];
    
    if (this.requiredComponents.length === 0) {
      return Array.from(this.world.entities.values());
    }
    
    return this.world.getEntitiesWithComponents(this.requiredComponents);
  }
  
  /**
   * Update method called each frame
   * Override this method in your system subclass
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    // Override this method in subclasses
  }
}

export default System; 