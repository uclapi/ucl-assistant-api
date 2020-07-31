import keys from './keys'
import Redis from './redis'
import ttl from './ttl'

export default {
  ...Redis,
  keys,
  ttl,
}
