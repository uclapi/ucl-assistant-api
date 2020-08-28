import fs from 'fs'
import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import mount from 'koa-mount'
import Pino from 'koa-pino-logger'
import session from 'koa-session'
import redis from 'redis'
import { promisify } from 'util'
import Environment from './lib/Environment'
import ErrorManager from './lib/ErrorManager'
import { jsonify, logger, timer } from './middleware'
import Notifications from './notifications'
import router from './router'
import UCLAPI from './uclapi'

// eslint-disable-next-line security/detect-non-literal-fs-filename
const { version } = JSON.parse(fs.readFileSync(`./package.json`, `utf-8`))

ErrorManager.initialise()

const app = new Koa()

app.context.version = version

console.log(`Running server version ${version}`)

if (
  !Environment.CLIENT_ID ||
  !Environment.CLIENT_SECRET ||
  !Environment.TOKEN
) {
  console.error(
    `Error! You have not set the UCLAPI_CLIENT_ID, ` +
    `UCLAPI_TOKEN, or UCLAPI_CLIENT_SECRET environment variables.`,
  )
  console.log(`Please set them to run this app.`)
  process.abort()
}

if (!Environment.SECRET) {
  console.warn(
    `Warning: You have not set the SECRET environment variable. ` +
    `This is not secure and definitely not recommended.`,
  )
}

if (!Environment.NOTIFICATIONS_URL && !Environment.TEST_MODE) {
  console.warn(
    `Warning: You have not set the NOTIFICATION_URL ` +
    `environment variable. This means that notification ` +
    `actions will be disabled.`,
  )
}

app.keys = [Environment.SECRET || `secret`]

if (!Environment.TEST_MODE) {
  const connectionString = Environment.REDIS_URL

  if (connectionString === undefined) {
    console.error(`Please set the REDIS_URL environment variable`)
    process.exit(1)
  }

  if (connectionString.startsWith(`redis://`)) {
    app.context.redisClient = redis.createClient(connectionString, {
      tls: { servername: new URL(connectionString).hostname },
    })
  } else {
    app.context.redisClient = redis.createClient(connectionString)
  }

  app.context.redisGet = promisify(app.context.redisClient.get).bind(
    app.context.redisClient,
  )
  app.context.redisSet = promisify(app.context.redisClient.set).bind(
    app.context.redisClient,
  )
}

app.use(session({}, app))

app.use(bodyparser())
app.use(timer)
app.use(Pino())
app.use(logger)
app.use(jsonify)
// import and use the UCL API router.
app.use(mount(`/notifications`, Notifications))
app.use(mount(UCLAPI))
app.use(mount(router))

app.on(`error`, ErrorManager.koaErrorHandler)

if (!module.parent) {
  const port = Environment.PORT || 3000
  app.listen(port)
  console.log(`UCL Assistant API listening on ${port}`)
}

export default app
