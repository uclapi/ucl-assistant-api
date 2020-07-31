import { Context } from 'koa'
import moment from 'moment'
import ApiRoutes from '../constants/apiRoutes'

const authorise = async (ctx: Context): Promise<void> => {
  ctx.session = {
    state: moment().valueOf(),
    redirectURL: decodeURIComponent(ctx.query.return) || `UCLAssistant://+auth`,
  }
  const url = `${ApiRoutes.API_URL}/oauth/authorise?client_id=${
    process.env.UCLAPI_CLIENT_ID
    }&state=${ctx.session.state}`
  ctx.redirect(url)
}

export default authorise