import { Context } from 'koa'
import moment from 'moment'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'

const authorise = async (ctx: Context): Promise<void> => {
  ctx.session = {
    state: moment().valueOf(),
    redirectURL: decodeURIComponent(
      ctx.query.return as string,
    ) || `UCLAssistant://+auth`,
  }
  const url = `${ApiRoutes.API_URL}/oauth/authorise?client_id=${
    Environment.CLIENT_ID
    }&state=${ctx.session.state}`
  ctx.redirect(url)
}

export default authorise