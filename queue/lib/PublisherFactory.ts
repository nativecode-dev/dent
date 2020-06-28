import { connect, AmqpConnection, AmqpChannel, ConnectorOptions, QueueDeclareOk } from '../deps.ts'

import { Envelope } from './Envelope.ts'
import { QueueOptions } from './QueueOptions.ts'

export class PublisherFactory<T> {
  private connection: AmqpConnection | undefined

  constructor(private readonly coptions: ConnectorOptions) {}

  async close() {
    if (this.connection) {
      await this.connection.close()
    }

    this.connection = undefined
  }

  async create(options: QueueOptions): Promise<IPublisher<T>> {
    this.connection = await connect({
      hostname: this.coptions.endpoint.host,
      password: this.coptions.credentials?.password,
      username: this.coptions.credentials?.username,
      port: this.coptions.endpoint.port,
      vhost: this.coptions.arguments?.vhost,
    })

    const channel = await this.connection.openChannel()
    const queue = await channel.declareQueue(options)

    return new Publisher<T>(options, channel, queue)
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
