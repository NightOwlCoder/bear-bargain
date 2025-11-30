module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(?:expo(nent)?|@expo(nent)?/.*|expo-modules-core/.*|@expo-google-fonts/.*|react-native|@react-native/.*|react-native-reanimated|@react-navigation/.*|expo-router)/)',
  ],
};
