/**
 * ECS (Entity Component System) Architecture Module
 * 
 * This module implements a lightweight and flexible ECS architecture
 * for game development. ECS separates game logic into three main parts:
 * 
 * - Entities: Game objects that are just IDs with collections of components
 * - Components: Pure data containers attached to entities
 * - Systems: Logic that processes entities with specific components
 * 
 * This architecture promotes composition over inheritance and allows for
 * greater flexibility and performance in game development.
 */

import World from './World';
import Entity from './Entity';
import Component from './Component';
import System from './System';

// Export examples
import { 
  PositionComponent, 
  VelocityComponent, 
  RenderableComponent,
  MovementSystem,
  RenderSystem,
  createSimpleGame
} from './example';

export {
  // Core ECS classes
  World,
  Entity,
  Component,
  System,
  
  // Example components and systems
  PositionComponent,
  VelocityComponent,
  RenderableComponent,
  MovementSystem,
  RenderSystem,
  createSimpleGame
};

export default {
  World,
  Entity,
  Component,
  System
}; 