import { assertEquals } from '../test_deps.ts'
import { ObjectMerge } from '../lib/ObjectMerge.ts'

Deno.test('should merge arrays', () => {
  const merged: string[] = ObjectMerge.merge(['a', 'b', 'c'], ['d', 'e', 'e'])
  assertEquals(merged.sort(), ['a', 'b', 'c', 'd', 'e', 'e'])
})

Deno.test('should dedupe arrays', () => {
  const merged: string[] = ObjectMerge.mergex({ dedupe: true }, ['a', 'b', 'c', 'b'], ['c', 'd', 'e', 'e'])
  assertEquals(merged.sort(), ['a', 'b', 'c', 'd', 'e'])
})

Deno.test('should overwrite dates', () => {
  const merged: Date = ObjectMerge.merge(new Date(), new Date(2020, 1, 1))
  assertEquals(merged.toDateString(), 'Sat Feb 01 2020')
})

Deno.test('should overwrite numbers', () => {
  const merged = ObjectMerge.merge(123, 321)
  assertEquals(merged, 321)
})

Deno.test('should overwrite strings', () => {
  const merged = ObjectMerge.merge('test1', 'test2')
  assertEquals(merged, 'test2')
})

Deno.test('should clone array properties', () => {
  const targets = [{ letters: ['a', 'b', 'c'] }, { letters: ['d'] }]
  const merged = ObjectMerge.merge(...targets)
  assertEquals(merged, { letters: ['a', 'b', 'c', 'd'] })
})

Deno.test('should clone object properties', () => {
  const address1 = { address: { address1: 'Main Street' } }
  const address2 = { address: { address2: 'Suite 101' } }
  const targets = [address1, address2]
  const merged = ObjectMerge.merge(...targets)
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
  const expected = {
    connections: [
      {
        name: 'couchdb',
        host: 'localhost',
        options: {
          url: 'http://localhost:5984/testdb',
        },
      },
      {
        name: 'rabbit',
        host: 'localhost',
        auth: {
          pass: 'admin',
          user: 'adminpassword',
        },
      },
    ],
    account: {
      username: 'admin',
      password: 'test',
      created: new Date(2020, 1, 1, 0, 0, 0),
    },
  }

  const targets = [
    {
      connections: [
        {
          name: 'couchdb',
          host: 'localhost',
          options: {
            url: 'http://localhost:5984/testdb',
          },
        },
      ],
      account: {
        username: 'root',
        password: 'pass',
        created: new Date(2019, 1, 1, 0, 0, 0),
      },
    },
    {
      account: {
        username: 'admin',
        password: 'test',
        created: new Date(2020, 1, 1, 0, 0, 0),
      },
    },
    {
      connections: [
        {
          name: 'rabbit',
          host: 'localhost',
          auth: {
            pass: 'admin',
            user: 'adminpassword',
          },
        },
      ],
    },
  ]

  const merged = ObjectMerge.mergex({ dedupe: true }, ...targets)
  assertEquals(merged, expected)
})
