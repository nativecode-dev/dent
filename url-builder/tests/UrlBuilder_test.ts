import { ConnectorOptions } from '../deps.ts'
import { assertEquals } from '../test_deps.ts'

import { UrlBuilder } from '../lib/UrlBuilder.ts'

const CONNECTION: ConnectorOptions = {
  credentials: {
    password: 'g0ds3xl0v3',
    username: 'admin',
  },
  endpoint: {
    host: 'localhost',
    path: '/',
    port: 443,
    query: {},
  },
  name: 'test',
}

Deno.test('should get url from connection options', () => {
  const builder = new UrlBuilder(CONNECTION)
  assertEquals(builder.toUrl(), 'https://localhost/')
})

Deno.test('should get url from connection options, with port', () => {
  const builder = new UrlBuilder(CONNECTION)
  assertEquals(builder.withPort().toUrl(), 'https://localhost/')
})

Deno.test('should get url from connection options, with authentication', () => {
  const builder = new UrlBuilder(CONNECTION)
  assertEquals(builder.withAuthentication().toUrl(), 'https://admin:g0ds3xl0v3@localhost/')
})

Deno.test('should get url from connection options, with authentication and port', () => {
  const builder = new UrlBuilder(CONNECTION)
  assertEquals(builder.withAuthentication().withPort().toUrl(), 'https://admin:g0ds3xl0v3@localhost/')
})

Deno.test('should parse url from hostname', () => {
  const builder = UrlBuilder.parse('//localhost')
  assertEquals(builder.toUrl(), 'localhost')
})

Deno.test('should parse url from hostname with port', () => {
  const builder = UrlBuilder.parse('//localhost:8080')
  assertEquals(builder.withPort().toUrl(), 'localhost:8080')
})

Deno.test('should parse url', () => {
  const builder = UrlBuilder.parse('http://localhost')
  assertEquals(builder.toUrl(), 'http://localhost')
})

Deno.test('should parse url, output port', () => {
  const builder = UrlBuilder.parse('https://localhost')
  assertEquals(builder.withPort().toUrl(), 'https://localhost')
})

Deno.test('should parse url with trailing slash', () => {
  const builder = UrlBuilder.parse('http://localhost/')
  assertEquals(builder.toUrl(), 'http://localhost')
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
  const builder = UrlBuilder.parse('http://localhost:8080/test?name=value&name2=value')
  assertEquals(builder.withPort().toUrl(), 'http://localhost:8080/test?name=value&name2=value')
})

Deno.test('should parse url with authentication', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:8080/test?name=value&name2=value')
  assertEquals(builder.withAuthentication().withPort().toUrl(), 'http://admin:test@localhost:8080/test?name=value&name2=value')
})

Deno.test('should parse url with authentication, no password', () => {
  const builder = UrlBuilder.parse('http://admin@localhost:8080/test?name=value&name2=value')
  assertEquals(builder.withAuthentication().withPort().toUrl(), 'http://admin@localhost:8080/test?name=value&name2=value')
})

Deno.test('should parse url with authentication, no output', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:8080/test?name=value&name2=value')
  assertEquals(builder.toUrl(), 'http://localhost/test?name=value&name2=value')
})

Deno.test('should parse url with authentication without port, no output', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test?name=value&name2=value')
  assertEquals(builder.toUrl(), 'http://localhost/test?name=value&name2=value')
})

Deno.test('should parse url with authentication, with trailing slash', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost:8080/test?name=value&name2=value')
  assertEquals(
    builder.withAuthentication().withPort().withTralingSlash().toUrl(),
    'http://admin:test@localhost:8080/test/?name=value&name2=value',
  )
})

Deno.test('should parse ftp url with authentication, with trailing slash', () => {
  const builder = UrlBuilder.parse('ftp://admin:test@localhost:21/test?name=value&name2=value')
  assertEquals(
    builder.withAuthentication().withPort().withTralingSlash().toUrl(),
    'ftp://admin:test@localhost/test/?name=value&name2=value',
  )
})

Deno.test('should parse url and add additional path', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test')
  assertEquals(builder.withPath('method').toUrl(), 'http://localhost/test/method')
})

Deno.test('should parse url and add additional path with slash', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test')
  assertEquals(builder.withPath('/method').toUrl(), 'http://localhost/test/method')
})

Deno.test('should parse url and add additional query', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test')
  assertEquals(builder.withPath('/method').withQuery({ name: 'value' }).toUrl(), 'http://localhost/test/method?name=value')
})

Deno.test('should parse url and add additional query to existing', () => {
  const builder = UrlBuilder.parse('http://admin:test@localhost/test?name=value')
  assertEquals(builder.withPath('/method').withQuery({ test: 'value' }).toUrl(), 'http://localhost/test/method?name=value&test=value')
})
