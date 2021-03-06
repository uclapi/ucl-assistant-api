import axios from 'axios'
import moment from 'moment'
import ApiRoutes from '../constants/apiRoutes'
import Environment from '../lib/Environment'

const DEFAULT_ABSENT_COLOUR = `#00FF00`
const DEFAULT_OCCUPIED_COLOUR = `#880000`

const cleanWorkspaces = workspaces => workspaces.map(
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

const getWorkspaces = async (surveyFilter = `student`) => {
  const { data: { surveys } } = (await axios.get(
    ApiRoutes.WORKSPACE_SURVEYS_URL,
    {
      params: {
        token: Environment.TOKEN,
        client_secret: Environment.CLIENT_SECRET,
        survey_filter: surveyFilter,
      },
    },
  ))
  return cleanWorkspaces(surveys)
}

const getImage = async (imageId: string): Promise<Buffer> => {
  const { data } = await axios.get(
    ApiRoutes.WORKSPACE_IMAGE_URL,
    {
      params: {
        token: Environment.TOKEN,
        client_secret: Environment.CLIENT_SECRET,
        image_id: imageId,
        image_formate: `raw`,
      },
    },
  )
  return data
}

const getLiveImage = async ({
  surveyId,
  mapId,
  circleRadius = 128,
  absentColour = DEFAULT_ABSENT_COLOUR,
  occupiedColour = DEFAULT_OCCUPIED_COLOUR,
}: {
  surveyId: string,
  mapId: string,
  circleRadius: number,
  absentColour: string,
  occupiedColour: string,
}): Promise<Buffer> => {
  const { data } = await axios.get(`${ApiRoutes.WORKSPACE_IMAGE_URL}/live`, {
    params: {
      token: Environment.TOKEN,
      client_secret: Environment.CLIENT_SECRET,
      survey_id: surveyId,
      map_id: mapId,
      circle_radius: circleRadius,
      absent_colour: absentColour,
      occupied_colour: occupiedColour,
    },
  })
  return data
}

/**
 * Takes a list of maps, returns a an object with number of occupied seats
 * and a number of total seats.
 *
 * @param {any} maps
 */
const reduceSeatInfo = maps =>
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

const getSeatingInfo = async (surveyId: string) => {
  const { data } = (await axios.get(
    ApiRoutes.WORKSPACE_SUMMARY_URL,
    {
      params: {
        token: Environment.TOKEN,
        client_secret: Environment.CLIENT_SECRET,
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

const reduceAverageData = averages => {
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

const getHistoricSeatInfo = async (surveyId: string) => {
  const { data: { surveys } } = (await axios.get(
    ApiRoutes.WORKSPACE_HISTORIC_URL,
    {
      params: {
        token: Environment.TOKEN,
        client_secret: Environment.CLIENT_SECRET,
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

const getAllSeatInfo = async () => {
  const { data: { surveys }, headers } = (await axios.get(
    ApiRoutes.WORKSPACE_SUMMARY_URL,
    {
      params: {
        token: Environment.TOKEN,
        client_secret: Environment.CLIENT_SECRET,
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
