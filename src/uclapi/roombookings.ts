import axios from 'axios'
import moment from 'moment'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'

const { UCLAPI_TOKEN } = process.env

export const getRoomBookings = async ({ roomid, siteid, date }) => {
  if (!roomid) {
    throw new Error(`Must provide a roomid!`)
  }
  if (!siteid) {
    throw new Error(`Must provide a siteid`)
  }

  const { data } = await axios.get(ApiRoutes.ROOMBOOKINGS_DATA_URL, {
    params: {
      token: Environment.TOKEN,
      roomid,
      siteid,
      date,
    },
  })
  return data
}

export const getFreeRooms = async (
  startDateTime = new Date().toISOString(),
  endDateTime = moment()
    .endOf(`day`)
    .toISOString(),
) => {

  const { data } =  await axios.get(ApiRoutes.ROOMBOOKINGS_FREEROOMS_URL, {
    params: {
      token: Environment.TOKEN,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
    },
  })
  return data
}

export default {
  getRoomBookings,
  getFreeRooms,
}