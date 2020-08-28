import * as Sentry from '@sentry/node'
import { Context } from 'koa'
import Environment from '../lib/Environment'

const { SENTRY_DSN } = process.env

class ErrorManager {
  static initialise = (): void => {
    if (Environment.PRODUCTION_MODE) {
      if (SENTRY_DSN) {
        Sentry.init({
          dsn: SENTRY_DSN,
        })
      } else {
        console.error(`Sentry DSN not provided!`)
      }
    }
  }

  static addDetail = (details: Record<string, unknown>): void => {
    if (Environment.PRODUCTION_MODE) {
      Sentry.addBreadcrumb({ ...details })
    } else {
      console.info(`ErrorManager.addDetail`, JSON.stringify(details))
    }
  }

  static captureError = (
    error: Error,
  ): void => {
    if (Environment.PRODUCTION_MODE) {
      Sentry.captureException(error)
    } else {
      console.error(`ErrorManager.captureError`, error)
    }
  }

  static koaErrorHandler = (error: Error, context: Context): void => {
    Sentry.withScope(scope => {
      scope.addEventProcessor(
        event => Sentry.Handlers.parseRequest(event, context.request),
      )
      ErrorManager.captureError(error)
    })
  }  
}

export default ErrorManager