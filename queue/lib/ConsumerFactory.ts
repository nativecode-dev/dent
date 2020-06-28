import { connect, AmqpConnection, AmqpChannel, ConnectorOptions, ObjectMerge, QueueDeclareOk } from '../deps.ts'

import { Envelope } from './Envelope.ts'
import { EnvelopeQueue } from './EnvelopeQueue.ts'
import { QueueOptions } from './QueueOptions.ts'

export class ConsumerFactory {
  private connection: AmqpConnection | undefined

  constructor(private readonly options: ConnectorOptions) {}

  async close() {
    if (this.connection) {
      await this.connection.close()
    }

    this.connection = undefined
  }

  async create<T>(options: QueueOptions): Promise<IConsumer<T>> {
    if (this.connection === undefined) {
      this.connection = await connect({
        hostname: this.options.endpoint.host,
        password: this.options.credentials?.password,
        username: this.options.credentials?.username,
      })
    }

    const opts = ObjectMerge.merge<QueueOptions>(options as any, { queue: this.options.name })
    const channel = await this.connection.openChannel()
    await channel.declareQueue(opts)

    return new Consumer<T>(channel, opts)
  }
}

export interface IConsumer<T> {
  ack(envelope: EnvelopeQueue<T>): Promise<void>
  consume(): Promise<EnvelopeQueue<T>>
  nack(envelop: EnvelopeQueue<T>, requeue: boolean): Promise<void>
}

class Consumer<T> implements IConsumer<T> {
  private readonly decoder: TextDecoder = new TextDecoder()

  constructor(private readonly channel: AmqpChannel, private readonly options: QueueOptions) {}

  ack(envelope: EnvelopeQueue<T>) {
    return this.channel.ack({ deliveryTag: envelope.args.deliveryTag })
  }

  consume(): Promise<EnvelopeQueue<T>> {
    return new Promise(async (resolve, reject) => {
      return this.channel.consume(this.options, async (args, props, data) => {
        try {
          const envelop: Envelope<T> = JSON.parse(this.decoder.decode(data))

          const envqueue: EnvelopeQueue<T> = {
            args,
            props,
            body: envelop.body,
            subject: envelop.subject,
            ack: () => this.ack(envqueue),
            nack: () => this.nack(envqueue, true),
          }

          resolve(envqueue)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  nack(envelop: EnvelopeQueue<T>, requeue: boolean = true) {
    return this.channel.nack({ deliveryTag: envelop.args.deliveryTag, requeue })
  }
}
