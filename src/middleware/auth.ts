import jsonwebtoken from 'jsonwebtoken'
import koaJwt from 'koa-jwt'

export const authenticate = async (ctx, next) => {
  if (ctx.session.isNew) {
    ctx.throw(`You need to be authenticated to access this endpoint`, 401)
  } else {
    await next()
  }
}

const jwtVerify = koaJwt({
  secret: process.env.SECRET,
})

// bypass JWT auth for local development
const jwtVerifyDev = async (ctx, next) => {
  ctx.state = {
    ...ctx.state,
    user: { apiToken: process.env.UCLAPI_TOKEN },
  }
  return await next()
}

export const genToken = user => jsonwebtoken.sign(user, process.env.SECRET)

const shouldBypassAuthentication = (
  process.env.NODE_ENV === `development` ||
  process.env.TEST_MODE === `true`
)

export const jwt = shouldBypassAuthentication ? jwtVerifyDev : jwtVerify

