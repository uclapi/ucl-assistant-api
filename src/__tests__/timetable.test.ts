import axios from 'axios'
import { getPersonalWeekTimetable } from '../uclapi/timetable'

const SAMPLE_TOKEN = `eySFsfef`
const SAMPLE_DATE = `2020-01-13`
const WRONG_DATE = `2020-01-14`
const SAMPLE_CLIENT_SECRET = `owjefjewfje`

jest.mock(`axios`)

describe(`timetable`, () => {
  beforeAll(() => {
    process.env.UCLAPI_CLIENT_SECRET = SAMPLE_CLIENT_SECRET
  })
  it(`should send a valid timetable request`, async () => {
    (<jest.Mock>axios.get).mockResolvedValue({
      data: { timetable: { day: `event` } },
    })
    expect.assertions(2)

    await getPersonalWeekTimetable(
      SAMPLE_TOKEN,
      SAMPLE_DATE,
    )
    expect(axios.get).toHaveBeenCalledTimes(5)
    expect((<jest.Mock>axios.get).mock.calls).toMatchSnapshot()
  })
  it(`should throw error if date is invalid`, async () => {
    await expect(() => getPersonalWeekTimetable(
      SAMPLE_TOKEN,
      null,
    )).rejects.toThrow()

    await expect(() => getPersonalWeekTimetable(
      SAMPLE_TOKEN,
      WRONG_DATE,
    )).rejects.toThrow()
  })
})
