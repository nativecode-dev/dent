import { assertEquals } from './test_deps.ts'
import { ObjectMap } from './ObjectMap.ts'

const SAMPLE = {
  account: {
    info: {
      firstname: 'Sean',
      lastname: 'Connery',
    },
    logins: [
      {
        login: 'sconnery',
        password: 'test',
      },
      {
        login: 'seanc',
        password: 'test',
      },
    ],
  },
}

Deno.test('should map object', () => {
  const objmap = new ObjectMap(SAMPLE)
  assertEquals(objmap.root.name, 'root')
})

Deno.test('should map deep properties', () => {
  const objmap = new ObjectMap(SAMPLE)
  assertEquals(objmap.getValue('account.user.logins.0.login'), 'sconnery')
})
