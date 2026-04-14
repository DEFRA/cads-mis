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

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/report/holding_summary'
    })

    expect(result).toEqual(expect.stringContaining('Report |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
