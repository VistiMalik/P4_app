const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude REFERENCIA_BT from watch list to avoid ENOSPC errors
config.resolver.blockList = [
  /\/REFERENCIA_BT\/.*/,
  /\/android\/.*/, // We don't need to watch android build folder usually, but let's be careful
  /\/ios\/.*/      // Same for ios
];

module.exports = config;
