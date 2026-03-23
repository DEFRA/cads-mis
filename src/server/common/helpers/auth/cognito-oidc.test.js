import Hapi from '@hapi/hapi'

import { basicAuth } from './cognito-oidc.js'
import { statusCodes } from '../../constants/status-codes.js'

const validAuth = 'Basic ' + Buffer.from('defra:testing').toString('base64')
const wrongPassAuth = 'Basic ' + Buffer.from('defra:wrong').toString('base64')
const unknownUserAuth =
  'Basic ' + Buffer.from('unknown:testing').toString('base64')

async function createAuthServer() {
  const server = Hapi.server({ port: 0 })

  await server.register(basicAuth)

  server.route({
    method: 'GET',
    path: '/test',
    handler: (request) => request.auth.credentials.user
  })

  await server.initialize()
  return server
}

describe('#cognitoOidc - basicAuth plugin', () => {
  let server

  beforeAll(async () => {
    server = await createAuthServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should authenticate with valid credentials', async () => {
    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/test',
      headers: { authorization: validAuth }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.objectContaining({
        id: 'dummy-id',
        email: 'dummy@defra.gov.uk',
        displayName: 'John Smith'
      })
    )
    expect(result.issuedAt).toBeDefined()
    expect(result.expiresAt).toBeDefined()
  })

  test('Should reject an incorrect password', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/test',
      headers: { authorization: wrongPassAuth }
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })

  test('Should reject an unknown user', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/test',
      headers: { authorization: unknownUserAuth }
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })

  test('Should challenge when no credentials are provided', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/test'
    })

    expect(res.statusCode).toBe(statusCodes.unauthorized)
    expect(res.headers['www-authenticate']).toBeDefined()
  })

  test('Should set the default auth strategy', async () => {
    const strategies = server.auth.settings.default

    expect(strategies).toEqual(
      expect.objectContaining({
        strategies: ['default']
      })
    )
  })
})
