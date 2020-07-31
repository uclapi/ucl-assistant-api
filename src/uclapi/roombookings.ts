import axios from 'axios'
import moment from 'moment'
import ApiRoutes from '../constants/apiRoutes'

const { UCLAPI_TOKEN } = process.env

export const getRoomBookings = async ({ roomid, siteid, date }) => {
  if (!roomid) {
    throw new Error(`Must provide a roomid!`)
  }
  if (!siteid) {
    throw new Error(`Must provide a siteid`)
  }

  return (await axios.get(ApiRoutes.ROOMBOOKINGS_DATA_URL, {
    params: {
      token: UCLAPI_TOKEN,
      roomid,
      siteid,
      date,
    },
  })).data
}

export const getFreeRooms = async (
  startDateTime = new Date().toISOString(),
  endDateTime = moment()
    .endOf(`day`)
    .toISOString(),
) => {

  return (await axios.get(ApiRoutes.ROOMBOOKINGS_FREEROOMS_URL, {
    params: {
      token: UCLAPI_TOKEN,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
    },
  })).data
}

export default {
  getRoomBookings,
  getFreeRooms,
}