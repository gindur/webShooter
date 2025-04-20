/**
 * Game utility functions for calculations and game mechanics
 * These functions are isolated to be easily testable
 */

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point with x and y coordinates
 * @param {Object} point2 - Second point with x and y coordinates
 * @returns {number} - The distance between the points
 */
export const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate the normalized direction vector between two points
 * @param {Object} from - Starting point with x and y coordinates
 * @param {Object} to - Target point with x and y coordinates
 * @returns {Object} - Direction vector with dx and dy properties
 */
export const calculateDirection = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = calculateDistance(from, to);
  
  // Avoid division by zero
  if (distance === 0) {
    return { dx: 0, dy: 0 };
  }
  
  return {
    dx: dx / distance,
    dy: dy / distance
  };
};

/**
 * Check if two objects are colliding based on their positions and sizes
 * @param {Object} obj1 - First object with x, y and size properties
 * @param {Object} obj2 - Second object with x, y and size properties
 * @returns {boolean} - True if the objects are colliding, false otherwise
 */
export const checkCollision = (obj1, obj2) => {
  const distance = calculateDistance(
    { x: obj1.x, y: obj1.y },
    { x: obj2.x, y: obj2.y }
  );
  
  // Use <= instead of < to catch the case where objects are exactly touching
  return distance <= (obj1.size + obj2.size) / 2;
};

/**
 * Create a new projectile based on current position and target
 * @param {Object} position - Current position with x and y coordinates
 * @param {Object} target - Target position with x and y coordinates
 * @param {number} speed - Speed of the projectile
 * @param {number} size - Size of the projectile
 * @returns {Object} - New projectile object
 */
export const createProjectile = (position, target, speed, size) => {
  const direction = calculateDirection(position, target);
  
  return {
    id: Date.now() + Math.random(), // Ensure unique ID
    x: position.x,
    y: position.y,
    dx: direction.dx * speed,
    dy: direction.dy * speed,
    size: size || 15
  };
};

/**
 * Calculate new position based on current position and velocity
 * @param {Object} position - Current position with x and y coordinates
 * @param {Object} velocity - Velocity with dx and dy properties
 * @returns {Object} - New position with x and y coordinates
 */
export const calculateNewPosition = (position, velocity) => {
  return {
    x: position.x + velocity.dx,
    y: position.y + velocity.dy
  };
};

/**
 * Check if a position is within the bounds of the arena
 * @param {Object} position - Position with x and y coordinates
 * @param {Object} arenaSize - Arena size with width and height properties
 * @param {number} objectSize - Size of the object
 * @returns {boolean} - True if the position is within bounds, false otherwise
 */
export const isWithinBounds = (position, arenaSize, objectSize) => {
  return (
    position.x >= 0 &&
    position.x + objectSize <= arenaSize.width &&
    position.y >= 0 &&
    position.y + objectSize <= arenaSize.height
  );
};

/**
 * Generate a random position on one of the edges of the arena
 * @param {Object} arenaSize - Arena size with width and height properties
 * @param {number} objectSize - Size of the object
 * @returns {Object} - Random position with x, y coordinates and the side (0-3)
 */
export const generateRandomEdgePosition = (arenaSize, objectSize) => {
  const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x, y;
  
  switch(side) {
    case 0: // top
      x = Math.random() * arenaSize.width;
      y = -objectSize;
      break;
    case 1: // right
      x = arenaSize.width + objectSize;
      y = Math.random() * arenaSize.height;
      break;
    case 2: // bottom
      x = Math.random() * arenaSize.width;
      y = arenaSize.height + objectSize;
      break;
    case 3: // left
      x = -objectSize;
      y = Math.random() * arenaSize.height;
      break;
    default:
      // Fallback to top edge
      x = Math.random() * arenaSize.width;
      y = -objectSize;
  }
  
  return { x, y, side };
}; 