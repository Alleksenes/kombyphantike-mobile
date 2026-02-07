const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');
config.resolver.assetExts.push('sksl');

module.exports = withNativeWind(config, { input: "./global.css" });
