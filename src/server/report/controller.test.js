import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#reportController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response from holding summary request', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/report/holding_summary'
    })

    expect(result).toEqual(expect.stringContaining('Holding Summary'))
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should provide expected response from GB cattle registrations request', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/report/gb_cattle_registrations'
    })

    expect(result).toEqual(
      expect.stringContaining('Monthly GB cattle registrations')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})
