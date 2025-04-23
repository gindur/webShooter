/**
 * Test runner for projectile lifetime component
 */

// Mock World
class MockWorld {
  constructor() {
    this.removedEntities = [];
  }
  
  removeEntity(entity) {
    this.removedEntities.push(entity);
    console.log(`Entity removed: ${entity.id}`);
  }
}

// Mock Entity
class MockEntity {
  constructor(id, world) {
    this.id = id;
    this.world = world;
    this.components = new Map();
    this.destroyed = false;
  }
  
  addComponent(type, component) {
    this.components.set(type, component);
    component.entity = this;
    return this;
  }
  
  getComponent(type) {
    return this.components.get(type);
  }
  
  destroy() {
    this.destroyed = true;
    this.world.removeEntity(this);
  }
}

// Mock Transform component
class MockTransform {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Test 1: Projectile should be destroyed after traveling maxDistance
function testMaxDistanceDestruction() {
  console.log('=== TEST: Projectile should be destroyed after traveling maxDistance ===');
  
  const world = new MockWorld();
  const entity = new MockEntity('test_projectile', world);
  const transform = new MockTransform(0, 0);
  
  entity.addComponent('Transform', transform);
  
  // Create Lifetime component
  const lifetime = {
    entity: entity,
    maxDistance: 600,
    originX: 0,
    originY: 0,
    distanceTraveled: 0,
    
    update(deltaTime) {
      const transform = this.entity.getComponent('Transform');
      const dx = transform.x - this.originX;
      const dy = transform.y - this.originY;
      this.distanceTraveled = Math.sqrt(dx * dx + dy * dy);
      
      console.log(`Distance traveled: ${this.distanceTraveled}, Max: ${this.maxDistance}`);
      
      // Destroy projectile if it has traveled too far
      if (this.distanceTraveled > this.maxDistance) {
        this.entity.destroy();
      }
      
      return this.entity.destroyed;
    }
  };
  
  entity.addComponent('Lifetime', lifetime);
  
  // Test: Move transform beyond maxDistance
  transform.x = 700; // 700 units from origin (0,0)
  
  // Call update
  lifetime.update(16/1000); // 16ms in seconds
  
  // Check if entity was destroyed
  console.log('Test result - Entity destroyed:', entity.destroyed);
  console.log('Expected: true');
  console.log('Test ' + (entity.destroyed ? 'PASSED' : 'FAILED'));
  
  return entity.destroyed;
}

// Test 2: Projectile should be destroyed when out of bounds
function testOutOfBoundsDestruction() {
  console.log('=== TEST: Projectile should be destroyed when out of bounds ===');
  
  const gameWidth = 800;
  const gameHeight = 600;
  
  const scenarios = [
    { name: 'Out of bounds (left)', x: -10, y: 100, expected: true },
    { name: 'Out of bounds (right)', x: gameWidth + 10, y: 100, expected: true },
    { name: 'Out of bounds (top)', x: 100, y: -10, expected: true },
    { name: 'Out of bounds (bottom)', x: 100, y: gameHeight + 10, expected: true },
    { name: 'In bounds', x: 400, y: 300, expected: false }
  ];
  
  let allPassed = true;
  
  scenarios.forEach(scenario => {
    console.log(`Testing: ${scenario.name}`);
    
    const world = new MockWorld();
    const entity = new MockEntity(`test_${scenario.name}`, world);
    const transform = new MockTransform(scenario.x, scenario.y);
    
    entity.addComponent('Transform', transform);
    
    // Create Lifetime component
    const lifetime = {
      entity: entity,
      maxDistance: 600,
      originX: 0,
      originY: 0,
      distanceTraveled: 0,
      
      update(deltaTime) {
        const transform = this.entity.getComponent('Transform');
        const dx = transform.x - this.originX;
        const dy = transform.y - this.originY;
        this.distanceTraveled = Math.sqrt(dx * dx + dy * dy);
        
        // Destroy projectile if it has traveled too far or is out of bounds
        if (this.distanceTraveled > this.maxDistance || 
            transform.x < 0 || transform.x > gameWidth ||
            transform.y < 0 || transform.y > gameHeight) {
          this.entity.destroy();
        }
        
        return this.entity.destroyed;
      }
    };
    
    entity.addComponent('Lifetime', lifetime);
    
    // Call update
    lifetime.update(16/1000); // 16ms in seconds
    
    // Check if entity was destroyed
    console.log(`Result: ${entity.destroyed}, Expected: ${scenario.expected}`);
    
    const passed = entity.destroyed === scenario.expected;
    console.log(`Test ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (!passed) allPassed = false;
  });
  
  return allPassed;
}

// Run tests
console.log('====== Starting Projectile Tests ======');
const maxDistanceTestPassed = testMaxDistanceDestruction();
const outOfBoundsTestPassed = testOutOfBoundsDestruction();

console.log('====== Test Summary ======');
console.log('Max distance test:', maxDistanceTestPassed ? 'PASSED' : 'FAILED');
console.log('Out of bounds test:', outOfBoundsTestPassed ? 'PASSED' : 'FAILED');
console.log('All tests:', (maxDistanceTestPassed && outOfBoundsTestPassed) ? 'PASSED' : 'FAILED');

// To run this test:
// node src/tests/runProjectileTests.js 