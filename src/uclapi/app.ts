import Koa from 'koa'
import Router from 'koa-router'
import { jwt } from '../middleware/auth'
import redis from '../redis'
import { peopleSearch } from './people'
import { getFreeRooms, getRoomBookings } from './roombookings'
import { getEquipment, getSites, roomsSearch } from './rooms'
import {
  getModuleTimetable,
  getPersonalTimetable,
  getPersonalWeekTimetable,
} from './timetable'
import { getUserData } from './user'
import Workspaces from './workspaces'

const app = new Koa()
const router = new Router()

router.get(`/user`, jwt, async ctx => {
  ctx.body = await getUserData(ctx.state.user.apiToken)
})

router.get(`/timetable`, jwt, async ctx => {
  const date = ctx.query.date || null

  const timetableData = await redis.loadOrFetch(
    ctx,
    `${redis.keys.TIMETABLE_PERSONAL_PATH}/${ctx.state.user.upi}/${date}`,
    async () => getPersonalTimetable(ctx.state.user.apiToken, date),
    redis.ttl.TIMETABLE_TTL,
  )

  const { lastModified, data } = timetableData
  ctx.body = data
  ctx.set(`Last-Modified`, lastModified)
})

router.get(`/timetable/week`, jwt, async ctx => {
  const date = ctx.query.date || null

  const timetableData = await redis.loadOrFetch(
    ctx,
    `${redis.keys.TIMETABLE_PERSONAL_PATH}/${ctx.state.user.upi}/week/${date}`,
    async () => getPersonalWeekTimetable(ctx.state.user.apiToken, date),
    redis.ttl.TIMETABLE_TTL,
  )

  const { lastModified, data } = timetableData
  ctx.body = data
  ctx.set(`Last-Modified`, lastModified)
})

router.get(`/timetable/:module`, jwt, async ctx => {
  ctx.assert(ctx.params.module, 400)
  const { module: timetableModule } = ctx.params
  const date = ctx.query.date || null

  const timetableData = await redis.loadOrFetch(
    ctx,
    `${redis.keys.TIMETABLE_MODULE_PATH}/${timetableModule}/${date}`,
    async () => getModuleTimetable(
      ctx.state.user.apiToken,
      timetableModule,
    ),
    redis.ttl.TIMETABLE_TTL,
  )

  const { lastModified, data } = timetableData
  ctx.body = data
  ctx.set(`Last-Modified`, lastModified)
})

router.get(`/search/people`, jwt, async ctx => {
  ctx.assert(
    (ctx.query.query || ``).length >= 3,
    400,
    `Query must be at least three characters long`,
  )
  const data = await redis.loadOrFetch(
    ctx,
    `${redis.keys.PEOPLE_SEARCH_PATH}/${ctx.query.query}`,
    async () => peopleSearch(ctx.query.query),
    redis.ttl.PEOPLE_SEARCH_TTL,
  )
  ctx.body = data
})

router.get(`/search/rooms`, jwt, async ctx => {
  ctx.assert(
    (ctx.query.query || ``).length >= 3,
    400,
    `Query must be at least four characters long`,
  )
  const data = await redis.loadOrFetch(
    ctx,
    `${redis.keys.ROOMS_SEARCH_PATH}/${ctx.query.query}`,
    async () => roomsSearch(ctx.query.query),
    redis.ttl.ROOMS_SEARCH_TTL,
  )
  ctx.body = data
})

router.get(`/sites`, jwt, async ctx => {
  const rooms = await redis.loadOrFetch(
    ctx,
    redis.keys.SITES_SEARCH_PATH,
    async () => getSites(),
    redis.ttl.ROOMS_SEARCH_TTL,
  )
  ctx.body = rooms
})

router.get(`/equipment`, jwt, async ctx => {
  ctx.assert(ctx.query.roomid, 400, `Must specify roomid`)
  ctx.assert(ctx.query.siteid, 400, `Must specify siteid`)
  const data = await redis.loadOrFetch(
    ctx,
    `${
      redis.keys.WORKSPACE_EQUIPMENT_PATH
    }/${ctx.query.roomid}/${ctx.query.siteid}`,
    async () => getEquipment(ctx.query.roomid, ctx.query.siteid),
    redis.ttl.WORKSPACE_EQUIPMENT_TTL,
  )
  ctx.body = data
})

router.get(`/workspaces/getimage/:id.png`, jwt, async ctx => {
  ctx.assert(ctx.params.id, 400, `Must specify id`)
  ctx.set({ "Content-Type": `image/png` })
  ctx.state.jsonify = false
  const res = await Workspaces.getImage(ctx.params.id)
  ctx.body = res
})

router.get(`/workspaces/getliveimage/map.svg`, jwt, async ctx => {
  ctx.assert(ctx.query.survey_id)
  ctx.assert(ctx.query.map_id)
  ctx.set({ "Content-Type": `image/svg+xml` })
  ctx.state.jsonify = false
  const res = await Workspaces.getLiveImage({
    surveyId: ctx.query.survey_id,
    mapId: ctx.query.map_id,
    circleRadius: ctx.query.circle_radius,
    absentColour: ctx.query.absent_colour,
    occupiedColour: ctx.query.occupied_colour,
  })
  ctx.body = res
})

router.get(`/workspaces/summary`, jwt, async ctx => {
  const { data, lastModified } = await redis.loadOrFetch(
    ctx,
    redis.keys.WORKSPACE_SUMMARY_PATH,
    async () => Workspaces.getAllSeatInfo(),
    redis.ttl.WORKSPACE_SUMMARY_TTL,
  )
  ctx.body = data
  ctx.set(`Last-Modified`, lastModified)
})

router.get(`/workspaces/historic`, jwt, async ctx => {
  ctx.assert(ctx.query.id, 400, `Need to include a survey id.`)
  const data = await redis.loadOrFetch(
    ctx,
    `${redis.keys.WORKSPACE_HISTORIC_DATA_PATH}/${ctx.query.id}`,
    async () => Workspaces.getHistoricSeatInfo(ctx.query.id),
    redis.ttl.WORKSPACE_HISTORIC_DATA_TTL,
  )
  ctx.body = data
})

router.get(`/workspaces/:id/seatinfo`, jwt, async ctx => {
  ctx.assert(ctx.params.id, 400)
  ctx.body = await Workspaces.getSeatingInfo(ctx.params.id)
})

router.get(`/workspaces`, jwt, async ctx => {
  const surveyFilter = ctx.query.survey_filter
    ? ctx.query.survey_filter
    : `student`
  ctx.body = await redis.loadOrFetch(
    ctx,
    `${redis.keys.WORKSPACE_SURVEYS_PATH}/${surveyFilter}`,
    async () => Workspaces.getWorkspaces(surveyFilter),
    redis.ttl.WORKSPACE_SURVEYS_TTL,
  )
})

router.get(`/roombookings`, jwt, async ctx => {
  ctx.assert(ctx.query.roomid, 400, `Please include a roomid`)
  ctx.assert(ctx.query.siteid, 400, `Please include a siteid`)
  ctx.assert(ctx.query.date, 400, `Please include a date`)
  ctx.body = await getRoomBookings({
    roomid: ctx.query.roomid,
    siteid: ctx.query.siteid,
    date: ctx.query.date,
  })
})

router.get(`/freerooms`, jwt, async ctx => {
  const {
    start_datetime: startDateTime,
    end_datetime: endDateTime,
  } = ctx.query
  ctx.body = await getFreeRooms(startDateTime, endDateTime)
})

app.use(router.routes())
app.use(router.allowedMethods())

export default app
