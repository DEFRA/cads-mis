import { getAuthConfig } from './config/auth-config.js'
import { getOidcClient } from './oidc-client.js'
import { dropSession } from './session-store.js'

/**
 * @satisfies {import('@hapi/hapi').ServerRoute[]}
 */
export const logoutRoutes = [
  {
    method: ['GET'],
    path: '/auth/logout',
    options: {
      auth: false
    },
    handler: async (request, h) => {
      const cookie = request.cookieAuth.get()

      if (cookie?.sessionId) {
        await dropSession(cookie.sessionId)
      }

      request.cookieAuth.clear()

      const authConfig = getAuthConfig()
      const oidcClient = await getOidcClient()

      // Build provider logout URL
      const endSessionUrl = oidcClient.endSessionUrl({
        post_logout_redirect_uri: authConfig.postLogoutRedirectUri
      })

      return h.redirect(endSessionUrl)
    }
  },
  {
    method: ['GET'],
    path: '/auth/signed-out',
    options: {
      auth: false
    },
    handler: async (request, h) => {
      return h.redirect('/')
    }
  }
]
