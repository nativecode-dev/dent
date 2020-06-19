import { ConnectorOptions, ObjectMerge } from '../deps.ts'
import { Env, assertEquals, assertNotEquals } from '../test_deps.ts'

import { Cache } from '../lib/Cache.ts'

const env = new Env({ env: Deno.env.toObject(), prefix: ['test'] })
const envobj = env.toObject()

const CONNECTION = ObjectMerge.merge<ConnectorOptions>(
  {
    endpoint: {
      host: 'localhost',
      port: 6379,
    },
    name: 'redis',
  },
  envobj.test.redis,
)

Deno.test('should create and retrieve value', async () => {
  const cache = new Cache(CONNECTION)
  await cache.open()
  await cache.set('test', true)
  const value = await cache.get<boolean>('test')
  cache.close()
  assertEquals(value, true)
})
