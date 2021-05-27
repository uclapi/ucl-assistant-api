import axios from 'axios'
import Environment from '../lib/Environment'
import { roomsSearch, getAllRooms, getEquipment } from '../uclapi/rooms'

jest.mock(`axios`)
const axiosGet = axios.get as jest.Mock

const SAMPLE_TOKEN = `tokeytoken`
const SAMPLE_SECRET = `shibboleth`
const SAMPLE_ROOMS_DATA = {
  data: {
    ok: true,
    rooms: [],
  },
}

describe(`rooms`, () => {

  beforeAll(() => {
    Environment.TOKEN = SAMPLE_TOKEN
    Environment.CLIENT_SECRET = SAMPLE_SECRET
  })

  beforeEach(() => {
    axiosGet.mockClear()
  })

  it(`should send a valid room search request`, () => {
    const query = `Bentham House`
    axiosGet.mockImplementation(() => Promise.resolve(SAMPLE_ROOMS_DATA))
    roomsSearch(query)
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })

  it(`should send a valid getAllRooms request`, () => {
   axiosGet.mockImplementation(() => Promise.resolve(SAMPLE_ROOMS_DATA))
    getAllRooms()
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })

  it(`should send a valid equipment request`, () => {
    axiosGet.mockImplementation(() => Promise.resolve({
      data: {
        ok: true,
        equipment: [],
      },
    }))
    getEquipment(`123`, `456`)
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })
})
