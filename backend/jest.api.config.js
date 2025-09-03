module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/api-smoke.test.js'],
  verbose: true,
  // Do NOT load global setup that touches DB
  setupFilesAfterEnv: [],
  transform: {},
};
