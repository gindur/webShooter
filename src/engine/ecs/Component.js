/**
 * Base class for all components in the ECS architecture
 * Components are pure data containers with no behavior
 */
class Component {
  /**
   * Creates a new component
   * @param {string} type - The type identifier for this component
   * @param {Object} data - Initial data for the component
   */
  constructor(type, data = {}) {
    /**
     * The type identifier for this component
     * @type {string}
     */
    this.type = type;
    
    /**
     * The entity this component is attached to
     * @type {import('./Entity').default|null}
     */
    this.entity = null;
    
    // Copy all properties from data to this component
    Object.assign(this, data);
  }
  
  /**
   * Creates a copy of this component
   * @returns {Component} A new component with the same data
   */
  clone() {
    const clonedData = {};
    
    // Copy all properties except type and entity
    for (const key in this) {
      if (key !== 'type' && key !== 'entity') {
        clonedData[key] = this[key];
      }
    }
    
    return new Component(this.type, clonedData);
  }
  
  /**
   * Called when the component is added to an entity
   * @param {import('./Entity').default} entity - The entity this component is being added to
   */
  onAdd(entity) {
    this.entity = entity;
  }
  
  /**
   * Called when the component is removed from an entity
   */
  onRemove() {
    this.entity = null;
  }
}

export default Component; 