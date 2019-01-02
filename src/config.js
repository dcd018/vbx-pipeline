export const providers = {};

providers.twilio = {
  name: 'Twilio',
  credentials: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  },
  headers: {
    auth: {
      'user-agent': 'TwilioProxy/1.1',
    },
    required: [
      'host',
      'user-agent',
      'x-twilio-signature'
    ]
  },
  schemaMap: {
    externalId: 'MessageSid',
    provider: 'provider',
    accountId: 'AccountSid',
    from: {
      phone: 'From',
      city: 'FromCity',
      state: 'FromState',
      zip: 'FromZip',
      country: 'FromCountry'
    },
    status: 'SmsStatus',
    numMedia: 'NumMedia',
    media: {
      contentType: 'MediaContentType',
      url: 'MediaUrl'
    },
    body: 'Body',
    numSegments: 'NumSegments',
    apiVersion: 'ApiVersion'
  }
};

export const graphql = {
  endpoint: {
    protocol: process.env.GRAPHQL_ENDPOINT_PROTOCOL || 'http',
    host: process.env.GRAPHQL_ENDPOINT_HOST || 'localhost',
    port: process.env.GRAPHQL_ENDPOINT_PORT || 4000,
    req: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      json: true
    },
    getUri: () => `${graphql.endpoint.protocol}://${graphql.endpoint.host}:${graphql.endpoint.port}`
  },
  mutations: {
    createMessage: `mutation CreateMessage(
      $externalId: String!
      $accountId: String!
      $provider: String!
      $from: EntityInput!
      $status: String
      $numMedia: String
      $media: [MediaInput!]
      $body: String!
      $numSegments: String
      $apiVersion: String
    ) {
      createMessage(
        externalId: $externalId
        provider: $provider
        accountId: $accountId
        from: $from
        status: $status
        numMedia: $numMedia
        media: $media
        body: $body
        numSegments: $numSegments
        apiVersion: $apiVersion
      ) {
        id
      }
    }`,
  }
};