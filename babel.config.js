// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//   };
// };
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // 'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          "@src": "./src",
        },
        extensions: [
          '.js',
          '.ts',
          '.tsx',
          '.ios.js',
          '.android.js',
          'ios.ts',
          '.android.ts',
        ],
      },
    ],
  ],
}
