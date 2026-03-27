// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NOTE: Do NOT add 'mjs' to sourceExts — it causes Metro to resolve ESM builds
// (e.g. zustand/esm/middleware.mjs) that contain un-transpiled import.meta syntax,
// which crashes the web bundle. CJS builds are resolved by default and work fine.
config.resolver.sourceExts.push('cjs');

module.exports = config;