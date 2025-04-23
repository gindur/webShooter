/**
 * SpatialHashGrid - Efficient spatial partitioning for collision detection
 * 
 * Divides the game world into a grid of cells, placing entities in cells based on their position.
 * This allows for efficient collision detection by only checking entities in nearby cells.
 */
export class SpatialHashGrid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    
    // Calculate the number of columns and rows
    this.columns = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    
    // Initialize the grid
    this.cells = new Map();
  }
  
  /**
   * Get the cell key for a given position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string} Cell key
   */
  getCellKey(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return `${col},${row}`;
  }
  
  /**
   * Get the cell coordinates for a given position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Array} [col, row]
   */
  getCellCoords(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return [col, row];
  }
  
  /**
   * Insert an entity into the grid
   * @param {Object} entity - Entity to insert
   */
  insertEntity(entity) {
    if (!entity.position || !entity.collider) return;
    
    const { x, y } = entity.position;
    const radius = entity.collider.radius || 0;
    
    // Determine cells that entity overlaps
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCol = Math.min(this.columns - 1, Math.floor((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));
    
    // Store which cells the entity is in
    entity._spatialCells = [];
    
    // Add entity to all cells it overlaps
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const key = `${col},${row}`;
        entity._spatialCells.push(key);
        
        // Initialize cell if it doesn't exist
        if (!this.cells.has(key)) {
          this.cells.set(key, []);
        }
        
        // Add entity to cell
        this.cells.get(key).push(entity);
      }
    }
  }
  
  /**
   * Remove an entity from the grid
   * @param {Object} entity - Entity to remove
   */
  removeEntity(entity) {
    if (!entity._spatialCells) return;
    
    // Remove entity from all cells it's in
    for (const key of entity._spatialCells) {
      const cell = this.cells.get(key);
      if (cell) {
        const index = cell.indexOf(entity);
        if (index !== -1) {
          cell.splice(index, 1);
        }
        
        // Remove empty cell
        if (cell.length === 0) {
          this.cells.delete(key);
        }
      }
    }
    
    // Clear cell references
    entity._spatialCells = [];
  }
  
  /**
   * Get entities in the same cell as the given entity
   * @param {Object} entity - Entity to check
   * @param {string} type - Optional entity type filter
   * @returns {Array} Nearby entities
   */
  getNearbyEntities(entity, type = null) {
    if (!entity.position || !entity._spatialCells) return [];
    
    const result = new Set();
    
    // Check all cells the entity is in
    for (const key of entity._spatialCells) {
      const cell = this.cells.get(key);
      if (cell) {
        for (const other of cell) {
          // Skip the entity itself
          if (other !== entity) {
            // Filter by type if specified
            if (type === null || (other.type && other.type === type)) {
              result.add(other);
            }
          }
        }
      }
    }
    
    return Array.from(result);
  }
  
  /**
   * Get all entities in a specific cell
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Array} Entities in the cell
   */
  getEntitiesInCell(x, y) {
    const key = this.getCellKey(x, y);
    return this.cells.get(key) || [];
  }
  
  /**
   * Get all entities in cells surrounding a position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} radius - Search radius in cells
   * @returns {Array} Entities in the surrounding cells
   */
  getEntitiesInRadius(x, y, radius = 1) {
    const [centerCol, centerRow] = this.getCellCoords(x, y);
    const result = new Set();
    
    for (let col = centerCol - radius; col <= centerCol + radius; col++) {
      for (let row = centerRow - radius; row <= centerRow + radius; row++) {
        // Skip out of bounds cells
        if (col < 0 || row < 0 || col >= this.columns || row >= this.rows) {
          continue;
        }
        
        const key = `${col},${row}`;
        const cell = this.cells.get(key);
        if (cell) {
          for (const entity of cell) {
            result.add(entity);
          }
        }
      }
    }
    
    return Array.from(result);
  }
  
  /**
   * Clear all cells in the grid
   */
  clear() {
    this.cells.clear();
  }
  
  /**
   * Resize the grid
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.columns = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
    
    // Clear the grid - entities will be reinserted on next update
    this.clear();
  }
  
  /**
   * Get debug info about the grid
   */
  getDebugInfo() {
    return {
      columns: this.columns,
      rows: this.rows,
      cellCount: this.cells.size,
      entityCount: Array.from(this.cells.values()).reduce((sum, cell) => sum + cell.length, 0)
    };
  }
}

export default SpatialHashGrid; 