import { Lincoln, LincolnEnvelope, LincolnLog, LincolnMessageType, Debug } from '../deps.ts'

interface DebugLogger {
  [key: string]: any
}

const DEBUG_LOGGERS: DebugLogger = {}

export class LincolnLogDebug extends LincolnLog {
  static observe(lincoln: Lincoln): LincolnLogDebug {
    return new LincolnLogDebug(lincoln)
  }

  protected initialize(): Promise<void> {
    return Promise.resolve()
  }

  protected render(envelope: LincolnEnvelope): Promise<void> {
    const scope = [envelope.scope, this.messageTypeString(envelope.message.type)].join(':')
    const logger: any = DEBUG_LOGGERS[scope] ? DEBUG_LOGGERS[scope] : (DEBUG_LOGGERS[scope] = Debug.default(scope))

    const messageHasString = typeof envelope.message.body === 'string'
    const messageParamsIsArray = Array.isArray(envelope.message.parameters)

    if (messageHasString && messageParamsIsArray) {
      logger(envelope.message.body, ...envelope.message.parameters)
    } else if (messageHasString && messageParamsIsArray === false) {
      logger(envelope.message.body)
    } else {
      logger(JSON.stringify({ body: envelope.message.body, params: envelope.message.parameters }, null, 2))
    }

    return Promise.resolve()
  }

  protected renderError(envelope: LincolnEnvelope): Promise<void> {
    return this.render(envelope)
  }

  protected messageTypeString(type: LincolnMessageType): string {
    switch (type) {
      case LincolnMessageType.debug:
        return 'debug'
      case LincolnMessageType.error:
        return 'error'
      case LincolnMessageType.fatal:
        return 'fatal'
      case LincolnMessageType.info:
        return 'info'
      case LincolnMessageType.silly:
        return 'silly'
      case LincolnMessageType.trace:
        return 'trace'
      case LincolnMessageType.warn:
        return 'watcn'
      default:
        return 'unknown'
    }
  }
}
