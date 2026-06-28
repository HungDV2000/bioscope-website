/**
 * B2B controller — documents the approved member may access + gated download.
 * Auth + approval handled by the `is-approved-member` policy (sets ctx.state.user).
 */
const accessFilter = (userId: number | string): any => ({
  $or: [
    { visibility: 'approved_members' },
    { $and: [{ visibility: 'specific' }, { allowedMembers: { id: userId } }] },
  ],
})

export default {
  async documents(ctx: any) {
    const user = ctx.state.user
    const docs = await strapi.documents('api::gated-document.gated-document').findMany({
      filters: accessFilter(user.id),
      populate: { file: true, relatesTo: true },
      limit: 100,
    })
    ctx.body = { data: docs }
  },

  async download(ctx: any) {
    const user = ctx.state.user
    const { id } = ctx.params
    const [doc] = await strapi.documents('api::gated-document.gated-document').findMany({
      filters: { $and: [{ documentId: id }, accessFilter(user.id)] } as any,
      populate: { file: true },
      limit: 1,
    })
    if (!doc) return ctx.forbidden('Không có quyền truy cập tài liệu này.')
    const url = (doc as any).file?.url
    if (!url) return ctx.notFound('Không tìm thấy file.')
    const base = strapi.config.get('server.url') || `http://localhost:${strapi.config.get('server.port', 1337)}`
    ctx.redirect(url.startsWith('http') ? url : `${base}${url}`)
  },
}
