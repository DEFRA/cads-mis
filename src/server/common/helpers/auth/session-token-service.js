/**
 * Session token service
 *
 * Stores, retrieves and removes Azure AD OAuth tokens
 * from the server-side session cache (yar → catbox-redis).
 *
 * All methods expect a Hapi `request` object that has yar available.
 */

import { config } from '../../../../config/config.js'

const TOKEN_KEY = 'azureAdTokens'

/**
 * Store the full token set in the session.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {{ accessToken: string, refreshToken?: string, idToken?: string, expiresIn: number, tokenType: string, scope?: string }} tokens
 */
export function setAuthTokens(request, tokens) {
  const storedAt = Date.now()

  request.yar.set(TOKEN_KEY, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? null,
    idToken: tokens.idToken ?? null,
    expiresIn: tokens.expiresIn,
    expiresAt: storedAt + tokens.expiresIn * 1000,
    tokenType: tokens.tokenType,
    scope: tokens.scope ?? null,
    storedAt
  })
}

/**
 * Retrieve the stored token set.
 *
 * @param {import('@hapi/hapi').Request} request
 * @returns {object|null}  The token object, or null if not present.
 */
export function getAuthTokens(request) {
  return request.yar.get(TOKEN_KEY) ?? null
}

/**
 * Get just the access token string (convenience helper for API calls).
 *
 * @param {import('@hapi/hapi').Request} request
 * @returns {string|null}
 */
export function getAccessToken(request) {
  const tokens = getAuthTokens(request)
  return tokens?.accessToken ?? null
}

/**
 * Check whether the stored access token has expired.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {number} [bufferMs=60000] — consider it expired this many ms early (default 60 s)
 * @returns {boolean} true if expired or no tokens present
 */
export function isTokenExpired(request, bufferMs = 60_000) {
  const tokens = getAuthTokens(request)
  if (!tokens) {
    return true
  }
  return Date.now() >= tokens.expiresAt - bufferMs
}

/**
 * Remove all auth tokens from the session (used at logout).
 *
 * @param {import('@hapi/hapi').Request} request
 */
export function dropAuthTokens(request) {
  request.yar.clear(TOKEN_KEY)
}

/**
 * Drop the entire session (logout + session destroy).
 *
 * @param {import('@hapi/hapi').Request} request
 */
export function destroySession(request) {
  request.yar.reset()
}

/**
 * Refresh the access token using the refresh token.
 * @param {import('@hapi/hapi').Request} request
 * @returns {boolean} true if refresh succeeded and tokens updated, false otherwise
 */
export async function refreshAuthTokens(request) {
  const tokens = getAuthTokens(request)
  if (!tokens?.refreshToken) {
    return false
  }

  const tenantId = config.get('azureAd.tenantId')

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.get('azureAd.clientId'),
        client_secret: config.get('azureAd.clientSecret'),
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        scope: 'openid profile email offline_access'
      })
    }
  )

  if (!response.ok) {
    return false
  }

  const newTokens = await response.json()
  setAuthTokens(request, {
    accessToken: newTokens.access_token,
    refreshToken: newTokens.refresh_token,
    idToken: newTokens.id_token,
    expiresIn: newTokens.expires_in,
    tokenType: newTokens.token_type,
    scope: newTokens.scope
  })

  return true
}
