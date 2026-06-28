/**
 * Global policy: authenticate a users-permissions member via Bearer JWT and
 * allow only members with status = 'approved'. Sets ctx.state.user.
 * Use on B2B routes with `config: { auth: false, policies: ['global::is-approved-member'] }`.
 */
export default async (policyContext: any, _config: any, { strapi }: any) => {
  const auth = policyContext.request?.header?.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return false

  try {
    const payload = await strapi.plugin('users-permissions').service('jwt').verify(token)
    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { id: payload.id } })

    if (!user) return false
    if (user.status !== 'approved') return false

    policyContext.state.user = user
    return true
  } catch {
    return false
  }
}
