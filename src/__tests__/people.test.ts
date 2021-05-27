import axios from 'axios'
import Environment from '../lib/Environment'
import { peopleSearch } from '../uclapi/people'

jest.mock(`axios`)
const axiosGet = axios.get as jest.Mock
axiosGet.mockImplementation(() => Promise.resolve({
  data: {
    ok: true,
    people: [
      {
        "name": `Jane Doe`,
        "status": `Student`,
        "department": `Dept of Med Phys & Biomedical Eng`,
        "email": `jane.doe.17@ucl.ac.uk`,
      },
  ],
  },
}))

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
    expect(axiosGet.mock.calls).toMatchSnapshot()
  })
})
