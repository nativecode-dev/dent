import { CouchStore } from './mod.ts'
import { config } from './test_deps.ts'

const cfg = config()

// Deno.test('should create instance', async () => {
//   const options = {
//     auth: {
//       password: cfg.COUCHDB_PASSWORD || '',
//       username: cfg.COUCHDB_USERNAME || '',
//     },
//     endpoint: cfg.COUCHDB_ENDPOINT || 'localhost',
//     options: {},
//   }

//   const store = new CouchStore(options)

//   await store.create('dent-tests')
// })
