import { getOidcClient } from '#auth/oidc-client.js'
import { TokenSet } from 'openid-client'
import { getSession, setSession, dropSession } from '#auth/session-store.js'

import { roleTypes } from '#auth/constants/roles.js'
import { rolePermissions } from '#auth/constants/role-permissions.js'

export async function sessionMiddleware(request, h) {
  if (shouldSkipRequest(request)) {
    return h.continue
  }

  const loadedSession = await loadSession(request)
  if (!loadedSession) {
    return h.continue
  }

  const { session, sessionId } = loadedSession

  const refreshed = await refreshTokenIfNeeded(session, sessionId, request)
  if (!refreshed) {
    return h.continue
  }

  const { tokenSet, user, permissions } = refreshed

  // Extract roles + permissions from session
  const roles = user?.roles || []

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
}

function shouldSkipRequest(request) {
  const path = request.path

  const isStatic =
    request.path.startsWith('/public/') |
    request.path.startsWith('/assets/') |
    request.path.startsWith('/stylesheets/') |
    request.path.startsWith('/javascripts/')

  const isAuthRoute =
    path.startsWith('/auth/login') || path.startsWith('/auth/callback')

  const authDisabled = !request.route.settings.auth
  const noCookieAuth = !request.cookieAuth

  return isStatic || isAuthRoute || authDisabled || noCookieAuth
}

async function loadSession(request) {
  const cookie = request.auth?.artifacts
  if (!cookie?.sessionId) {
    return null
  }

  const session = await getSession(cookie.sessionId)
  if (!session) {
    request.cookieAuth.clear()
    return null
  }

  return { session, sessionId: cookie.sessionId }
}

async function refreshTokenIfNeeded(session, sessionId, request) {
  let { tokenSet, user } = session
  let permissions = user?.permissions || []

  tokenSet = new TokenSet(tokenSet)

  if (!tokenSet.expired()) {
    return { tokenSet, user, permissions }
  }

  try {
    const oidcClient = getOidcClient()
    const refreshedToken = await oidcClient.refresh(tokenSet.refresh_token)

    refreshedToken.refresh_token =
      refreshedToken.refresh_token ?? tokenSet.refresh_token

    tokenSet = refreshedToken
    user = refreshedToken.claims()

    // MG: We can fetch roles and permissions from the CDS API and add to the session e.g.
    // const refreshedRoles = await apiClient.get(`/users/${user.sub}/roles`)
    const refreshedRoles = [user.roles?.[0] || roleTypes.mipViewer]

    // MG: Hard-coded role & permissions to come from CDS API
    // permissions = await apiClient.get(`/users/${user.sub}/permissions`)
    permissions = refreshedRoles.flatMap((r) => rolePermissions[r] || [])

    // Save updated session
    await setSession(sessionId, {
      sessionId,
      userSub: session.userSub,
      tokenSet,
      user: {
        ...user,
        refreshedRoles,
        permissions
      }
    })

    return { tokenSet, user, permissions }
  } catch (err) {
    request.logger?.error('Token refresh failed', err)
    await dropSession(sessionId)
    request.cookieAuth.clear()
    return null
  }
}

/**
 * Register session middleware
 * @param {import('@hapi/hapi').Server} server
 */
export function registerSessionMiddleware(server) {
  server.ext('onPostAuth', sessionMiddleware)
}
