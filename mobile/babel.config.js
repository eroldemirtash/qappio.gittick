module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',                 // NativeWind v4 is a PRESET
    ],
    plugins: [
      'react-native-reanimated/plugin',   // must be LAST
    ],
  };
};