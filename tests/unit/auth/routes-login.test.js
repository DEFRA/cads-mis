import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestServer } from '../../../tests/fixtures/server/create-server.js'

import { loginRoutes } from '../../../src/auth/routes-login.js'
import { setSession, getSession } from '../../../src/auth/session-store.js'
import { getAuthConfig } from '../../../src/auth/config/auth-config.js'

// Inline mocks
vi.mock('../../../src/auth/session-store.js', () => ({
  setSession: vi.fn(),
  getSession: vi.fn(),
  dropSession: vi.fn()
}))

vi.mock('../../../src/auth/config/auth-config.js', () => ({
  getAuthConfig: vi.fn()
}))

vi.mock('../../../src/auth/oidc-client.js', () => ({
  getOidcClient: vi.fn()
}))

describe('GET /auth/login', () => {
  let server

  beforeEach(async () => {
    getAuthConfig.mockReturnValue({
      clientId: 'client12345',
      redirectUri: 'http://localhost/auth/callback',
      scope: 'openid profile email',
      externalAuthorizeEndpoint: 'https://cads-oidc-mock/auth',
      defaultRedirect: '/dashboard'
    })

    server = await createTestServer(loginRoutes)
  })

  it('redirects to IdP with state + nonce and stores handshake', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/auth/login'
    })

    expect(res.statusCode).toBe(302)

    const redirectUrl = new URL(res.headers.location)

    // Correct IdP endpoint
    expect(redirectUrl.origin).toBe('https://cads-oidc-mock')

    // Correct OIDC params
    expect(redirectUrl.searchParams.get('client_id')).toBe('client12345')
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost/auth/callback'
    )
    expect(redirectUrl.searchParams.get('scope')).toBe('openid profile email')

    // Extract generated state + nonce
    const state = redirectUrl.searchParams.get('state')
    const nonce = redirectUrl.searchParams.get('nonce')

    expect(state).toBeTruthy()
    expect(nonce).toBeTruthy()

    // Redis handshake stored correctly
    expect(setSession).toHaveBeenCalledWith(
      `oidc:${state}`,
      expect.objectContaining({
        oidcState: state,
        oidcNonce: nonce,
        redirectTo: '/dashboard'
      })
    )

    // Cookie contains temp sessionId
    const cookie = res.headers['set-cookie'][0]
    expect(cookie).toMatch(/^sid=/)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Strict')
    expect(cookie.length).toBeGreaterThan(20)
  })

  it('clears cookie when cookieAuth.clear exists', async () => {
    server = await createTestServer(loginRoutes)

    const res = await server.inject({
      method: 'GET',
      url: '/auth/login',
      auth: {
        strategy: 'session',
        credentials: {},
        artifacts: {}
      }
    })

    const cookie = res.headers['set-cookie'][0]
    expect(cookie).toMatch(/^sid=/)
  })

  it('uses request.app.redirectTo when provided', async () => {
    server = await createTestServer(loginRoutes)

    const res = await server.inject({
      method: 'GET',
      url: '/auth/login',
      app: { redirectTo: '/custom' }
    })

    const redirectUrl = new URL(res.headers.location)
    const state = redirectUrl.searchParams.get('state')

    expect(setSession).toHaveBeenCalledWith(
      `oidc:${state}`,
      expect.objectContaining({ redirectTo: '/custom' })
    )
  })

  it('redirects with error when IdP returns error', async () => {
    server = await createTestServer(loginRoutes)

    const res = await server.inject({
      method: 'GET',
      url: '/auth/callback?error=access_denied'
    })

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('/?error=access_denied')
  })

  it('returns 500 when session cookie missing', async () => {
    server = await createTestServer(loginRoutes)

    const res = await server.inject({
      method: 'GET',
      url: '/auth/callback?code=123'
    })

    expect(res.statusCode).toBe(500)
    expect(res.result.message).toBe('An internal server error occurred')
  })

  it('returns 500 when handshake missing', async () => {
    getSession.mockResolvedValue(null)

    server = await createTestServer(loginRoutes)

    const res = await server.inject({
      method: 'GET',
      url: '/auth/callback?code=123',
      auth: {
        strategy: 'session',
        credentials: { sessionId: 'oidc:STATE' }
      }
    })

    expect(res.statusCode).toBe(500)
    expect(res.result.message).toBe('An internal server error occurred')
  })
})
