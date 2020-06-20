import { ConnectorOptions, ConnectorProtocols, Document, Env, Essentials, ObjectMerge } from '../deps.ts'
import { assertEquals, assertThrowsAsync } from '../test_deps.ts'

import { CouchStore } from '../mod.ts'

interface TestDocument extends Document {
  name: string
  value: any
}

const env = new Env({ env: Deno.env.toObject(), prefix: ['test'] })
const envobj = env.toObject()

const DEFAULTS: Essentials.DeepPartial<ConnectorOptions> = {
  endpoint: {
    host: 'localhost',
    port: 80,
    protocol: ConnectorProtocols.http,
  },
  name: 'couchdb',
}

const document: TestDocument = { name: 'method', value: { GET: 'get' } }
const options = ObjectMerge.merge<ConnectorOptions>(DEFAULTS, envobj.test.couchdb)
const store = new CouchStore(options)

Deno.test('should create database', async () => {
  await store.create('test')
})

Deno.test('should get empty collection', async () => {
  const collection = await store.collection<TestDocument>('test', 'test-document')
  const result = await collection.all()
  assertEquals(result, [])
})

Deno.test('should add document', async () => {
  const collection = await store.collection<TestDocument>('test', 'test-document')
  const docid = await collection.update(document, (doc) => doc.name!)
  const result = await collection.get(docid)
  assertEquals(result.name, document.name)
})

Deno.test('should delete document', async () => {
  const collection = await store.collection<TestDocument>('test', 'test-document')
  const doc = await collection.get(document.name)
  await collection.delete(doc._id!, doc._rev)

  await assertThrowsAsync(
    async () => {
      await collection.get(document.name)
    },
    undefined,
    'not_found',
  )
})

Deno.test('should delete database', async () => {
  await store.delete('test')
})
