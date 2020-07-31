import Router from 'koa-router'
import authorise from './authorise'
import callback from './callback'

export default (app: Router): void => {
  const router = new Router({
    prefix: `/connect/uclapi`,
  })
  router.get(`/`, authorise)
  router.get(`/callback`, callback)

  app.use(router.routes())
  app.use(router.allowedMethods())
}
