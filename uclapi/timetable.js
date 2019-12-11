const moment = require(`moment`)
const {
  MODULE_TIMETABLE_URL,
  PERSONAL_TIMETABLE_URL,
} = require(`../constants/apiRoutes`)
const axios = require(`axios`)

const getPersonalWeekTimetable = async (token, date = null) => {
  if (!date) {
    throw new Error(`Must specify date to retrieve weekly timetable`)
  }
  const momentDate = moment(date)
  if (momentDate.day() !== 1) {
    throw new Error(`Date must be a Monday`)
  }

  const params = {
    client_secret: process.env.UCLAPI_CLIENT_SECRET,
    token,
  }

  const weekdays = [...new Array(5)].map(
    (v, index) => momentDate.clone().add(index, `days`).format(`YYYY-MM-DD`),
  )
  return {
    lastModified: (new Date()).toUTCString(),
    data: {
      timetable: (await Promise.all(
        weekdays.map(
          date => axios.get(
            PERSONAL_TIMETABLE_URL,
            {
              params: {
                ...params,
                'date_filter': date,
              },
            },
          ),
        ),
      ))
        .map(({ data: { timetable } }) => timetable)
        .reduce((prev, cur) => {
          const [key, value] = Object.entries(cur)[0]
          return {
            ...prev,
            [key]: value,
          }
        }, {}),
    },
  }
}

const getPersonalTimetable = async (token, date = null) => {
  const params = {
    client_secret: process.env.UCLAPI_CLIENT_SECRET,
    token,
  }

  if (date) {
    params[`date_filter`] = moment(date).format(`YYYY-MM-DD`)
  }
  const { data, headers } = await axios.get(PERSONAL_TIMETABLE_URL, { params })
  return {
    // lastModified should be headers[`last-modified`]
    // but the main API is returning the wrong value
    // TODO: change this back when caching is fixed
    lastModified: (new Date()).toUTCString(),
    data,
  }

}

const getModuleTimetable = async (token, timetableModule) => {
  const { data, headers } = await axios.get(MODULE_TIMETABLE_URL, {
    params: {
      client_secret: process.env.UCLAPI_CLIENT_SECRET,
      token,
      modules: timetableModule,
    },
  })
  return {
    lastModified: headers[`last-modified`],
    data,
  }
}

module.exports = {
  getModuleTimetable,
  getPersonalTimetable,
  getPersonalWeekTimetable,
}
