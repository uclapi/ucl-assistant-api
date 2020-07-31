import axios from 'axios'
import moment from 'moment'
import fetch from 'node-fetch'
import ApiRoutes from '../constants/apiRoutes'

const DEFAULT_ABSENT_COLOUR = `#00FF00`
const DEFAULT_OCCUPIED_COLOUR = `#880000`

export const cleanWorkspaces = workspaces => workspaces.map(
  ({ name, ...attributes }) => ({
    ...attributes,
    name: name.replace(/"/g, ``),
  })).filter(({ name }) => {
    const lowercaseName = name.toLowerCase()
    return (
      lowercaseName.indexOf(`dev testing`) === -1
      || lowercaseName.indexOf(`new layout`) === -1
    )
  })

export const getWorkspaces = async (surveyFilter = `student`) => {
  const { data: { surveys } } = (await axios.get(
    ApiRoutes.WORKSPACE_SURVEYS_URL,
    {
      params: {
        token: process.env.UCLAPI_TOKEN,
        survey_filter: surveyFilter,
      },
    },
  ))
  return cleanWorkspaces(surveys)
}

export const getImage = imageId =>
  fetch(
    `${ApiRoutes.WORKSPACE_IMAGE_URL}?token=${
    process.env.UCLAPI_TOKEN
    }&image_id=${imageId}&image_format=raw`,
  )

const getLiveImage = ({
  surveyId,
  mapId,
  circleRadius = 128,
  absentColour = DEFAULT_ABSENT_COLOUR,
  occupiedColour = DEFAULT_OCCUPIED_COLOUR,
}) =>
  fetch(
    `${ApiRoutes.WORKSPACE_IMAGE_URL}/live?token=${
    process.env.UCLAPI_TOKEN
    }&survey_id=${
    surveyId
    }&map_id=${
    mapId
    }&circle_radius=${
    circleRadius
    }&absent_colour=${
    encodeURIComponent(absentColour)
    }&occupied_colour=${
    encodeURIComponent(occupiedColour)
    }`,
  )

/**
 * Takes a list of maps, returns a an object with number of occupied seats
 * and a number of total seats.
 *
 * @param {any} maps
 */
export const reduceSeatInfo = maps =>
  maps.reduce(
    (obj, map) => {
      const mapCapacity =
        map.sensors_absent + map.sensors_other + map.sensors_occupied
      return {
        occupied: obj.occupied + map.sensors_occupied,
        total: obj.total + mapCapacity,
      }
    },
    {
      occupied: 0,
      total: 0,
    },
  )

export const getSeatingInfo = async surveyId => {
  const { data } = (await axios.get(
    ApiRoutes.WORKSPACE_SUMMARY_URL,
    {
      params: {
        token: process.env.UCLAPI_TOKEN,
        survey_ids: surveyId,
      },
    },
  ))
  const { surveys } = data
  if (surveys.length !== 1) {
    throw new Error(`Survey with that id not found.`)
  }
  return reduceSeatInfo(surveys[0].maps)
}

export const reduceAverageData = averages => {
  const returnArray = Array.from(Array(24)).map(() => 0)
  const hours = Object.keys(averages).map(time => ({
    time,
    hour: moment(time, `HH:mm:ss`).hours(),
    occupied: averages[time].sensors_occupied,
  }))
  return returnArray.map((_, i) => {
    const avrObj = hours.reduce(
      (acc, obj) =>
        obj.hour === i
          ? {
            total: acc.total + obj.occupied,
            count: acc.count + 1,
          }
          : acc,
      {
        total: 0,
        count: 0,
      },
    )
    return avrObj.total / avrObj.count
  })
}

export const getHistoricSeatInfo = async surveyId => {
  const { data: { surveys } } = (await axios.get(
    ApiRoutes.WORKSPACE_HISTORIC_URL,
    {
      params: {
        token: process.env.UCLAPI_TOKEN,
        survey_ids: surveyId,
        days: 30,
      },
    },
  ))
  if (surveys.length !== 1) {
    throw new Error(`Survey with that id not found`)
  }
  const { averages } = surveys[0]
  if (Object.keys(averages).length === 0) {
    throw new Error(`No historical data available`)
  }
  return reduceAverageData(averages)
}

export const getAllSeatInfo = async () => {
  const { data: { surveys }, headers } = (await axios.get(
    ApiRoutes.WORKSPACE_SUMMARY_URL,
    {
      params: {
        token: process.env.UCLAPI_TOKEN,
      },
    },
  ))
  return {
    data: cleanWorkspaces(
      surveys
        .map(survey => ({
          ...reduceSeatInfo(survey.maps),
          name: survey.name,
          id: survey.id,
          maps: survey.maps.map(map => ({
            id: map.id,
            name: map.name,
            occupied: map.sensors_occupied,
            total: (
              map.sensors_absent
              + map.sensors_other
              + map.sensors_occupied
            ),
          })),
        }))
        .filter(
          workspace => !(
            workspace.occupied === 0
            && workspace.total === 0
          ),
        ),
    ),
    lastModified: headers[`last-modified`],
  }
}

export default {
  reduceAverageData,
  getWorkspaces,
  getImage,
  getLiveImage,
  getSeatingInfo,
  getAllSeatInfo,
  getHistoricSeatInfo,
}
