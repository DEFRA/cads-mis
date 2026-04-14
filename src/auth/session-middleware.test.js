import { sessionMiddleware } from './session-middleware.js'

vi.mock(import('./session-store.js'), () => ({
  getSession: vi.fn(),
  setSession: vi.fn(),
  dropSession: vi.fn()
}))

vi.mock(import('./oidc-client.js'), () => ({
  getOidcClient: vi.fn()
}))

vi.mock(import('openid-client'), () => ({
  TokenSet: vi.fn(
    class {
      static getType = vi.fn(() => 'mocked tokenSet')
      constructor(tokenSet) {
        this.expired = tokenSet.expired
      }
    }
  )
}))

const { getSession } = await import('./session-store.js')

describe('session-middleWare', () => {
  beforeAll(async () => {})

  const continueFunction = 'continue'
  let request = null
  const clearCookieAuth = vi.fn()
  const refreshUser = { roles: [] }
  const refreshToken = 'refresh_token'
  const tokenSet = {
    expired: () => false,
    refresh_token: refreshToken,
    claims: vi.fn().mockResolvedValue(refreshUser)
  }
  const user = {}
  const currentSession = { tokenSet, user }

  afterAll(async () => {})

  beforeEach(() => {
    vi.clearAllMocks()

    getSession.mockResolvedValue(currentSession)

    request = {
      path: '/some-path/',
      route: {
        settings: {
          auth: true
        }
      },
      cookieAuth: { clear: clearCookieAuth },
      auth: {
        artifacts: {
          sessionId: 'some-session-id'
        }
      }
    }
  })

  let result = null
  const h = { continue: continueFunction }

  test('when already authorised', async () => {
    result = await sessionMiddleware(request, h)
    expect(clearCookieAuth).toHaveBeenCalledTimes(0)
    expect(result).toEqual(continueFunction)
    expect(request.auth?.credentials).toBeDefined()
    expect(request.auth?.credentials.user).toBeDefined()
    expect(request.auth?.credentials.user.roles).toBeDefined()
    expect(request.auth?.credentials.user.permissions).toBeDefined()
    expect(request.auth?.credentials.tokenSet).toBeDefined()
  })

  test('when user roles and permissions are undefined', async () => {
    user.roles = null
    user.permissions = null

    result = await sessionMiddleware(request, h)

    expect(request.auth?.credentials.user.roles).toStrictEqual([])
    expect(request.auth?.credentials.user.permissions).toStrictEqual([])
  })

  test('when user roles and permissions are defined', async () => {
    user.roles = ['a', 'b']
    user.permissions = ['x', 'y', 'z']

    result = await sessionMiddleware(request, h)

    expect(request.auth?.credentials.user.roles).toStrictEqual(['a', 'b'])
    expect(request.auth?.credentials.user.permissions).toStrictEqual([
      'x',
      'y',
      'z'
    ])
  })

  describe('when authentication not required', async () => {
    beforeAll(async () => {})

    beforeEach(async () => {})

    test.each([
      { reason: 'because content is static', path: '/public/any-file.html' },
      { reason: 'because content is static', path: '/assets/any-file.png' },
      {
        reason: 'because content is static',
        path: '/stylesheets/any-file.css'
      },
      { reason: 'because content is static', path: '/javascripts/any-file.js' },
      {
        reason: 'because is OIDC handshake route',
        path: '/auth/login/something'
      },
      {
        reason: 'because is OIDC handshake route',
        path: '/auth/callback/something'
      }
    ])('$reason: for $path', async ({ reason, path }) => {
      request.path = path
      result = await sessionMiddleware(request, h)
      expect(result).toEqual(continueFunction)
      expect(request.auth?.credentials).toBeUndefined()
    })

    test.each([
      {
        reason: 'because is route that explicitly disables auth',
        customiseRequest: (request) => {
          request.route.settings.auth = false
        }
      },
      {
        reason: 'because is missing cookieauth',
        customiseRequest: (request) => {
          request.cookieAuth = null
        }
      },
      {
        reason: 'because is missing auth',
        customiseRequest: (request) => {
          request.auth = null
        }
      },
      {
        reason: 'because is missing auth cookie',
        customiseRequest: (request) => {
          request.auth.artifacts = null
        }
      },
      {
        reason: 'because is missing session id',
        customiseRequest: (request) => {
          request.auth.artifacts.sessionId = ''
        }
      }
    ])('$reason', async ({ reason, customiseRequest }) => {
      customiseRequest(request)
      result = await sessionMiddleware(request, h)
      expect(clearCookieAuth).toHaveBeenCalledTimes(0)
      expect(result).toEqual(continueFunction)
      expect(request.auth?.credentials).toBeUndefined()
    })

    test('because session is missing', async () => {
      getSession.mockResolvedValue(null)

      result = await sessionMiddleware(request, h)
      expect(clearCookieAuth).toHaveBeenCalledTimes(1)
      expect(result).toEqual(continueFunction)
      expect(request.auth?.credentials).toBeUndefined()
    })
  })
})
