import { getOidcClient } from './oidc-client.js'
import { getSession, setSession, dropSession } from './session-store.js'

import { roleTypes } from './constants/roles.js'
import { rolePermissions } from './constants/role-permissions.js'

/**
 * Register session middleware
 * @param {import('@hapi/hapi').Server} server
 */
export function registerSessionMiddleware(server) {
  server.ext('onPostAuth', async (request, h) => {
    const isStatic =
      request.path.startsWith('/public/') ||
      request.path.startsWith('/assets/') ||
      request.path.startsWith('/stylesheets/') ||
      request.path.startsWith('/javascripts/')

    // Skip static assets
    if (isStatic) {
      return h.continue
    }

    // Skip OIDC handshake routes
    if (request.path.startsWith('/auth/')) {
      return h.continue
    }

    // Skip routes that explicitly disable auth
    if (request.route.settings.auth === false) {
      return h.continue
    }

    // Ensure cookieAuth exists
    if (!request.cookieAuth || typeof request.cookieAuth.get !== 'function') {
      console.log('session-middleware: no cookieAuth.get, skipping')
      return h.continue
    }

    // Read cookie-based session
    const cookie = request.cookieAuth.get()

    // No session cookie => unauthenticated request
    if (!cookie?.sessionId) {
      return h.continue
    }

    const sessionId = cookie.sessionId

    // Load the session from Redis
    const currentSession = getSession(sessionId)

    // Session missing, so clear cookie and continue unauthenticated (downstream will handle)
    if (!currentSession) {
      request.cookieAuth.clear()
      return h.continue
    }

    let { tokenSet, user } = currentSession
    const oidcClient = getOidcClient()

    // Refresh token if expired
    if (tokenSet.expired()) {
      try {
        const refreshedToken = await oidcClient.refresh(tokenSet.refresh_token)

        // Preserve refresh token if provider does not rotate
        refreshedToken.refresh_token =
          refreshedToken.refresh_token ?? tokenSet.refresh_token

        tokenSet = refreshedToken
        user = refreshedToken.claims()

        // TODO: We can fetch roles and permissions from the CDS API and add to the session e.g.
        // const roles = await apiClient.get(`/users/${user.sub}/roles`)
        const roles = [user.roles?.[0] || roleTypes.mipViewer]

        // TODO: Hard-coded role & permissions to come from CDS API
        // const permissions = await apiClient.get(`/users/${user.sub}/permissions`)
        const permissions = roles.flatMap((r) => rolePermissions[r] || [])

        // Save updated session
        setSession(sessionId, {
          sessionId,
          userSub: currentSession.userSub,
          tokenSet,
          user: {
            ...user,
            roles,
            permissions
          }
        })
      } catch (err) {
        // Refresh failed => drop session and clear cookie
        await dropSession(sessionId)
        request.cookieAuth.clear()
        return h.continue
      }
    }

    // Extract roles + permissions from session
    const roles = user.roles || []
    const permissions = user.permissions || []

    // Attach credentials to request
    request.auth.credentials = {
      user: {
        ...user,
        roles,
        permissions
      },
      tokenSet
    }

    return h.continue
  })
}
