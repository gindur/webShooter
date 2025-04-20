// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Enable fake timers
jest.useFakeTimers();

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(Date.now()), 16);
});

global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id);
});

// Resize observer mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window dimensions
window.innerWidth = 1024;
window.innerHeight = 768;

// Mock for Date.now() to make tests deterministic
const MOCK_DATE = 1662000000000; // Some fixed timestamp
global.Date.now = jest.fn(() => MOCK_DATE); 