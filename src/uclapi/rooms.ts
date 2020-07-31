import axios from 'axios'
import ApiRoutes from '../constants/apiRoutes'

const { UCLAPI_TOKEN } = process.env

export const roomsSearch = async (query: string) => {
  if (!query || query.length <= 3) {
    throw new Error(`Must provide a query!`)
  }

  return (await axios.get(ApiRoutes.ROOMS_SEARCH_URL, {
    params: {
      token: UCLAPI_TOKEN,
      roomname: query,
    },
  })).data
}

export const getSites = async () => {
  const { data: { rooms } } = (await axios.get(ApiRoutes.ROOMS_SEARCH_URL, {
    params: {
      token: UCLAPI_TOKEN,
    },
  }))
  const sites = Array.from(new Set(rooms.map(({ siteid }) => siteid)))
    .map(siteid => {
      return {
        siteid,
        sitename: rooms.find(r => r.siteid === siteid).sitename,
      }
    })
  return { sites }
}

export const getEquipment = async (roomid, siteid) => {
  if (!roomid || !siteid) {
    throw new Error(`Must specify roomid and siteid`)
  }

  return (await axios.get(ApiRoutes.ROOMS_EQUIPMENT_URL, {
    params: {
      token: UCLAPI_TOKEN,
      roomid,
      siteid,
    },
  })).data
}
