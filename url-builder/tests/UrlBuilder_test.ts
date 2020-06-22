import { assertEquals } from '../test_deps.ts'

import { UrlBuilder } from '../lib/UrlBuilder.ts'

Deno.test('should parse url', () => {
  const builder = UrlBuilder.parse('http://localhost')
  assertEquals(builder.build(), 'http://localhost')
})

Deno.test('should parse url with path', () => {
  const builder = UrlBuilder.parse('http://localhost/test/')
  assertEquals(builder.build(), 'http://localhost/test')
})

Deno.test('should parse url with query parameters', () => {
  const builder = UrlBuilder.parse('http://localhost/test?name=value')
  assertEquals(builder.build(), 'http://localhost/test?name=value')
})

Deno.test('should parse url with port', () => {
  const builder = UrlBuilder.parse('http://localhost:80/test?name=value')
  assertEquals(builder.build(), 'http://localhost:80/test?name=value')
})

Deno.test('should parse with authentication', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:80/test?name=value')
  assertEquals(builder.build(true), 'http://admin:test@localhost:80/test?name=value')
})

Deno.test('should parse with authentication, no output', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:80/test?name=value')
  assertEquals(builder.build(), 'http://localhost:80/test?name=value')
})

Deno.test('should parse with authentication without port, no output', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test?name=value')
  assertEquals(builder.build(), 'http://localhost/test?name=value')
})
