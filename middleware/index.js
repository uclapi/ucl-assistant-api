const ErrorManager = require(`../lib/ErrorManager`)
const auth = require(`./auth`)

/**
 * Middleware that records the response time of the request
 * @param  {Koa.ctx}   ctx Koa context
 * @param  {Function} next async function to call next
 */
const timer = async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  ctx.set(`x-response-time`, `${ms}ms`)
}

/**
 * Middleware that logs the request path and response code
 * @param  {Koa.ctx}   ctx Koa context
 * @param  {Function} next async function to call next
 */
const logger = async (ctx, next) => {
  ErrorManager.addDetail({
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    message: ctx.message,
    headers: ctx.headers,
  })
  await next()
}

const jsonFormatPretty = ctx =>
  JSON.stringify(
    {
      content: ctx.body,
      error: ctx.error || ``,
    },
    `\n`,
    3,
  )

const jsonFormat = ctx =>
  JSON.stringify({
    content: ctx.body,
    error: ctx.error || ``,
  })

/**
 * Middleware that encapsulates reponse body in a JSON object
 * @param  {Koa.ctx}   ctx Koa context
 * @param  {Function} next async function to call next
 */
const jsonify = async (ctx, next) => {
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
      ctx.error = JSON.stringify(error.message, `\n`, 2)
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

module.exports = {
  jsonify,
  logger,
  timer,
  auth,
}
