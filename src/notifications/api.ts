import axios from 'axios'

const { NOTIFICATIONS_URL } = process.env

const register = async (upi: string, pushToken: string): Promise<void> => {
  console.log(`registering...`)
  try {
    await axios.post(`${NOTIFICATIONS_URL}/register`, {
      upi,
      pushToken,
    })
  } catch (error) {
    throw new Error(
      `API Registration for user ${upi} failed:\n${error.message}`,
    )
  }
  console.log(`success!`)
}

const sendNotification = async (
  upi: string,
  notification = {
    title: `UCL Assistant`,
    content: ``,
    type: `default`,
    path: `/`,
  },
): Promise<void> => {
  try {
    await axios.post(`${NOTIFICATIONS_URL}/upi/${upi}/`, {
      ...notification,
    })
  } catch (error) {
    throw new Error(`Failed to send notification for user ${upi}:
    notification:
    ${JSON.stringify(notification)}
    error: ${error.messsage}`)
  }
}

export default {
  register,
  sendNotification,
}
