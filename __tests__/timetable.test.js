const axios = require(`axios`)

const {
  getPersonalWeekTimetable,
} = require(`../uclapi/timetable`)

const SAMPLE_TOKEN = `eySFsfef`
const SAMPLE_DATE = `2020-01-13`
const WRONG_DATE = `2020-01-14`
const SAMPLE_CLIENT_SECRET = `owjefjewfje`

jest.mock(`axios`)

describe(`timetable`, () => {
  beforeAll(() => {
    process.env.UCLAPI_CLIENT_SECRET = SAMPLE_CLIENT_SECRET
  })
  it(`should send a valid timetable request`, () => {
    getPersonalWeekTimetable(
      SAMPLE_TOKEN,
      SAMPLE_DATE,
    )
    expect(axios.get).toHaveBeenCalledTimes(5)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })
  it(`should throw error if date is invalid`, () => {
    try {
      getPersonalWeekTimetable(
        SAMPLE_TOKEN,
        null,
      )
    } catch (error) {
      expect(error).toMatchSnapshot()
    }

    try {
      getPersonalWeekTimetable(
        SAMPLE_TOKEN,
        WRONG_DATE,
      )
    } catch (error) {
      expect(error).toMatchSnapshot()
    }
  })
})
