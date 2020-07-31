import axios from 'axios'
import ApiRoutes from '../constants/apiRoutes'

export const getToken = async (code: string) => (await axios.get(
  ApiRoutes.USER_TOKEN_URL, {
  params: {
    client_id: process.env.UCLAPI_CLIENT_ID,
    client_secret: process.env.UCLAPI_CLIENT_SECRET,
    code,
  },
})).data

export const getUserData = async (token: string) => (await axios.get(
  ApiRoutes.USER_DATA_URL, {
  params: {
    client_secret: process.env.UCLAPI_CLIENT_SECRET,
    token,
  },
})).data

export default {
  getToken,
  getUserData,
}
