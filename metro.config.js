const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: "./global.css" });
