import Koa from 'koa'
import Router from 'koa-router'
import indexRoutes from './constants/indexRoutes'
import { jwt } from './middleware/auth'
import oauth from './oauth'

const app = new Koa()
const router = new Router()

router.get(`/`, async ctx => {
  ctx.query.pretty = true
  ctx.body = indexRoutes
})

// import and use the OAuth router.
oauth(router)

router.get(`/testauth`, jwt, async ctx => {
  ctx.body = `Authenticated!`
})

router.get(`/ping`, async ctx => {
  ctx.body = `pong!`
  ctx.status = 200
})

router.get(`/echo`, async ctx => {
  ctx.response.body = ctx.request.body
  ctx.status = 200
})

// route not found.
router.get(/.*/, async ctx => {
  ctx.throw(404, `Not found`)
})

app.use(router.routes())
app.use(router.allowedMethods())

export default app