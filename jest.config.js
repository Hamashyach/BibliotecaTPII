// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Procura por arquivos de teste nas pastas __tests__ ou com sufixo .test.js/.spec.js
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
};