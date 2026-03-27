module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Transpile import.meta → globalThis.__ExpoImportMetaRegistry
          // Prevents "Cannot use import.meta outside a module" in Metro web bundles.
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
