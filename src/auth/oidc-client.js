import { Issuer } from 'openid-client'
import { getAuthConfig } from './config/auth-config.js'

let clientPromise = null

/**
 * @returns {Promise<import('openid-client').Client>}
 */
export async function getOidcClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const authConfig = getAuthConfig()
      const issuer = await Issuer.discover(authConfig.oidcWellKnownUrl)

      return new issuer.Client({
        client_id: authConfig.clientId,
        client_secret: authConfig.clientSecret,
        redirect_uris: [authConfig.redirectUri],
        response_types: ['code']
      })
    })()
  }
  return clientPromise
}
