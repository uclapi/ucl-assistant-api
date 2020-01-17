const Sentry = require(`@sentry/node`)

const PRODUCTION_MODE = process.env.NODE_ENV === `production`
const { SENTRY_DSN } = process.env

const initialise = () => {
  if (PRODUCTION_MODE) {
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
      })
    } else {
      console.error(`Sentry DSN not provided!`)
    }
  }
}

const addDetail = details => {
  if (PRODUCTION_MODE) {
    Sentry.addBreadcrumb({ ...details })
  } else {
    console.info(JSON.stringify(details))
  }
}

const captureError = (
  error,
  details,
  user,
) => {
  if (PRODUCTION_MODE) {
    if (details) {
      Sentry.withScope((scope) => {
        if (typeof details === `object`) {
          Object.entries(details).forEach(([attr, val]) => {
            scope.setExtra(attr, val)
          })
        } else {
          scope.setExtra(`details`, details)
        }

        if (typeof user === `object`) {
          scope.setUser({ ...user })
        }
        Sentry.captureException(error)
      })
    } else {
      Sentry.captureException(error)
    }
  } else {
    console.error(error)
  }
}

const koaErrorHandler = (error, context) => {
  Sentry.withScope(scope => {
    scope.addEventProcessor(
      event => Sentry.Handlers.parseRequest(event, context.request),
    )
    captureError(error)
  })
}

module.exports = {
  initialise,
  addDetail,
  captureError,
  koaErrorHandler,
}