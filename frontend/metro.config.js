const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { FileStore } = require("metro-cache");

const config = getDefaultConfig(__dirname);

// 🔥 SVG transformer (lo tuyo)
config.transformer.babelTransformerPath =
  require.resolve("react-native-svg-transformer");
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// 🚀 CACHE EN DISCO EXTERNO
config.cacheStores = [
  new FileStore({
    root: "/Volumes/TOSHIBA/dev-cache/metro",
  }),
];

// (opcional pero recomendado para rendimiento)
config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = config;
