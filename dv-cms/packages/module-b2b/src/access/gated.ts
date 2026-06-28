import type { Access, Where } from 'payload'

type AnyUser = { collection?: string; id?: string | number; status?: string } | null | undefined

/**
 * Read access for gated documents:
 * - staff (`users`): full access
 * - approved members: documents with visibility `approved_members`, plus
 *   `specific` documents that explicitly list them in `allowedMembers`
 * - everyone else: denied
 */
export const readGated: Access = ({ req: { user } }) => {
  const u = user as AnyUser
  if (u?.collection === 'users') return true

  if (u?.collection === 'members' && u.status === 'approved') {
    const query: Where = {
      or: [
        { visibility: { equals: 'approved_members' } },
        {
          and: [
            { visibility: { equals: 'specific' } },
            { allowedMembers: { in: [u.id] } },
          ],
        },
      ],
    }
    return query
  }

  return false
}
