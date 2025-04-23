/**
 * Debug utilities for the ECS system
 */

/**
 * Log the state of an ECS world
 * @param {World} world - The world to log
 */
export function logWorldState(world) {
  console.group('ECS World State');
  
  // Log entity count
  console.log(`Entities: ${world.entities.size}`);
  
  // Log systems
  console.group('Systems');
  world.systems.forEach((system, index) => {
    const name = system.constructor.name || `System ${index}`;
    console.log(`${name} (priority: ${system.priority})`);
  });
  console.groupEnd();
  
  // Log component distribution
  console.group('Components');
  world.componentEntities.forEach((entities, componentType) => {
    console.log(`${componentType}: ${entities.size} entities`);
  });
  console.groupEnd();
  
  // Log tag distribution
  console.group('Tags');
  world.taggedEntities.forEach((entities, tag) => {
    console.log(`${tag}: ${entities.size} entities`);
  });
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Log details about a specific entity
 * @param {Entity} entity - The entity to log
 */
export function logEntityDetails(entity) {
  if (!entity) {
    console.warn('No entity provided to logEntityDetails');
    return;
  }
  
  console.group(`Entity ${entity.id}`);
  
  // Log components
  console.group('Components');
  entity.components.forEach((component, type) => {
    console.log(`${type}:`, component);
  });
  console.groupEnd();
  
  // Log tags
  console.log('Tags:', Array.from(entity.tags));
  
  console.groupEnd();
}

export default {
  logWorldState,
  logEntityDetails
}; 