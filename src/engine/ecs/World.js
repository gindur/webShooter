/**
 * The World class manages all entities and systems in the ECS architecture
 */
class World {
  constructor() {
    /**
     * Map of all entities in the world
     * @type {Map<string, import('./Entity').default>}
     */
    this.entities = new Map();
    
    /**
     * List of all systems in the world
     * @type {Array<import('./System').default>}
     */
    this.systems = [];
    
    /**
     * Counter for generating unique entity IDs
     * @type {number}
     */
    this.entityIdCounter = 0;
    
    /**
     * Map of component types to entities that have them
     * @type {Map<string, Set<import('./Entity').default>>}
     */
    this.componentEntities = new Map();
    
    /**
     * Map of tags to entities that have them
     * @type {Map<string, Set<import('./Entity').default>>}
     */
    this.taggedEntities = new Map();
  }
  
  /**
   * Creates a new entity in the world
   * @returns {import('./Entity').default} The newly created entity
   */
  createEntity() {
    const Entity = require('./Entity').default;
    const entity = new Entity(this, `entity_${this.entityIdCounter++}`);
    this.entities.set(entity.id, entity);
    return entity;
  }
  
  /**
   * Destroys an entity in the world
   * @param {import('./Entity').default|string} entityOrId - The entity or entity ID to destroy
   */
  destroyEntity(entityOrId) {
    const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
    const entity = this.entities.get(id);
    
    if (entity) {
      entity.destroy();
      this.entities.delete(id);
    }
  }
  
  /**
   * Register a component type for an entity
   * @param {string} componentType - The component type to register
   * @param {import('./Entity').default} entity - The entity to register the component for
   */
  registerComponent(componentType, entity) {
    // Get the component type name if it's a constructor or use the string directly
    const typeName = typeof componentType === 'string' ? componentType : componentType.name;
    
    // Get or create the set of entities for this component type
    if (!this.componentEntities.has(typeName)) {
      this.componentEntities.set(typeName, new Set());
    }
    
    // Add the entity to the set
    this.componentEntities.get(typeName).add(entity);
  }
  
  /**
   * Unregister a component type for an entity
   * @param {string} componentType - The component type to unregister
   * @param {import('./Entity').default} entity - The entity to unregister the component for
   */
  unregisterComponent(componentType, entity) {
    // Get the component type name if it's a constructor or use the string directly
    const typeName = typeof componentType === 'string' ? componentType : componentType.name;
    
    // Remove the entity from the set of entities for this component type
    if (this.componentEntities.has(typeName)) {
      this.componentEntities.get(typeName).delete(entity);
      
      // Remove the component type entry if there are no more entities with this component
      if (this.componentEntities.get(typeName).size === 0) {
        this.componentEntities.delete(typeName);
      }
    }
  }
  
  /**
   * Register a tag for an entity
   * @param {string} tag - The tag to register
   * @param {import('./Entity').default} entity - The entity to register the tag for
   */
  registerTag(tag, entity) {
    // Get or create the set of entities for this tag
    if (!this.taggedEntities.has(tag)) {
      this.taggedEntities.set(tag, new Set());
    }
    
    // Add the entity to the set
    this.taggedEntities.get(tag).add(entity);
  }
  
  /**
   * Unregister a tag for an entity
   * @param {string} tag - The tag to unregister
   * @param {import('./Entity').default} entity - The entity to unregister the tag for
   */
  unregisterTag(tag, entity) {
    // Remove the entity from the set of entities for this tag
    if (this.taggedEntities.has(tag)) {
      this.taggedEntities.get(tag).delete(entity);
      
      // Remove the tag entry if there are no more entities with this tag
      if (this.taggedEntities.get(tag).size === 0) {
        this.taggedEntities.delete(tag);
      }
    }
  }
  
  /**
   * Adds a system to the world
   * @param {import('./System').default} system - The system to add
   */
  addSystem(system) {
    system.onAdd(this);
    this.systems.push(system);
    // Sort systems by priority
    this.systems.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Removes a system from the world
   * @param {import('./System').default} system - The system to remove
   */
  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
      system.onRemove();
    }
  }
  
  /**
   * Gets entities with all the specified component types
   * @param {Array<string>} componentTypes - Types of components to filter by
   * @returns {Array<import('./Entity').default>} Entities with all the specified component types
   */
  getEntitiesWithComponents(componentTypes) {
    if (!componentTypes || componentTypes.length === 0) {
      return Array.from(this.entities.values());
    }
    
    // Start with all entities if we have no componentEntities map yet,
    // otherwise start with entities that have the first component type
    let result;
    const firstType = componentTypes[0];
    
    if (this.componentEntities.has(firstType)) {
      result = new Set(this.componentEntities.get(firstType));
    } else {
      return []; // If no entities have the first component, return empty array
    }
    
    // Intersect with entities that have the rest of the component types
    for (let i = 1; i < componentTypes.length; i++) {
      const componentType = componentTypes[i];
      
      if (!this.componentEntities.has(componentType)) {
        return []; // If no entities have this component, return empty array
      }
      
      // Keep only entities that also have this component type
      const entitiesWithComponent = this.componentEntities.get(componentType);
      for (const entity of result) {
        if (!entitiesWithComponent.has(entity)) {
          result.delete(entity);
        }
      }
      
      // If no entities left, return empty array
      if (result.size === 0) {
        return [];
      }
    }
    
    return Array.from(result);
  }
  
  /**
   * Gets entities with the specified tag
   * @param {string} tag - Tag to filter by
   * @returns {Array<import('./Entity').default>} Entities with the specified tag
   */
  getEntitiesWithTag(tag) {
    if (this.taggedEntities.has(tag)) {
      return Array.from(this.taggedEntities.get(tag));
    }
    return [];
  }
  
  /**
   * Updates all systems in the world
   * @param {number} deltaTime - Time elapsed since the last update in seconds
   */
  update(deltaTime) {
    // Update all systems in priority order
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }
  
  /**
   * Clears all entities and systems from the world
   */
  clear() {
    // Remove all systems
    for (const system of this.systems) {
      system.onRemove();
    }
    this.systems = [];
    
    // Destroy all entities
    for (const entity of this.entities.values()) {
      entity.destroy();
    }
    this.entities.clear();
    
    // Clear component and tag maps
    this.componentEntities.clear();
    this.taggedEntities.clear();
  }
  
  /**
   * Gets entities with the specified component type
   * @param {string} componentType - Component type to filter by
   * @returns {Set<import('./Entity').default>} Set of entities with the specified component type
   */
  getEntitiesByComponent(componentType) {
    return this.componentEntities.get(componentType) || new Set();
  }
  
  /**
   * Gets entities with the specified tag
   * @param {string} tag - Tag to filter by
   * @returns {Set<import('./Entity').default>} Set of entities with the specified tag
   */
  getEntitiesByTag(tag) {
    return this.taggedEntities.get(tag) || new Set();
  }
  
  /**
   * Removes an entity from the world
   * @param {import('./Entity').default} entity - The entity to remove
   */
  removeEntity(entity) {
    this.entities.delete(entity.id);
  }
}

export default World; 