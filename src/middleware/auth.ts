import jsonwebtoken from 'jsonwebtoken'
import { Context, Next } from 'koa'
import koaJwt from 'koa-jwt'
import Environment from '../lib/Environment'

export const authenticate = async (ctx: Context, next: Next): Promise<void> => {
  if (ctx.session.isNew) {
    ctx.throw(`You need to be authenticated to access this endpoint`, 401)
  } else {
    await next()
  }
}

const jwtVerify = koaJwt({
  secret: Environment.SECRET,
})

// bypass JWT auth for local development
const jwtVerifyDev = async (ctx: Context, next: Next) => {
  ctx.state = {
    ...ctx.state,
    user: { apiToken: Environment.TOKEN },
  }
  return await next()
}

export const genToken = user => jsonwebtoken.sign(user, Environment.SECRET)

const shouldBypassAuthentication = (
  Environment.DEVELOPMENT_MODE ||
  Environment.TEST_MODE
)

export const jwt = shouldBypassAuthentication ? jwtVerifyDev : jwtVerify

