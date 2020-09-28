import axios from 'axios'
import moment from 'moment'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'
import ErrorManager from '../lib/ErrorManager'

const timeToInt = (time) => Number.parseInt(time.replace(`:`, ``))
const sortEvents = (dayEvents) => dayEvents.sort(
  (a, b) => timeToInt(a.start_time) - timeToInt(b.start_time),
)

export const getPersonalWeekTimetable = async (token: string, date = null) => {
  if (!date) {
    throw new Error(`Must specify date to retrieve weekly timetable`)
  }
  const momentDate = moment(date)
  if (momentDate.day() !== 1) {
    throw new Error(`Date must be a Monday`)
  }

  const params = {
    client_secret: Environment.CLIENT_SECRET,
    token,
  }

  const weekdays = [...new Array(5)].map(
    (_, index) => momentDate.clone().add(index, `days`).format(`YYYY-MM-DD`),
  )

  const reqs = weekdays.map(
    date => axios.get(
      ApiRoutes.PERSONAL_TIMETABLE_URL,
      {
        params: {
          ...params,
          'date': date,
        },
      },
    ),
  )

  return {
    lastModified: (new Date()).toUTCString(),
    data: {
      timetable: (await Promise.all(reqs))
        .map(({ data: { timetable } }) => timetable)
        .reduce((prev, cur) => {
          const [day, events] = Object.entries(cur)[0]
          return {
            ...prev,
            [day]: sortEvents(events),
          }
        }, {}),
    },
  }
}

export const getPersonalTimetable = async (token, date = null) => {
  const params = {
    client_secret: Environment.CLIENT_SECRET,
    token,
  }

  if (date) {
    params[`date`] = moment(date).format(`YYYY-MM-DD`)
  }
  try {
    const { data } = await axios.get(
      ApiRoutes.PERSONAL_TIMETABLE_URL,
      { params },
    )

    return {
      // lastModified should be headers[`last-modified`]
      // but the main API is returning the wrong value
      // TODO: change this back when caching is fixed
      lastModified: (new Date()).toUTCString(),
      data: {
        ...data,
        timetable: {
          [Object.keys(data.timetable)[0]]: sortEvents(
            Object.values(data.timetable)[0],
          ),
        },
      },
    }
  } catch (error) {
    ErrorManager.captureError(error)
    throw error
  }

}

export const getModuleTimetable = async (token, timetableModule) => {
  const { data, headers } = await axios.get(ApiRoutes.MODULE_TIMETABLE_URL, {
    params: {
      client_secret: Environment.CLIENT_SECRET,
      token,
      modules: timetableModule,
    },
  })
  return {
    lastModified: headers[`last-modified`],
    data,
  }
}

export default {
  getModuleTimetable,
  getPersonalTimetable,
  getPersonalWeekTimetable,
}