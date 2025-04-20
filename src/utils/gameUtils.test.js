import {
  calculateDistance,
  calculateDirection,
  checkCollision,
  createProjectile,
  calculateNewPosition,
  isWithinBounds,
  generateRandomEdgePosition
} from './gameUtils';

describe('Game Utilities', () => {
  describe('calculateDistance', () => {
    test('calculates distance between two points correctly', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      expect(calculateDistance(point1, point2)).toBe(5);
    });
    
    test('returns 0 for identical points', () => {
      const point = { x: 10, y: 20 };
      expect(calculateDistance(point, point)).toBe(0);
    });
    
    test('handles negative coordinates', () => {
      const point1 = { x: -3, y: -4 };
      const point2 = { x: 0, y: 0 };
      expect(calculateDistance(point1, point2)).toBe(5);
    });
  });
  
  describe('calculateDirection', () => {
    test('calculates normalized direction vector correctly', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 10, y: 0 };
      const direction = calculateDirection(from, to);
      expect(direction.dx).toBe(1);
      expect(direction.dy).toBe(0);
    });
    
    test('handles diagonal direction', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 10, y: 10 };
      const direction = calculateDirection(from, to);
      // For a 45-degree angle, both dx and dy should be approximately sqrt(2)/2
      expect(direction.dx).toBeCloseTo(0.7071, 4);
      expect(direction.dy).toBeCloseTo(0.7071, 4);
    });
    
    test('returns zero vector for identical points', () => {
      const point = { x: 5, y: 5 };
      const direction = calculateDirection(point, point);
      expect(direction.dx).toBe(0);
      expect(direction.dy).toBe(0);
    });
    
    test('handles negative direction', () => {
      const from = { x: 10, y: 10 };
      const to = { x: 0, y: 0 };
      const direction = calculateDirection(from, to);
      expect(direction.dx).toBeCloseTo(-0.7071, 4);
      expect(direction.dy).toBeCloseTo(-0.7071, 4);
    });
  });
  
  describe('checkCollision', () => {
    test('detects collision when objects overlap', () => {
      const obj1 = { x: 10, y: 10, size: 10 };
      const obj2 = { x: 15, y: 15, size: 10 };
      expect(checkCollision(obj1, obj2)).toBe(true);
    });
    
    test('returns false when objects do not overlap', () => {
      const obj1 = { x: 10, y: 10, size: 5 };
      const obj2 = { x: 25, y: 25, size: 5 };
      expect(checkCollision(obj1, obj2)).toBe(false);
    });
    
    test('handles edge case where objects are exactly touching', () => {
      const obj1 = { x: 10, y: 10, size: 10 };
      const obj2 = { x: 20, y: 10, size: 10 };
      // Objects are exactly touching at the edges, should collide
      expect(checkCollision(obj1, obj2)).toBe(true);
    });
  });
  
  describe('createProjectile', () => {
    test('creates a projectile with correct properties', () => {
      const position = { x: 10, y: 20 };
      const target = { x: 30, y: 20 };
      const speed = 5;
      const size = 8;
      
      const projectile = createProjectile(position, target, speed, size);
      
      expect(projectile.x).toBe(10);
      expect(projectile.y).toBe(20);
      expect(projectile.dx).toBe(5); // Normalized x-direction (1) * speed (5)
      expect(projectile.dy).toBe(0); // No y movement in this case
      expect(projectile.size).toBe(8);
      expect(projectile.id).toBeDefined();
    });
    
    test('uses default size when not specified', () => {
      const position = { x: 10, y: 20 };
      const target = { x: 30, y: 40 };
      const speed = 5;
      
      const projectile = createProjectile(position, target, speed);
      
      expect(projectile.size).toBe(15); // Default size
    });
    
    test('handles diagonal trajectory', () => {
      const position = { x: 0, y: 0 };
      const target = { x: 10, y: 10 };
      const speed = 5;
      
      const projectile = createProjectile(position, target, speed);
      
      // For 45-degree diagonal, both dx and dy should be speed * sqrt(2)/2
      expect(projectile.dx).toBeCloseTo(3.5355, 4); // 5 * 0.7071
      expect(projectile.dy).toBeCloseTo(3.5355, 4); // 5 * 0.7071
    });
  });
  
  describe('calculateNewPosition', () => {
    test('calculates new position based on velocity', () => {
      const position = { x: 10, y: 20 };
      const velocity = { dx: 5, dy: -3 };
      
      const newPosition = calculateNewPosition(position, velocity);
      
      expect(newPosition.x).toBe(15);
      expect(newPosition.y).toBe(17);
    });
    
    test('handles zero velocity', () => {
      const position = { x: 10, y: 20 };
      const velocity = { dx: 0, dy: 0 };
      
      const newPosition = calculateNewPosition(position, velocity);
      
      expect(newPosition.x).toBe(10);
      expect(newPosition.y).toBe(20);
    });
    
    test('handles negative coordinates', () => {
      const position = { x: -5, y: -10 };
      const velocity = { dx: -3, dy: 5 };
      
      const newPosition = calculateNewPosition(position, velocity);
      
      expect(newPosition.x).toBe(-8);
      expect(newPosition.y).toBe(-5);
    });
  });
  
  describe('isWithinBounds', () => {
    test('returns true when position is within bounds', () => {
      const position = { x: 50, y: 50 };
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      expect(isWithinBounds(position, arenaSize, objectSize)).toBe(true);
    });
    
    test('returns false when position is outside x-bounds', () => {
      const position = { x: 95, y: 50 };
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      expect(isWithinBounds(position, arenaSize, objectSize)).toBe(false);
    });
    
    test('returns false when position is outside y-bounds', () => {
      const position = { x: 50, y: -5 };
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      expect(isWithinBounds(position, arenaSize, objectSize)).toBe(false);
    });
    
    test('returns true when position is exactly at the boundary', () => {
      const position = { x: 0, y: 0 };
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      expect(isWithinBounds(position, arenaSize, objectSize)).toBe(true);
    });
  });
  
  describe('generateRandomEdgePosition', () => {
    // We need to mock Math.random for these tests
    let randomSpy;
    
    beforeEach(() => {
      // Mock Math.random to return a predictable value
      randomSpy = jest.spyOn(Math, 'random');
    });
    
    afterEach(() => {
      // Restore the original Math.random
      randomSpy.mockRestore();
    });
    
    test('generates top edge position correctly', () => {
      // First call: side selection (0 = top), second call: x position (0.5 = middle)
      randomSpy.mockReturnValueOnce(0).mockReturnValueOnce(0.5);
      
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      const position = generateRandomEdgePosition(arenaSize, objectSize);
      
      expect(position.x).toBe(50); // 0.5 * 100
      expect(position.y).toBe(-10); // Above the arena
      expect(position.side).toBe(0); // Top side
    });
    
    test('generates right edge position correctly', () => {
      // First call: side selection (0.3 -> 1 = right), second call: y position (0.5 = middle)
      randomSpy.mockReturnValueOnce(0.3).mockReturnValueOnce(0.5);
      
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      const position = generateRandomEdgePosition(arenaSize, objectSize);
      
      expect(position.x).toBe(110); // Right of the arena
      expect(position.y).toBe(50); // 0.5 * 100
      expect(position.side).toBe(1); // Right side
    });
    
    test('generates bottom edge position correctly', () => {
      // First call: side selection (0.55 -> 2 = bottom), second call: x position (0.7 = 70%)
      randomSpy.mockReturnValueOnce(0.55).mockReturnValueOnce(0.7);
      
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      const position = generateRandomEdgePosition(arenaSize, objectSize);
      
      expect(position.x).toBe(70); // 0.7 * 100
      expect(position.y).toBe(110); // Below the arena
      expect(position.side).toBe(2); // Bottom side
    });
    
    test('generates left edge position correctly', () => {
      // First call: side selection (0.8 -> 3 = left), second call: y position (0.3 = 30%)
      randomSpy.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);
      
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      const position = generateRandomEdgePosition(arenaSize, objectSize);
      
      expect(position.x).toBe(-10); // Left of the arena
      expect(position.y).toBe(30); // 0.3 * 100
      expect(position.side).toBe(3); // Left side
    });
    
    test('handles default case', () => {
      // First call: side selection (0.99 -> 3 but we'll force default), second call: x position
      randomSpy.mockReturnValueOnce(0.99).mockReturnValueOnce(0.5);
      
      const arenaSize = { width: 100, height: 100 };
      const objectSize = 10;
      
      // Modify the Math.floor temporarily to trigger default case
      const floorSpy = jest.spyOn(Math, 'floor').mockReturnValueOnce(4);
      
      const position = generateRandomEdgePosition(arenaSize, objectSize);
      
      expect(position.x).toBe(50); // 0.5 * 100
      expect(position.y).toBe(-10); // Default to top edge
      
      floorSpy.mockRestore();
    });
  });
}); 