import { Context } from 'koa'
import querystring from 'querystring'
import { genToken } from '../middleware/auth'
import { getToken, getUserData } from '../uclapi/user'

const callback = async (ctx: Context): Promise<void> => {
  if (!Object.keys(ctx.session).includes(`state`)) {
    ctx.throw(`You need to authorise first`, 401)
  }
  const { result, code, state } = ctx.query

  // make sure states match.
  if (`${state}` !== `${ctx.session.state}`) {
    ctx.throw(`States don't match`, 500)
  }

  // if user says "no"
  if (result === `denied`) {
    ctx.throw(`Request denied`, 400)
  }

  // trade auth code for a token
  let json = await getToken(code as string)

  // update session to include token.
  const apiToken = json.token

  console.log(`made it`)

  // fetch user data.
  json = await getUserData(apiToken)

  const user = {
    department: json.department,
    email: json.email,
    full_name: json.full_name,
    given_name: json.given_name,
    upi: json.upi,
    scopeNumber: json.scope_number,
    apiToken,
  }

  const jwt = genToken(user)

  const queryObj = {
    ...user,
    token: jwt,
  }
  const query = querystring.stringify(queryObj)
  ctx.redirect(`${ctx.session.redirectURL}?${query}`)
}

export default callback
