import Koa from 'koa'
import Router from 'koa-router'
import Environment from '../lib/Environment'
import { jwt } from '../middleware/auth'
import api from './api'

const app = new Koa()

app.use(async (ctx, next) => {
  if (!Environment.NOTIFICATIONS_URL) {
    ctx.throw(500, `Notifications are not supported`)
  }
  await next()
})

const router = new Router()

interface RegisterRequestBody {
  token: string,
}

router.post(`/register`, jwt, async ctx => {
  const { token } = ctx.request.body as unknown as RegisterRequestBody
  ctx.assert(token, 400, `No token provided.`)
  try {
    console.log(
      `attempting to register notifications for ${ctx.state.user.upi}`,
    )
    await api.register(ctx.state.user.upi, token)
    // await api.sendNotification(ctx.state.user.upi, {
    //   title: `Test Notification`,
    //   content: `Congratulations! Notifications are successfully working.`,
    // })
  } catch (err) {
    ctx.throw(400, err.message)
  }
  ctx.body = `success`
})

app.use(router.routes())
app.use(router.allowedMethods())

export default app