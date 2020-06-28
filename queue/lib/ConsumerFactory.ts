import { connect, AmqpConnection, AmqpChannel, ConnectorOptions, QueueDeclareOk } from '../deps.ts'

import { Envelope } from './Envelope.ts'
import { EnvelopeQueue } from './EnvelopeQueue.ts'
import { QueueOptions } from './QueueOptions.ts'

export class ConsumerFactory<T> {
  private connection: AmqpConnection | undefined

  constructor(private readonly coptions: ConnectorOptions) {}

  async close() {
    if (this.connection) {
      await this.connection.close()
    }

    this.connection = undefined
  }

  async create(options: QueueOptions): Promise<IConsumer<T>> {
    this.connection = await connect({
      hostname: this.coptions.endpoint.host,
      password: this.coptions.credentials?.password,
      username: this.coptions.credentials?.username,
    })

    const channel = await this.connection.openChannel()
    const queue = await channel.declareQueue(options)

    return new Consumer<T>(channel, options, queue)
  }
}

export interface IConsumer<T> {
  ack(envelope: EnvelopeQueue<T>): Promise<void>
  consume(): Promise<EnvelopeQueue<T>>
  nack(envelop: EnvelopeQueue<T>, requeue: boolean): Promise<void>
}

class Consumer<T> implements IConsumer<T> {
  private readonly decoder: TextDecoder = new TextDecoder()

  constructor(private readonly channel: AmqpChannel, private readonly options: QueueOptions, private readonly queue: QueueDeclareOk) {}

  ack(envelope: EnvelopeQueue<T>) {
    return this.channel.ack({ deliveryTag: envelope.args.deliveryTag })
  }

  consume(): Promise<EnvelopeQueue<T>> {
    return new Promise(async (resolve) => {
      return this.channel.consume(this.options, async (args, props, data) => {
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
      })
    })
  }

  nack(envelop: EnvelopeQueue<T>, requeue: boolean = true) {
    return this.channel.nack({ deliveryTag: envelop.args.deliveryTag, requeue })
  }
}
