jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView, Image } = require('react-native');
  const AnimatedView = (props) => <View {...props} />;
  const AnimatedText = (props) => <Text {...props} />;
  const AnimatedScrollView = (props) => <ScrollView {...props} />;
  const AnimatedImage = (props) => <Image {...props} />;

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: AnimatedText,
      ScrollView: AnimatedScrollView,
      Image: AnimatedImage,
      addWhitelistedUIThreadRootView: jest.fn(),
      configureProps: jest.fn(),
    },
    Easing: {
      linear: jest.fn(),
    },
    runOnJS: (fn) => fn,
    useSharedValue: (initial) => {
      const React = require('react');
      const ref = React.useRef({ value: initial ?? 0 });
      return ref.current;
    },
    useAnimatedStyle: (fn) => fn(),
    withTiming: jest.fn(),
    withSpring: jest.fn(),
  };
});
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
