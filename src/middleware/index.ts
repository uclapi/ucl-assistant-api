import { Context, Next } from 'koa'
import ErrorManager from '../lib/ErrorManager'
import * as auth from './auth'
export { auth }

/**
 * Middleware that records the response time of the request
 * @param  {Koa.ctx}   ctx Koa context
 * @param  {Function} next async function to call next
 */
export const timer = async (ctx: Context, next: Next): Promise<void> => {
  const start = new Date().getTime()
  await next()
  const ms = new Date().getTime() - start
  ctx.set(`x-response-time`, `${ms}ms`)
}

/**
 * Middleware that logs the request path and response code
 * @param  {Koa.ctx}   ctx Koa context
 * @param  {Function} next async function to call next
 */
export const logger = async (ctx: Context, next: Next): Promise<void> => {
  ErrorManager.addDetail({
    method: ctx.method,
    url: ctx.url,
    headers: ctx.headers,
  })
  await next()
}

export const jsonFormatPretty = (ctx: Context): string =>
  JSON.stringify(
    {
      content: ctx.body,
      error: ctx.error || ``,
    },
    null,
    2,
  )

const jsonFormat = (ctx: Context): string =>
  JSON.stringify({
    content: ctx.body,
    error: ctx.error || ``,
  })

/**
 * Middleware that encapsulates reponse body in a JSON object
 * @param  {Koa.ctx}   ctx Koa context
 * @param  {Function} next async function to call next
 */
export const jsonify = async (ctx: Context, next: Next): Promise<void> => {
  ctx.state.jsonify = true
  try {
    await next()
  } catch (error) {
    if (error.response && error.response.status && error.response.data) {
      ErrorManager.addDetail({
        status: error.response.status,
        response: JSON.stringify(error.response.data),
      })
    }
    if (typeof error.message === `string`) {
      ctx.error = error.message
    } else {
      ctx.error = JSON.stringify(error.message, null, 2)
    }

    if (![400, 404].includes(error.status)) {
      ErrorManager.addDetail({ response: error.response })
      ErrorManager.addDetail({ requestHeaders: ctx.headers })
      ErrorManager.captureError(error)
    }

    ctx.status = error.status || 500
    ctx.body = { error: ctx.error }
  }

  if (ctx.state.jsonify) {
    // pretty-print if the pretty query variable is present
    ctx.body = ctx.query.pretty ? jsonFormatPretty(ctx) : jsonFormat(ctx)
    ctx.set({ "Content-Type": `application/json` })
  }
}
