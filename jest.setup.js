jest.mock('react-native-reanimated', () => ({
  default: {
    addWhitelistedUIThreadRootView: jest.fn(),
    configureProps: jest.fn(),
  },
  Easing: {
    linear: jest.fn(),
  },
  useSharedValue: (initial) => ({ value: initial ?? 0 }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: jest.fn(),
  withSpring: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));

if (!global.fetch) {
  global.fetch = jest.fn();
}

const fetchMock = global.fetch;
if (typeof fetchMock === 'function' && 'mockImplementation' in fetchMock) {
  fetchMock.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ bitcoin: { usd: 91295 } }),
    }),
  );
}
