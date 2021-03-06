import Environment from '../lib/Environment'

const API_URL = Environment.API_URL || `https://uclapi.com`
const TIMETABLE_BASE_URL = `${API_URL}/timetable`
const WORKSPACES_BASE_URL = `${API_URL}/workspaces`
const ROOMBOOKINGS_BASE_URL = `${API_URL}/roombookings`

export default {
  API_URL,
  USER_TOKEN_URL: `${API_URL}/oauth/token`,
  USER_DATA_URL: `${API_URL}/oauth/user/data`,
  PERSONAL_TIMETABLE_URL: `${TIMETABLE_BASE_URL}/personal`,
  MODULE_TIMETABLE_URL: `${TIMETABLE_BASE_URL}/bymodule`,
  PEOPLE_SEARCH_URL: `${API_URL}/search/people`,
  ROOMS_SEARCH_URL: `${ROOMBOOKINGS_BASE_URL}/rooms`,
  ROOMS_EQUIPMENT_URL: `${ROOMBOOKINGS_BASE_URL}/equipment`,
  WORKSPACE_IMAGE_URL: `${WORKSPACES_BASE_URL}/images/map`,
  WORKSPACE_SURVEYS_URL: `${WORKSPACES_BASE_URL}/surveys`,
  WORKSPACE_SENSORS_URL: `${WORKSPACES_BASE_URL}/sensors`,
  WORKSPACE_SUMMARY_URL: `${WORKSPACES_BASE_URL}/sensors/summary`,
  WORKSPACE_HISTORIC_URL: `${WORKSPACES_BASE_URL}/sensors/averages/time`,
  ROOMBOOKINGS_DATA_URL: `${ROOMBOOKINGS_BASE_URL}/bookings`,
  ROOMBOOKINGS_FREEROOMS_URL: `${ROOMBOOKINGS_BASE_URL}/freerooms`,
}
