import { assertEquals } from '../test_deps.ts'

import { UrlBuilder } from '../lib/UrlBuilder.ts'

Deno.test('should parse url', () => {
  const builder = UrlBuilder.parse('http://localhost')
  assertEquals(builder.toUrl(), 'http://localhost/')
})

Deno.test('should parse url with trailing slash', () => {
  const builder = UrlBuilder.parse('http://localhost/')
  assertEquals(builder.toUrl(), 'http://localhost/')
})

Deno.test('should parse url with path and trailing slash', () => {
  const builder = UrlBuilder.parse('http://localhost/test/')
  assertEquals(builder.toUrl(), 'http://localhost/test')
})

Deno.test('should parse url with path', () => {
  const builder = UrlBuilder.parse('http://localhost/test')
  assertEquals(builder.toUrl(), 'http://localhost/test')
})

Deno.test('should parse url with query parameter', () => {
  const builder = UrlBuilder.parse('http://localhost/test?name=value')
  assertEquals(builder.toUrl(), 'http://localhost/test?name=value')
})

Deno.test('should parse url with query parameters', () => {
  const builder = UrlBuilder.parse('http://localhost/test?name=value&name2=value')
  assertEquals(builder.toUrl(), 'http://localhost/test?name=value&name2=value')
})

Deno.test('should parse url with port', () => {
  const builder = UrlBuilder.parse('http://localhost:80/test?name=value&name2=value')
  assertEquals(builder.toUrl(), 'http://localhost:80/test?name=value&name2=value')
})

Deno.test('should parse url with authentication', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:80/test?name=value&name2=value')
  assertEquals(builder.toUrl(true), 'http://admin:test@localhost:80/test?name=value&name2=value')
})

Deno.test('should parse url with authentication, no output', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:80/test?name=value&name2=value')
  assertEquals(builder.toUrl(), 'http://localhost:80/test?name=value&name2=value')
})

Deno.test('should parse url with authentication without port, no output', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test?name=value&name2=value')
  assertEquals(builder.toUrl(), 'http://localhost/test?name=value&name2=value')
})

Deno.test('should parse url with authentication, with trailing slash', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:80/test?name=value&name2=value')
  assertEquals(builder.toUrl(true, true), 'http://admin:test@localhost:80/test/?name=value&name2=value')
})

Deno.test('should parse ftp url with authentication, with trailing slash', () => {
  const builder = UrlBuilder.parse('ftp://admin:test@localhost:80/test?name=value&name2=value')
  assertEquals(builder.toUrl(true, true), 'ftp://admin:test@localhost:80/test/?name=value&name2=value')
})
