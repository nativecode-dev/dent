import { Env } from '../mod.ts'

import { assertEquals } from '../test_deps.ts'

const ENV = {
  APP_TEST: 'value',
}

Deno.test('should create env object', () => {
  const env = new Env({ env: ENV, prefix: ['app'] })
  assertEquals(env.toObject().app.test, 'value')
})
