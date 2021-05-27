import axios from 'axios'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'

export const getToken = async (code: string) => {
  const { data } = await axios.get(
    ApiRoutes.USER_TOKEN_URL, {
    params: {
      client_id: Environment.CLIENT_ID,
      client_secret: Environment.CLIENT_SECRET,
      code,
    },
  })
  return data
}

export const getUserData = async (token: string) => {
  const { data } = await axios.get(
    ApiRoutes.USER_DATA_URL, {
    params: {
      client_secret: Environment.CLIENT_SECRET,
      token,
    },
  })
  return data
}

export default {
  getToken,
  getUserData,
}
