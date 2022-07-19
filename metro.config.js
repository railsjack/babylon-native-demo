module.exports = {
  resolver: {
    sourceExts: ["js", "mjs", "json", "ts", "tsx", "cjs", "ttf"],
    assetExts: ["glb", "png", "jpg", "gltf", "ttf", "gif"],
  },
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles']
  }
};
