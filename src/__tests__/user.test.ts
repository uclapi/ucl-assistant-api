import axios from 'axios'
import Environment from '../lib/Environment'
import { getToken, getUserData } from '../uclapi/user'

jest.mock(`axios`)
const axiosGet = axios.get as jest.Mock

const SAMPLE_TOKEN = `tokeytoken`
const SAMPLE_SECRET = `shibboleth`
const SAMPLE_TOKEN_DATA = {
  data: {
    scope: `[]`,
    state: 1,
    ok: true,
    client_id: `123456`,
    token: `tokentokentoken`,
  },
}
const SAMPLE_USER_DATA = {
  data: {
    department: `Department of Computer Science`,
    email: `harry.q.bovik@ucl.ac.uk`,
    ok: true,
    full_name: `Harry Q Bovik`,
    cn: `xxxxxx`,
    given_name: `Harry`,
    upi: `hbovik00`,
    scope_number: 0,
    is_student: false,
  },
}

describe(`user`, () => {

  beforeAll(() => {
    Environment.TOKEN = SAMPLE_TOKEN
    Environment.CLIENT_SECRET = SAMPLE_SECRET
  })

  beforeEach(() => {
    axiosGet.mockClear()
  })

  it(`should send a valid getToken request`, () => {
    axiosGet.mockImplementation(() => Promise.resolve(SAMPLE_TOKEN_DATA))
    getToken(`super-secret-code`)
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })

  it(`should send a valid getUserData request`, () => {
    axiosGet.mockImplementation(() => Promise.resolve(SAMPLE_USER_DATA))
    getUserData(`tokentokentoken`)
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })
})
