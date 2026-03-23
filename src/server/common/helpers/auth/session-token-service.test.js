import { describe, test, expect, vi, beforeEach } from 'vitest'
import {
  setAuthTokens,
  getAuthTokens,
  dropAuthTokens,
  isTokenExpired,
  refreshAuthTokens,
  getAccessToken,
  destroySession
} from './session-token-service.js'

vi.mock('../../../../config/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      const values = {
        'azureAd.tenantId': 'test-tenant-id',
        'azureAd.clientId': 'test-client-id',
        'azureAd.clientSecret': 'test-client-secret'
      }
      return values[key]
    })
  }
}))

function createMockRequest() {
  const store = {}
  return {
    yar: {
      set: vi.fn((key, value) => {
        store[key] = value
      }),
      get: vi.fn((key) => store[key] ?? null),
      clear: vi.fn((key) => {
        delete store[key]
      }),
      reset: vi.fn(() => Object.keys(store).forEach((k) => delete store[k]))
    }
  }
}

describe('session-token-service', () => {
  test('stores and retrieves tokens', () => {
    const request = createMockRequest()
    setAuthTokens(request, {
      accessToken: 'abc',
      refreshToken: 'def',
      expiresIn: 3600,
      tokenType: 'Bearer'
    })
    const result = getAuthTokens(request)
    expect(result.accessToken).toBe('abc')
    expect(result.refreshToken).toBe('def')
  })

  test('stores and retrieves access token', () => {
    const request = createMockRequest()
    setAuthTokens(request, {
      accessToken: 'abc',
      refreshToken: 'def',
      expiresIn: 3600,
      tokenType: 'Bearer'
    })
    const result = getAccessToken(request)
    expect(result).toBe('abc')
  })

  test('stores, retrieves, and destroys session', () => {
    const request = createMockRequest()
    setAuthTokens(request, {
      accessToken: 'abc',
      refreshToken: 'def',
      expiresIn: 3600,
      tokenType: 'Bearer'
    })
    const beforeResult = getAccessToken(request)
    expect(beforeResult).toBe('abc')
    destroySession(request)
    expect(request.yar.reset).toHaveBeenCalled()
    const afterResult = getAccessToken(request)
    expect(afterResult).toBe(null)
  })

  test('drops tokens', () => {
    const request = createMockRequest()
    setAuthTokens(request, {
      accessToken: 'abc',
      expiresIn: 3600,
      tokenType: 'Bearer'
    })
    dropAuthTokens(request)
    expect(getAuthTokens(request)).toBeNull()
  })

  test('detects expired tokens', () => {
    const request = createMockRequest()
    setAuthTokens(request, {
      accessToken: 'abc',
      expiresIn: 0,
      tokenType: 'Bearer'
    })
    expect(isTokenExpired(request)).toBe(true)
  })

  describe('#refreshAuthTokens', () => {
    const mockFetch = vi.fn()

    beforeEach(() => {
      vi.stubGlobal('fetch', mockFetch)
    })

    test('Should return false when no tokens are stored', async () => {
      const request = createMockRequest()

      const result = await refreshAuthTokens(request)

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    test('Should return false when no refresh token is stored', async () => {
      const request = createMockRequest()
      setAuthTokens(request, {
        accessToken: 'abc',
        expiresIn: 3600,
        tokenType: 'Bearer'
      })

      const result = await refreshAuthTokens(request)

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    test('Should return false when the token endpoint returns an error', async () => {
      const request = createMockRequest()
      setAuthTokens(request, {
        accessToken: 'abc',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
        tokenType: 'Bearer'
      })

      mockFetch.mockResolvedValue({ ok: false, status: 400 })

      const result = await refreshAuthTokens(request)

      expect(result).toBe(false)
    })

    test('Should call the Azure AD token endpoint with the correct parameters', async () => {
      const request = createMockRequest()
      setAuthTokens(request, {
        accessToken: 'abc',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
        tokenType: 'Bearer'
      })

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          id_token: 'new-id',
          expires_in: 7200,
          token_type: 'Bearer',
          scope: 'openid profile email'
        })
      })

      await refreshAuthTokens(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.any(URLSearchParams)
        }
      )

      const body = mockFetch.mock.calls[0][1].body
      expect(body.get('client_id')).toBe('test-client-id')
      expect(body.get('client_secret')).toBe('test-client-secret')
      expect(body.get('grant_type')).toBe('refresh_token')
      expect(body.get('refresh_token')).toBe('refresh-123')
      expect(body.get('scope')).toBe('openid profile email offline_access')
    })

    test('Should update the session with new tokens on success', async () => {
      const request = createMockRequest()
      setAuthTokens(request, {
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
        expiresIn: 3600,
        tokenType: 'Bearer'
      })

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          id_token: 'new-id',
          expires_in: 7200,
          token_type: 'Bearer',
          scope: 'openid profile email'
        })
      })

      const result = await refreshAuthTokens(request)

      expect(result).toBe(true)

      const tokens = getAuthTokens(request)
      expect(tokens.accessToken).toBe('new-access')
      expect(tokens.refreshToken).toBe('new-refresh')
      expect(tokens.idToken).toBe('new-id')
      expect(tokens.expiresIn).toBe(7200)
      expect(tokens.tokenType).toBe('Bearer')
      expect(tokens.scope).toBe('openid profile email')
    })
  })
})
