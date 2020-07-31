/**
 * cache data TTL, in seconds.
 */
const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export default {
  TIMETABLE_TTL: 12 * HOUR,
  WORKSPACE_SURVEYS_TTL: DAY,
  WORKSPACE_SUMMARY_TTL: MINUTE,
  WORKSPACE_HISTORIC_DATA_TTL: DAY,
  WORKSPACE_EQUIPMENT_TTL: DAY,
  PEOPLE_SEARCH_TTL: DAY,
  ROOMS_SEARCH_TTL: DAY,
}