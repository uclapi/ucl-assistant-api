if (process.env.NODE_ENV !== `production`) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require(`dotenv`).config()
}

import fs from 'fs'
import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import mount from 'koa-mount'
import session from 'koa-session'
import redis from 'redis'
import { promisify } from 'util'
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
  !process.env.UCLAPI_CLIENT_ID ||
  !process.env.UCLAPI_CLIENT_SECRET ||
  !process.env.UCLAPI_TOKEN
) {
  console.error(
    `Error! You have not set the UCLAPI_CLIENT_ID, ` +
    `UCLAPI_TOKEN, or UCLAPI_CLIENT_SECRET environment variables.`,
  )
  console.log(`Please set them to run this app.`)
  process.abort()
}

if (!process.env.SECRET) {
  console.warn(
    `Warning: You have not set the SECRET environment variable. ` +
    `This is not secure and definitely not recommended.`,
  )
}

if (!process.env.NOTIFICATIONS_URL && process.env.TEST_MODE !== `true`) {
  console.warn(
    `Warning: You have not set the NOTIFICATION_URL ` +
    `environment variable. This means that notification ` +
    `actions will be disabled.`,
  )
}

app.keys = [process.env.SECRET || `secret`]

if (process.env.TEST_MODE !== `true`) {
  const connectionString = process.env.REDIS_URL

  if (connectionString === undefined) {
    console.error(`Please set the REDIS_URL environment variable`)
    process.exit(1)
  }

  if (connectionString.startsWith(`rediss://`)) {
    app.context.redisClient = redis.createClient(connectionString, {
      tls: { servername: new URL(connectionString).hostname },
    })
  } else {
    app.context.redisClient = redis.createClient(connectionString)
  }

  app.context.redisGet = promisify(app.context.redisClient.get).bind(
    app.context.redisClient,
  )
  app.context.redisSetex = promisify(app.context.redisClient.setex).bind(
    app.context.redisClient,
  )
  app.context.redisSet = promisify(app.context.redisClient.set).bind(
    app.context.redisClient,
  )
}

app.use(session({}, app))

app.use(bodyparser())
app.use(timer)
app.use(logger)
app.use(jsonify)
// import and use the UCL API router.
app.use(mount(`/notifications`, Notifications))
app.use(mount(UCLAPI))
app.use(mount(router))

app.on(`error`, ErrorManager.koaErrorHandler)

if (!module.parent) {
  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`UCL Assistant API listening on ${port}`)
}

export default app
