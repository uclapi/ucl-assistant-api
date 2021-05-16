import axios from 'axios'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'
import ErrorManager from '../lib/ErrorManager'

export const peopleSearch = async (query: string) => {
  if (!query || query.length <= 3) {
    throw new Error(`Must provide a query!`)
  }

  try {
    const { data } = await axios.get(ApiRoutes.PEOPLE_SEARCH_URL, {
      params: {
        token: Environment.TOKEN,
        client_secret: Environment.CLIENT_SECRET,
        query,
      },
    })

    return data
  } catch (error) {
    ErrorManager.captureError(error)
    return {
      ok: false,
      error,
      people: [],
    }
  }
  
}
