export default {
  routes: [
    {
      method: 'GET',
      path: '/b2b/documents',
      handler: 'b2b.documents',
      config: { auth: false, policies: ['global::is-approved-member'] },
    },
    {
      method: 'GET',
      path: '/b2b/documents/:id/download',
      handler: 'b2b.download',
      config: { auth: false, policies: ['global::is-approved-member'] },
    },
  ],
}
