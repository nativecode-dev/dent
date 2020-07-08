import { RxJS } from '../deps.ts'

import { Lincoln } from './Lincoln.ts'
import { LincolnEnvelope } from './LincolnEnvelope.ts'

export abstract class LincolnLog {
  private readonly subscription: RxJS.Subscription

  constructor(lincoln: Lincoln) {
    this.subscription = lincoln.subscribe(
      (envelope) => this.next(envelope),
      (error) => this.error(error),
      () => this.complete(),
    )
  }

  protected abstract initialize(): Promise<void>
  protected abstract render(message: LincolnEnvelope): Promise<void>
  protected abstract renderError(message: LincolnEnvelope): Promise<void>

  private complete(): Promise<void> {
    return Promise.resolve(this.subscription.unsubscribe())
  }

  private error(envelope: LincolnEnvelope): Promise<void> {
    return Promise.resolve(this.renderError(envelope))
  }

  private next(envelope: LincolnEnvelope): Promise<void> {
    return Promise.resolve(this.render(envelope))
  }
}
