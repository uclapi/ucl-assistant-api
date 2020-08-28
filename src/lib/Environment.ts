const {
  UCLAPI_TOKEN,
  UCLAPI_CLIENT_ID,
  UCLAPI_CLIENT_SECRET,
  SECRET,
  API_URL,
  NOTIFICATIONS_URL,
  REDIS_URL,
  NODE_ENV,
  TEST_MODE,
  PORT,
} = process.env

class Environment {
  static TOKEN = UCLAPI_TOKEN
  static CLIENT_ID = UCLAPI_CLIENT_ID
  static CLIENT_SECRET = UCLAPI_CLIENT_SECRET

  static SECRET = SECRET

  static API_URL = API_URL
  static NOTIFICATIONS_URL = NOTIFICATIONS_URL
  static REDIS_URL = REDIS_URL

  static NODE_ENV = NODE_ENV
  static DEVELOPMENT_MODE = NODE_ENV === `development`
  static PRODUCTION_MODE = NODE_ENV === `production`
  static TEST_MODE = TEST_MODE === `true`
  static PORT = PORT
}

export default Environment