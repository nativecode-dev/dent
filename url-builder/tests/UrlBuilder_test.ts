import { assertEquals } from '../test_deps.ts'

import { UrlBuilder } from '../lib/UrlBuilder.ts'

Deno.test('should parse complete url', () => {
  const builder = UrlBuilder.parse('http://localhost:80/test?name=value')
  assertEquals(builder.build(), 'http://localhost:80/test?name=value')
})
