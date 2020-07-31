import axios from 'axios'
import ApiRoutes from '../constants/apiRoutes'

export const peopleSearch = async (query: string) => {
  if (!query || query.length <= 3) {
    throw new Error(`Must provide a query!`)
  }

  return (await axios.get(ApiRoutes.PEOPLE_SEARCH_URL, {
    params: {
      token: process.env.UCLAPI_TOKEN,
      query,
    },
  })).data
}
