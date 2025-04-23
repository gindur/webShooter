import System from '../System';

/**
 * System responsible for handling keyboard and mouse input
 */
class InputSystem extends System {
  /**
   * Creates a new InputSystem
   * @param {Object} options - Configuration options
   * @param {HTMLElement} [options.element=window] - The element to attach input listeners to
   */
  constructor({ element = window } = {}) {
    super({
      priority: 0, // Should run first
      requiredComponents: [] // No required components for input system
    });
    
    /**
     * Element to attach input listeners to
     * @type {HTMLElement}
     */
    this.element = element;
    
    /**
     * Keyboard keys currently pressed
     * @type {Map<string, boolean>}
     */
    this.keys = new Map();
    
    /**
     * Mouse buttons currently pressed
     * @type {Map<number, boolean>}
     */
    this.mouseButtons = new Map();
    
    /**
     * Current mouse position
     * @type {Object}
     */
    this.mousePosition = { x: 0, y: 0 };
    
    /**
     * Keys that were just pressed this frame
     * @type {Set<string>}
     */
    this.keysDown = new Set();
    
    /**
     * Keys that were just released this frame
     * @type {Set<string>}
     */
    this.keysUp = new Set();
    
    /**
     * Mouse buttons that were just pressed this frame
     * @type {Set<number>}
     */
    this.mouseButtonsDown = new Set();
    
    /**
     * Mouse buttons that were just released this frame
     * @type {Set<number>}
     */
    this.mouseButtonsUp = new Set();
    
    /**
     * Mouse wheel delta
     * @type {number}
     */
    this.wheelDelta = 0;
    
    /**
     * Whether preventDefault() should be called on events
     * @type {boolean}
     */
    this.preventDefault = false;
    
    /**
     * Registered key press callbacks
     * @type {Map<string, Function>}
     */
    this.keyPressCallbacks = new Map();
    
    /**
     * Registered key release callbacks
     * @type {Map<string, Function>}
     */
    this.keyReleaseCallbacks = new Map();
    
    /**
     * Registered mouse button press callbacks
     * @type {Map<number, Function>}
     */
    this.mouseButtonPressCallbacks = new Map();
    
    /**
     * Bound event handlers
     * @type {Object}
     */
    this.handlers = {
      keydown: this.handleKeyDown.bind(this),
      keyup: this.handleKeyUp.bind(this),
      mousedown: this.handleMouseDown.bind(this),
      mouseup: this.handleMouseUp.bind(this),
      mousemove: this.handleMouseMove.bind(this),
      wheel: this.handleWheel.bind(this),
      contextmenu: this.handleContextMenu.bind(this)
    };
  }
  
  /**
   * Initialize the input system
   * @param {World} world - The world this system is being added to
   */
  onAdd(world) {
    super.onAdd(world);
    
    // Attach event listeners
    this.element.addEventListener('keydown', this.handlers.keydown);
    this.element.addEventListener('keyup', this.handlers.keyup);
    this.element.addEventListener('mousedown', this.handlers.mousedown);
    this.element.addEventListener('mouseup', this.handlers.mouseup);
    this.element.addEventListener('mousemove', this.handlers.mousemove);
    this.element.addEventListener('wheel', this.handlers.wheel);
    this.element.addEventListener('contextmenu', this.handlers.contextmenu);
  }
  
  /**
   * Clean up the input system
   */
  onRemove() {
    super.onRemove();
    
    // Remove event listeners
    this.element.removeEventListener('keydown', this.handlers.keydown);
    this.element.removeEventListener('keyup', this.handlers.keyup);
    this.element.removeEventListener('mousedown', this.handlers.mousedown);
    this.element.removeEventListener('mouseup', this.handlers.mouseup);
    this.element.removeEventListener('mousemove', this.handlers.mousemove);
    this.element.removeEventListener('wheel', this.handlers.wheel);
    this.element.removeEventListener('contextmenu', this.handlers.contextmenu);
  }
  
  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - The keydown event
   */
  handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    // Only register the key press if it wasn't already pressed
    if (!this.keys.get(key)) {
      this.keysDown.add(key);
      
      // Call any registered callbacks for this key
      const callback = this.keyPressCallbacks.get(key);
      if (callback) {
        callback(event);
      }
    }
    
    this.keys.set(key, true);
    
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle keyup events
   * @param {KeyboardEvent} event - The keyup event
   */
  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys.set(key, false);
    this.keysUp.add(key);
    
