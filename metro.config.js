const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm to asset extensions
config.resolver.assetExts.push('wasm');

// Platform-specific extensions
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Skip web-specific SQLite modules for mobile platforms
  if (platform !== 'web' && moduleName.includes('wa-sqlite')) {
    return { type: 'empty' };
  }
  
  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;