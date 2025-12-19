module.exports = {
  dependencies: {
    '@es-webdev/react-native-sunmi-printer': {
      platforms: {
        android: process.env.SUNMI_BUILD === '1' ? undefined : null,
        ios: null,
      },
    },
  },
};
