/**
 * Enforces that the authenticated user has a specific role.
 *
 * @param {string} requiredRole
 */
export function requireRole(requiredRole) {
  return (request, h) => {
    const roles = request.auth?.credentials?.user?.roles || []

    if (!roles.includes(requiredRole)) {
      return h.response('Forbidden').code(403).takeover()
    }

    return h.continue
  }
}