    // Call any registered callbacks for this key
    const callback = this.keyReleaseCallbacks.get(key);
    if (callback) {
      callback(event);
    }
    
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle mousedown events
   * @param {MouseEvent} event - The mousedown event
   */
  handleMouseDown(event) {
    this.mouseButtons.set(event.button, true);
    this.mouseButtonsDown.add(event.button);
    
    // Call any registered callbacks for this mouse button
    const callback = this.mouseButtonPressCallbacks.get(event.button);
    if (callback) {
      callback(event);
    }
    
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle mouseup events
   * @param {MouseEvent} event - The mouseup event
   */
  handleMouseUp(event) {
    this.mouseButtons.set(event.button, false);
    this.mouseButtonsUp.add(event.button);
    
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle mousemove events
   * @param {MouseEvent} event - The mousemove event
   */
  handleMouseMove(event) {
    // Get the correct mouse position relative to the target element
    if (event.target instanceof HTMLCanvasElement) {
      const rect = event.target.getBoundingClientRect();
      this.mousePosition.x = event.clientX - rect.left;
      this.mousePosition.y = event.clientY - rect.top;
    } else {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    }
    
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle wheel events
   * @param {WheelEvent} event - The wheel event
   */
  handleWheel(event) {
    this.wheelDelta = event.deltaY;
    
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Handle context menu events (right click)
   * @param {MouseEvent} event - The context menu event
   */
  handleContextMenu(event) {
    if (this.preventDefault) {
      event.preventDefault();
    }
  }
  
  /**
   * Register a callback for when a key is pressed
   * @param {string} key - The key to listen for
   * @param {Function} callback - The function to call when the key is pressed
   */
  onKeyPressed(key, callback) {
    this.keyPressCallbacks.set(key.toLowerCase(), callback);
  }
  
  /**
   * Register a callback for when a key is released
   * @param {string} key - The key to listen for
   * @param {Function} callback - The function to call when the key is released
   */
  onKeyReleased(key, callback) {
    this.keyReleaseCallbacks.set(key.toLowerCase(), callback);
  }
  
  /**
   * Register a callback for when a mouse button is pressed
   * @param {number} button - The mouse button to listen for (0 = left, 1 = middle, 2 = right)
   * @param {Function} callback - The function to call when the button is pressed
   */
  onMouseButtonPressed(button, callback) {
    this.mouseButtonPressCallbacks.set(button, callback);
  }
  
  /**
   * Check if a key is currently pressed
   * @param {string} key - The key to check
   * @returns {boolean} True if the key is pressed
   */
  isKeyPressed(key) {
    return this.keys.get(key.toLowerCase()) === true;
  }
  
  /**
   * Check if a key was just pressed this frame
   * @param {string} key - The key to check
   * @returns {boolean} True if the key was just pressed
   */
  wasKeyPressed(key) {
    return this.keysDown.has(key.toLowerCase());
  }
  
  /**
   * Check if a key was just released this frame
   * @param {string} key - The key to check
   * @returns {boolean} True if the key was just released
   */
  wasKeyReleased(key) {
    return this.keysUp.has(key.toLowerCase());
  }
  
  /**
   * Check if a mouse button is currently pressed
   * @param {number} button - The button to check (0 = left, 1 = middle, 2 = right)
   * @returns {boolean} True if the button is pressed
   */
  isMouseButtonPressed(button) {
    return this.mouseButtons.get(button) === true;
  }
  
  /**
   * Check if a mouse button was just pressed this frame
   * @param {number} button - The button to check
   * @returns {boolean} True if the button was just pressed
   */
  wasMouseButtonPressed(button) {
    return this.mouseButtonsDown.has(button);
  }
  
  /**
   * Check if a mouse button was just released this frame
   * @param {number} button - The button to check
   * @returns {boolean} True if the button was just released
   */
  wasMouseButtonReleased(button) {
    return this.mouseButtonsUp.has(button);
  }
  
  /**
   * Get the current mouse position
   * @returns {Object} The current mouse position {x, y}
   */
  getMousePosition() {
    return { ...this.mousePosition };
  }
  
  /**
   * Get the mouse wheel delta
   * @returns {number} The mouse wheel delta
   */
  getWheelDelta() {
    return this.wheelDelta;
  }
  
  /**
   * Update the input system, clearing per-frame state
   * @param {number} deltaTime - Time elapsed since the last update
   */
  update(deltaTime) {
    // Clear the sets of keys/buttons that were pressed/released this frame
    this.keysDown.clear();
    this.keysUp.clear();
    this.mouseButtonsDown.clear();
    this.mouseButtonsUp.clear();
    this.wheelDelta = 0;
  }
}

export default InputSystem; 