import { connect, AmqpConnection, AmqpChannel, ConnectorOptions, ObjectMerge, QueueDeclareOk } from '../deps.ts'

import { Envelope } from './Envelope.ts'
import { QueueOptions } from './QueueOptions.ts'

export class PublisherFactory {
  private connection: AmqpConnection | undefined

  constructor(private readonly options: ConnectorOptions) {}

  async close() {
    if (this.connection) {
      await this.connection.close()
    }

    this.connection = undefined
  }

  async create<T>(options: QueueOptions): Promise<IPublisher<T>> {
    if (this.connection === undefined) {
      this.connection = await connect({
        hostname: this.options.endpoint.host,
        password: this.options.credentials?.password,
        username: this.options.credentials?.username,
        port: this.options.endpoint.port,
        vhost: this.normalize(this.options.endpoint.path),
      })
    }

    const opts = ObjectMerge.merge<QueueOptions>(options as any, { queue: this.options.name })
    const channel = await this.connection.openChannel()
    const queue = await channel.declareQueue(opts)

    return new Publisher<T>(opts, channel, queue)
  }

  private normalize(value: string = '/'): string {
    return value.startsWith('/') ? value : `/${value}`
  }
}

export interface IPublisher<T> {
  send(message: T): Promise<Envelope<T>>
}

class Publisher<T> implements IPublisher<T> {
  private readonly encoder = new TextEncoder()

  constructor(private readonly options: QueueOptions, private readonly channel: AmqpChannel, queue: QueueDeclareOk) {}

  async send(message: T): Promise<Envelope<T>> {
    const envelope: Envelope<T> = { body: message, subject: this.options.subject }

    await this.channel.publish(
      { routingKey: this.options.queue },
      { contentType: 'application/json' },
      this.encoder.encode(JSON.stringify(envelope)),
    )

    return envelope
  }
}
