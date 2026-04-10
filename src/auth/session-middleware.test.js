import { sessionMiddleware } from './session-middleware.js'

vi.mock(import('./session-store.js'), () => ({
  getSession: vi.fn(),
  setSession: vi.fn(),
  dropSession: vi.fn()
}))

/*const { getSession, setSession, dropSession } = await import(
  './session-store.js'
)*/

describe('session-middleWare', () => {
  beforeAll(async () => {})

  afterAll(async () => {})

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when authentication not required', async () => {
    beforeAll(async () => {})

    const continueFunction = 'continue'
    let request = null

    beforeEach(async () => {
      request = {
        path: '/some-path/',
        route: {
          settings: {
            auth: true
          }
        },
        cookieAuth: {},
        auth: {
          artifacts: {
            sessionId: 'some-session-id'
          }
        }
      }
    })

    const h = { continue: continueFunction }
    let result = null

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
      expect(result).toEqual(continueFunction)
      expect(request.auth?.credentials).toBeUndefined()
    })
  })
})
