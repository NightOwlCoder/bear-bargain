module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:expo(nent)?|@expo(nent)?/.*|expo-modules-core/.*|@expo-google-fonts/.*|react-native|@react-native/.*|react-native-reanimated|@react-navigation/.*|expo-router)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
