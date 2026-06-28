export default () => ({
  // i18n is built-in & enabled by default in Strapi 5.
  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      playgroundAlways: true,
      defaultLimit: 25,
      maxLimit: 100,
    },
  },
  'users-permissions': {
    enabled: true,
  },
})
