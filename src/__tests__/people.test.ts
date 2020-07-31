import axios from 'axios'
import { peopleSearch } from '../uclapi/people'

jest.mock(`axios`)

const SAMPLE_TOKEN = `tokeytoken`

describe(`people`, () => {

  beforeAll(() => {
    process.env.UCLAPI_TOKEN = SAMPLE_TOKEN
  })

  it(`should send a valid search request`, () => {
    const query = `William McGonagall`

    peopleSearch(query)
    expect((axios.get as jest.Mock).mock.calls).toMatchSnapshot()
  })
})
