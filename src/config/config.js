import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import convictFormatWithValidator from 'convict-format-with-validator'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Add custom formats once
convict.addFormats(convictFormatWithValidator)

// Lazily computed environment flags
function getEnvFlags() {
  const env = process.env.NODE_ENV
  return {
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    isTest: env === 'test'
  }
}

// Lazily built schema
function buildSchema() {
  const fourHoursMs = 14400000
  const oneWeekMs = 604800000
  const { isProduction, isDevelopment, isTest } = getEnvFlags()

  return {
    serviceVersion: {
      doc: 'The service version, this variable is injected into your docker container in CDP environments',
      format: String,
      nullable: true,
      default: null,
      env: 'SERVICE_VERSION'
    },
    host: {
      doc: 'The IP address to bind',
      format: 'ipaddress',
      default: '0.0.0.0',
      env: 'HOST'
    },
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 3000,
      env: 'PORT'
    },
    staticCacheTimeout: {
      doc: 'Static cache timeout in milliseconds',
      format: Number,
      default: oneWeekMs,
      env: 'STATIC_CACHE_TIMEOUT'
    },
    serviceName: {
      doc: 'Applications Service Name',
      format: String,
      default: 'CADS Management Information Portal'
    },
    root: {
      doc: 'Project root',
      format: String,
      default: path.resolve(dirname, '../..')
    },
    assetPath: {
      doc: 'Asset path',
      format: String,
      default: '/public',
      env: 'ASSET_PATH'
    },
    isProduction: {
      doc: 'If this application running in the production environment',
      format: Boolean,
      default: isProduction
    },
    isDevelopment: {
      doc: 'If this application running in the development environment',
      format: Boolean,
      default: isDevelopment
    },
    isTest: {
      doc: 'If this application running in the test environment',
      format: Boolean,
      default: isTest
    },
    log: {
      enabled: {
        doc: 'Is logging enabled',
        format: Boolean,
        default: process.env.NODE_ENV !== 'test',
        env: 'LOG_ENABLED'
      },
      level: {
        doc: 'Logging level',
        format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
        default: 'info',
        env: 'LOG_LEVEL'
      },
      format: {
        doc: 'Format to output logs in.',
        format: ['ecs', 'pino-pretty'],
        default: isProduction ? 'ecs' : 'pino-pretty',
        env: 'LOG_FORMAT'
      },
      redact: {
        doc: 'Log paths to redact',
        format: Array,
        default: isProduction
          ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
          : []
      }
    },
    httpProxy: {
      doc: 'HTTP Proxy',
      format: String,
      nullable: true,
      default: null,
      env: 'HTTP_PROXY'
    },
    isSecureContextEnabled: {
      doc: 'Enable Secure Context',
      format: Boolean,
      default: isProduction,
      env: 'ENABLE_SECURE_CONTEXT'
    },
    isMetricsEnabled: {
      doc: 'Enable metrics reporting',
      format: Boolean,
      default: isProduction,
      env: 'ENABLE_METRICS'
    },
    session: {
      cache: {
        engine: {
          doc: 'backend cache is written to',
          format: ['redis', 'memory'],
          default: isProduction ? 'redis' : 'memory',
          env: 'SESSION_CACHE_ENGINE'
        },
        name: {
          doc: 'server side session cache name',
          format: String,
          default: 'session',
          env: 'SESSION_CACHE_NAME'
        },
        ttl: {
          doc: 'server side session cache ttl',
          format: Number,
          default: fourHoursMs,
          env: 'SESSION_CACHE_TTL'
        }
      },
      cookie: {
        ttl: {
          doc: 'Session cookie ttl',
          format: Number,
          default: fourHoursMs,
          env: 'SESSION_COOKIE_TTL'
        },
        password: {
          doc: 'session cookie password',
          format: String,
          default: 'the-password-must-be-at-least-32-characters-long',
          env: 'SESSION_COOKIE_PASSWORD',
          sensitive: true
        },
        secure: {
          doc: 'set secure flag on cookie',
          format: Boolean,
          default: isProduction,
          env: 'SESSION_COOKIE_SECURE'
        }
      }
    },
    redis: {
      host: {
        doc: 'Redis cache host',
        format: String,
        default: '127.0.0.1',
        env: 'REDIS_HOST'
      },
      port: {
        doc: 'Redis cache port',
        format: Number,
        default: 6379,
        env: 'REDIS_PORT'
      },
      username: {
        doc: 'Redis cache username',
        format: String,
        default: '',
        env: 'REDIS_USERNAME'
      },
      password: {
        doc: 'Redis cache password',
        format: '*',
        default: '',
        sensitive: true,
        env: 'REDIS_PASSWORD'
      },
      keyPrefix: {
        doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
        format: String,
        default: 'cads-mis:',
        env: 'REDIS_KEY_PREFIX'
      },
      useSingleInstanceCache: {
        doc: 'Connect to a single instance of redis instead of a cluster.',
        format: Boolean,
        default: !isProduction,
        env: 'USE_SINGLE_INSTANCE_CACHE'
      },
      useTLS: {
        doc: 'Connect to redis using TLS',
        format: Boolean,
        default: isProduction,
        env: 'REDIS_TLS'
      }
    },
    nunjucks: {
      watch: {
        doc: 'Reload templates when they are changed.',
        format: Boolean,
        default: isDevelopment
      },
      noCache: {
        doc: 'Use a cache and recompile templates each time',
        format: Boolean,
        default: isDevelopment
      }
    },
    tracing: {
      header: {
        doc: 'Which header to track',
        format: String,
        default: 'x-cdp-request-id',
        env: 'TRACING_HEADER'
      }
    },
    oidc: {
      clientId: {
        doc: 'OIDC client ID',
        format: String,
        default: '',
        env: 'OIDC_CLIENT_ID'
      },
      clientSecret: {
        doc: 'OIDC client secret',
        format: String,
        default: '',
        env: 'OIDC_CLIENT_SECRET',
        sensitive: true
      },
      redirectUri: {
        doc: 'OIDC redirect URI',
        format: String,
        default: '',
        env: 'OIDC_REDIRECT_URI'
      },
      postLogoutRedirectUri: {
        doc: 'OIDC post logout redirect URI',
        format: String,
        default: '',
        env: 'OIDC_POST_LOGOUT_REDIRECT_URI'
      },
      postLoginDefaultRedirectUri: {
        doc: 'OIDC post login default redirect URI',
        format: String,
        default: '',
        env: 'OIDC_POST_LOGIN_REDIRECT_URI'
      },
      wellKnownUrl: {
        doc: 'OIDC well-known configuration URL',
        format: String,
        default: '',
        env: 'OIDC_WELL_KNOWN_URL'
      },
      externalAuthorizeEndpoint: {
        doc: 'OIDC external endpoint for connect/authorize',
        format: String,
        default: '',
        env: 'OIDC_AUTHORIZATION_ENDPOINT'
      },
      externalEndSessionEndpoint: {
        doc: 'OIDC external endpoint for connect/endsession',
        format: String,
        default: '',
        env: 'OIDC_END_SESSION_ENDPOINT'
      },
      enableDebugEndpoints: {
        doc: 'Register debug endpoints for auth.',
        format: Boolean,
        default: false,
        env: 'OIDC_ENABLE_DEBUG_ENDPOINTS'
      }
    },
    azure: {
      cadsCdsClientId: {
        doc: 'Client ID of the CADS CDS API (resource server)',
        format: String,
        default: '',
        env: 'AZURE_CLIENT_CADS_CDS_ID'
      },
      useSimpleScopes: {
        doc: 'Use simple scope names (for mock OIDC or integration tests)',
        format: Boolean,
        default: false,
        env: 'USE_SIMPLE_SCOPES'
      }
    },
    cadsBackendUrl: {
      doc: 'CADS Backend API base URL',
      format: String,
      default: 'http://localhost:5555',
      env: 'CADS_BACKEND_URL'
    }
  }
}

let cachedConfig

export function getConfig() {
  if (!cachedConfig) {
    const schema = buildSchema()
    cachedConfig = convict(schema).validate({ allowed: 'strict' })
  }
  return cachedConfig
}
