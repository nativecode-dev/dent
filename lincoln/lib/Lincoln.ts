import { ObjectMerge, Subject, Subscription } from '../deps.ts'

import { createMessage } from './CreateMessage.ts'
import { LincolnMessage } from './LincolnMessage.ts'
import { LincolnEnvelope } from './LincolnEnvelope.ts'
import { LincolnOptions } from './LincolnOptions.ts'
import { LincolnMessageType } from './LincolnMessageType.ts'
import { LincolnLogTransform } from './LincolnLogTransform.ts'

const DefaultOptions: Partial<LincolnOptions> = {
  namespaceSeparator: ':',
}

export class Lincoln extends Subject<LincolnEnvelope> {
  private readonly namespace: string[]
  private readonly options: LincolnOptions
  private readonly subscriptions: Subscription[] = []

  constructor(options: Partial<LincolnOptions>, private readonly transformers: Set<LincolnLogTransform> = new Set()) {
    super()
    this.options = ObjectMerge.merge<LincolnOptions>(DefaultOptions, options)
    this.namespace = this.options.namespace.split(this.options.namespaceSeparator)
  }

  get scope(): string {
    return this.namespace.join(this.options.namespaceSeparator)
  }

  close(): void {
    this.complete()

    return this.subscriptions.slice().forEach((sub, index) => {
      delete this.subscriptions[index]
      sub.unsubscribe()
    })
  }

  debug<T>(message: T, ...attributes: any[]): Lincoln {
    return this.write(createMessage(message, LincolnMessageType.debug, attributes))
  }

  error<T extends Error>(error: T | any, ...attributes: any[]): Lincoln {
    return this.write(createMessage(error, LincolnMessageType.error, attributes))
  }

  extend(namespace: string): Lincoln {
    const ns = this.namespace.concat(namespace.split(this.options.namespaceSeparator))

    const options = ObjectMerge.merge<LincolnOptions>(this.options, {
      namespace: ns.join(this.options.namespaceSeparator),
    })

    const lincoln = new Lincoln(options, this.transformers)

    const subscription = lincoln.subscribe(
      (value) => this.next(value),
      (error) => this.error(error),
      () => this.complete(),
    )

    this.subscriptions.push(subscription)

    return lincoln
  }

  fatal<T extends Error>(error: T, ...attributes: any[]): Lincoln {
    return this.write(createMessage(error, LincolnMessageType.fatal, attributes))
  }

  info<T>(message: T, ...attributes: any[]): Lincoln {
    return this.write(createMessage(message, LincolnMessageType.info, attributes))
  }

  intercept(transformer: LincolnLogTransform): Lincoln {
    this.transformers.add(transformer)
    return this
  }

  interceptors(transformers: LincolnLogTransform[]): Lincoln {
    return transformers.reduce<Lincoln>((lincoln, transformer) => {
      this.transformers.add(transformer)
      return lincoln
    }, this)
  }

  silly<T>(message: T, ...attributes: any[]): Lincoln {
    return this.write(createMessage(message, LincolnMessageType.silly, attributes))
  }

  trace<T>(message: T, ...attributes: any[]): Lincoln {
    return this.write(createMessage(message, LincolnMessageType.trace, attributes))
  }

  warn<T>(message: T, ...attributes: any[]): Lincoln {
    return this.write(createMessage(message, LincolnMessageType.warn, attributes))
  }

  write(message: LincolnMessage): Lincoln {
    const envelope: LincolnEnvelope = {
      message: this.transform(message),
      created: new Date(),
      scope: this.namespace.join(this.options.namespaceSeparator),
    }

    this.next(envelope)

    return this
  }

  private transform(message: LincolnMessage): LincolnMessage {
    return Array.from(this.transformers.values()).reduce<LincolnMessage>((transformed, transformer) => transformer(transformed), message)
  }
}
