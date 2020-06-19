import { ConnectorOptions, ObjectMerge } from '../deps.ts'
import { Env, assertEquals } from '../test_deps.ts'

import { ConsumerFactory } from '../lib/ConsumerFactory.ts'
import { PublisherFactory } from '../lib/PublisherFactory.ts'

const env = new Env({ env: Deno.env.toObject(), prefix: ['test'] })
const envobj = env.toObject()

const CONNECTION = ObjectMerge.merge<ConnectorOptions>(
  {
    arguments: { vhost: '/' },
    endpoint: {
      host: 'localhost',
      port: 5672,
    },
    name: 'rabbitmq',
  },
  envobj.test.rabbitmq,
)

const QUEUE = {
  durable: false,
  subject: 'test-queue',
}

interface TestMessage {
  test: string
}

Deno.test('should publish to queue', async () => {
  const message = { test: 'message' }
  const factory = new PublisherFactory<TestMessage>(CONNECTION, QUEUE)
  const publisher = await factory.create()
  const envelope = await publisher.send(message)
  await factory.close()

  assertEquals(envelope, { body: message, subject: QUEUE.subject })
})

Deno.test('should not acknowledge consumed message', async () => {
  const message = { test: 'message' }
  const factory = new ConsumerFactory<TestMessage>(CONNECTION, QUEUE)
  const consumer = await factory.create()
  const envelope = await consumer.consume()
  await consumer.nack(envelope)
  await factory.close()

  assertEquals(envelope.body, message)
})

Deno.test('should acknowledge consumed message', async () => {
  const message = { test: 'message' }
  const factory = new ConsumerFactory<TestMessage>(CONNECTION, QUEUE)
  const consumer = await factory.create()
  const envelope = await consumer.consume()
  await consumer.ack(envelope)
  await factory.close()

  assertEquals(envelope.body, message)
})
