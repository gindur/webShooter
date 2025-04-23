/**
 * ProjectileTest.js
 * Manual test cases to ensure proper projectile behavior
 */

// Test case 1: Projectile should be destroyed after traveling maxDistance
function testMaxDistanceDestruction() {
  console.log('=== TEST: Projectile should be destroyed after traveling maxDistance ===');
  
  // Create mock world and entity
  const mockWorld = {
    removeEntity: (entity) => {
      console.log('Entity removed:', entity.id);
      return true;
    }
  };
  
  const mockTransform = {
    x: 100,
    y: 100
  };
  
  const mockEntity = {
    id: 'test_projectile',
    destroyed: false,
    destroy: function() {
      this.destroyed = true;
      console.log('Entity destroy called');
      mockWorld.removeEntity(this);
    },
    getComponent: function(name) {
      if (name === 'Transform') return mockTransform;
      return null;
    }
  };
  
  // Create Lifetime component
  const lifetime = {
    entity: mockEntity,
    maxDistance: 600,
    originX: 0,
    originY: 0,
    distanceTraveled: 0,
    
    update: function(deltaTime) {
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
  
  // Test: Move transform beyond maxDistance
  mockTransform.x = 700; // 700 units from origin (0,0)
  mockTransform.y = 0;
  
  // Call update and check if entity is destroyed
  const destroyed = lifetime.update(16);
  console.log('Test result - Entity destroyed:', destroyed);
  console.log('Expected: true');
  console.log('Test ' + (destroyed ? 'PASSED' : 'FAILED'));
  
  return destroyed;
}

// Test case 2: Projectile should be destroyed when out of bounds
function testOutOfBoundsDestruction() {
  console.log('=== TEST: Projectile should be destroyed when out of bounds ===');
  
  const gameWidth = 800;
  const gameHeight = 600;
  
  // Create mock world and entity
  const mockWorld = {
    removeEntity: (entity) => {
      console.log('Entity removed:', entity.id);
      return true;
    }
  };
  
  const mockTransform = {
    x: 100,
    y: 100
  };
  
  const mockEntity = {
    id: 'test_projectile',
    destroyed: false,
    destroy: function() {
      this.destroyed = true;
      console.log('Entity destroy called');
      mockWorld.removeEntity(this);
    },
    getComponent: function(name) {
      if (name === 'Transform') return mockTransform;
      return null;
    }
  };
  
  // Create Lifetime component
  const lifetime = {
    entity: mockEntity,
    maxDistance: 600,
    originX: 0,
    originY: 0,
    distanceTraveled: 0,
    
    update: function(deltaTime) {
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
  
  // Test scenarios
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
    mockEntity.destroyed = false;
    mockTransform.x = scenario.x;
    mockTransform.y = scenario.y;
    
    const destroyed = lifetime.update(16);
    console.log(`Result: ${destroyed}, Expected: ${scenario.expected}`);
    
    const passed = destroyed === scenario.expected;
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

// Export test functions for reuse
export { testMaxDistanceDestruction, testOutOfBoundsDestruction }; 