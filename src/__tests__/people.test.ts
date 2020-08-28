import axios from 'axios'
import Environment from '../lib/Environment'
import { peopleSearch } from '../uclapi/people'

jest.mock(`axios`)

const SAMPLE_TOKEN = `tokeytoken`
const SAMPLE_SECRET = `shibboleth`

describe(`people`, () => {

  beforeAll(() => {
    Environment.TOKEN = SAMPLE_TOKEN
    Environment.CLIENT_SECRET = SAMPLE_SECRET
  })

  it(`should send a valid search request`, () => {
    const query = `William McGonagall`

    peopleSearch(query)
    expect((axios.get as jest.Mock).mock.calls).toMatchSnapshot()
  })
})
