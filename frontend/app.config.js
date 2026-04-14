const appJson = require('./app.json');

const pluginName = 'react-native-maps';

const ensureMapsPlugin = (plugins) => {
  const filtered = (plugins || []).filter((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] !== pluginName;
    }
    return plugin !== pluginName;
  });

  const sharedKey = process.env.GOOGLE_MAPS_KEY;
  const mapsConfig = {};
  if (process.env.GOOGLE_MAPS_ANDROID_KEY || sharedKey) {
    mapsConfig.androidGoogleMapsApiKey =
      process.env.GOOGLE_MAPS_ANDROID_KEY || sharedKey;
  }
  if (process.env.GOOGLE_MAPS_IOS_KEY || sharedKey) {
    mapsConfig.iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_IOS_KEY || sharedKey;
  }

  return [...filtered, [pluginName, mapsConfig]];
};

module.exports = () => {
  const base = appJson.expo || {};

  return {
    ...base,
    plugins: ensureMapsPlugin(base.plugins),
    extra: {
      ...(base.extra || {}),
      googleMapsWebKey:
        process.env.GOOGLE_MAPS_WEB_KEY || process.env.GOOGLE_MAPS_KEY || null,
    },
  };
};
