module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/test/**/*.test.js"],
  setupFiles: ["<rootDir>/src/test/jest.env.js"],
  setupFilesAfterEnv: ["<rootDir>/src/test/jest.setup.js"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
