import axios from 'axios'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'

export const roomsSearch = async (query: string) => {
  if (!query || query.length <= 3) {
    throw new Error(`Must provide a query!`)
  }

  const { data } = await axios.get(ApiRoutes.ROOMS_SEARCH_URL, {
    params: {
      token: Environment.TOKEN,
      roomname: query,
    },
  })

  return data
}

export const getAllRooms = async () => {
  const { data: { rooms } } = (await axios.get(ApiRoutes.ROOMS_SEARCH_URL, {
    params: {
      token: Environment.TOKEN,
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

  const { data } = await axios.get(ApiRoutes.ROOMS_EQUIPMENT_URL, {
    params: {
      token: Environment.TOKEN,
      roomid,
      siteid,
    },
  })

  return data
}
