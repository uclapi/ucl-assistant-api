const axios = require(`axios`)
const { PEOPLE_SEARCH_URL } = require(`../constants/apiRoutes`)

const { peopleSearch } = require(`../uclapi/people`)

jest.mock(`axios`)

const SAMPLE_TOKEN = `tokeytoken`

describe(`people`, () => {

  beforeAll(() => {
    process.env.token = SAMPLE_TOKEN
  })

  it(`should send a valid search request`, () => {
    const query = `William McGonagall`

    peopleSearch(query)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })
})
