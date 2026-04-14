export function buildOidcSchema() {
  return {
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
  }
}
