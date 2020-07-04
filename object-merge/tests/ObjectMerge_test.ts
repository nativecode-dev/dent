import { assertEquals } from '../test_deps.ts'
import { ObjectMerge } from '../lib/ObjectMerge.ts'
import { ArrayMergeType } from '../lib/ArrayMergeType.ts'

const CONNECTION_EXPECTED = {
  connections: {
    couchdb: {
      name: 'couchdb',
      host: 'localhost',
      options: {
        url: 'http://localhost:5984/testdb',
      },
    },
    rabbit: {
      name: 'rabbit',
      host: 'localhost',
      auth: {
        pass: 'admin',
        user: 'password123',
      },
    },
  },
  account: {
    created: new Date(2020, 1, 1, 0, 0, 0),
    logins: [{ username: 'admin' }, { username: 'root' }],
  },
}

const CONNECTION_TARGETS = [
  {
    connections: {
      couchdb: {
        name: 'couchdb',
        host: 'localhost',
        options: {
          url: 'http://localhost:5984/testdb',
        },
      },
    },
    account: {
      created: new Date(2019, 1, 1, 0, 0, 0),
      logins: [{ username: 'admin' }, { username: 'root' }],
    },
  },
  {
    connections: {
      rabbit: {
        name: 'rabbit',
        host: 'localhost',
        auth: {
          pass: 'admin',
          user: 'password123',
        },
      },
    },
    account: {
      created: new Date(2020, 1, 1, 0, 0, 0),
      logins: [{ username: 'root' }],
    },
  },
]

Deno.test('should merge arrays', () => {
  const merged: string[] = ObjectMerge.merge(['a', 'b', 'c'], ['d', 'e', 'e'])
  assertEquals(merged.sort(), ['a', 'b', 'c', 'd', 'e'])
})

Deno.test('should dedupe arrays', () => {
  const merged: string[] = ObjectMerge.custom({ array: ArrayMergeType.dedupe }, ['a', 'b', 'c', 'b'], ['c', 'd', 'e', 'e'])
  assertEquals(merged.sort(), ['a', 'b', 'c', 'd', 'e'])
})

Deno.test('should overwrite dates', () => {
  const merged = ObjectMerge.merge({ date: new Date() }, { date: new Date(2020, 1, 1) })
  assertEquals(merged.date.toDateString(), 'Sat Feb 01 2020')
})

Deno.test('should overwrite numbers', () => {
  const merged = ObjectMerge.merge({ num: 123 }, { num: 321 })
  assertEquals(merged, { num: 321 })
})

Deno.test('should overwrite strings', () => {
  const merged = ObjectMerge.merge({ str: 'test1' }, { str: 'test2' })
  assertEquals(merged, { str: 'test2' })
})

Deno.test('should clone array properties', () => {
  const targets = [{ letters: ['a', 'b', 'c'] }, { letters: ['d'] }]
  const merged = ObjectMerge.merge(...targets)
  assertEquals(merged, { letters: ['d', 'a', 'b', 'c'] })
})

Deno.test('should clone object properties', () => {
  const address1 = { address: { address1: 'Main Street' } }
  const address2 = { address: { address2: 'Suite 101' } }
  const targets = [address1, address2]
  const merged = ObjectMerge.merge<{ address: { address1: string; address2: string } }>(...targets)
  assertEquals(merged.address === address1.address, false)
  assertEquals(merged.address === address2.address, false)
  assertEquals(merged, { address: { address1: 'Main Street', address2: 'Suite 101' } })
})

Deno.test('should filter undefined targets', () => {
  const targets = [{ address: { address1: 'Main Street' } }, { address: { address2: 'Suite 101' } }, undefined]
  const merged = ObjectMerge.merge(...targets)
  assertEquals(merged, { address: { address1: 'Main Street', address2: 'Suite 101' } })
})

Deno.test('should clone string properties', () => {
  const targets = [{ firstname: 'Mike' }, { lastname: 'Pham' }]
  const merged = ObjectMerge.merge(...targets)
  assertEquals(merged, { firstname: 'Mike', lastname: 'Pham' })
})

Deno.test('should ovewrite string properties', () => {
  const targets = [{ firstname: 'Mike' }, { lastname: 'Pham' }, { lastname: 'CoolGuy' }]
  const merged = ObjectMerge.merge(...targets)
  assertEquals(merged, { firstname: 'Mike', lastname: 'CoolGuy' })
})

Deno.test('should merge complex object', () => {
  const merged = ObjectMerge.custom({ array: ArrayMergeType.dedupe }, ...CONNECTION_TARGETS)
  assertEquals(merged, CONNECTION_EXPECTED)
})

Deno.test('should merge and validate value identity', () => {
  const merged = ObjectMerge.merge(...CONNECTION_TARGETS)
  assertEquals(merged.connections!.couchdb === CONNECTION_EXPECTED.connections.couchdb, false)
  assertEquals(merged.connections!.rabbit!.auth === CONNECTION_EXPECTED.connections.rabbit.auth, false)
})
