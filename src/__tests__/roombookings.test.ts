import axios from 'axios'
import Environment from '../lib/Environment'
import { getRoomBookings, getFreeRooms } from '../uclapi/roombookings'

jest.mock(`axios`)
const axiosGet = axios.get as jest.Mock

const SAMPLE_TOKEN = `tokeytoken`
const SAMPLE_SECRET = `shibboleth`

describe(`roombookings`, () => {

  beforeAll(() => {
    Environment.TOKEN = SAMPLE_TOKEN
    Environment.CLIENT_SECRET = SAMPLE_SECRET
  })

   beforeEach(() => {
    axiosGet.mockClear()
  })

  it(`should send a valid room bookings search request`, () => {
    axiosGet.mockImplementation(() => Promise.resolve({
      data: {
        ok: true,
        bookings: [],
      },
    }))
    getRoomBookings({ roomid: `123`,
      siteid: `456`,
      date: `2021-05-27T04:55:01.694Z`,
    })
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })

  it(`should send a valid free rooms request`, () => {
    axiosGet.mockImplementation(() => Promise.resolve({
      data: {
        ok: true,
        free_rooms: [],
      },
    }))
    getFreeRooms(
      `2021-05-27T04:55:57.727Z`,
      `2021-05-27T04:56:50.191Z`,
    )
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })
})
