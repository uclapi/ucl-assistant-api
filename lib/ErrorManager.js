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

const addDetail = (details) => {
  if (PRODUCTION_MODE) {
    Sentry.addBreadcrumb({ ...details })
  } else {
    console.info(`ErrorManager.addDetail`, JSON.stringify(details))
  }
}

const captureError = (
  error,
) => {
  if (PRODUCTION_MODE) {
    Sentry.captureException(error)
  } else {
    console.error(`ErrorManager.captureError`, error)
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