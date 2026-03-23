import Basic from '@hapi/basic'
import { DateTime } from 'luxon'

export const basicAuth = {
  plugin: {
    name: 'cognito-oidc',
    async register(server) {
      await server.register(Basic)

      server.auth.strategy(
        'default',
        'basic',
        /** @type {{ validate: BasicOptions.Validate }} */ ({
          validate(_request, username, password) {
            const credentials = dummyUsers[username]

            // No matching user found
            if (!credentials || credentials.password !== password) {
              return Promise.resolve({ isValid: false })
            }

            const { user } = credentials

            return Promise.resolve({
              credentials: { user },
              isValid: true
            })
          },
          challenge: true
        })
      )
      server.auth.default('default')
    }
  }
}

const dummyUsers = {
  defra: {
    password: 'testing', // 'secret'
    user: {
      id: 'dummy-id',
      email: 'dummy@defra.gov.uk',
      displayName: 'John Smith',
      issuedAt: DateTime.now().minus({ minutes: 30 }).toUTC().toISO(),
      expiresAt: DateTime.now().plus({ minutes: 30 }).toUTC().toISO()
    }
  }
}
