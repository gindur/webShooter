module.exports = {
  root: true,
  extends: ['react-app'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
}; 