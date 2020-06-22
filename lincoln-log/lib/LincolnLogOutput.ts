import { DenoLog, Lincoln, LincolnEnvelope, LincolnLog, LincolnMessageType } from '../deps.ts'

class LincolnLogOutput extends LincolnLog {
  constructor(lincoln: Lincoln) { 
    super(lincoln)

    DenoLog.setup({
      handlers: { console: new DenoLog.handlers.ConsoleHandler('DEBUG') },

      loggers: {
        default: {
          level: 'DEBUG',
          handlers: ['console'],
        },
      },
    })
  }

  protected async initialize(): Promise<void> {
    return Promise.resolve()
  }

  protected async render(envelope: LincolnEnvelope): Promise<void> {
    const log = DenoLog.getLogger('console')

    switch (envelope.message.type) {
      case LincolnMessageType.debug:
      case LincolnMessageType.silly:
      case LincolnMessageType.trace:
        log.debug(envelope.message.body, ...envelope.message.parameters)
        break

      case LincolnMessageType.error:
        log.error(envelope.message.body, ...envelope.message.parameters)
        break

      case LincolnMessageType.fatal:
        log.critical(envelope.message.body, ...envelope.message.parameters)
        break

      case LincolnMessageType.info:
        log.info(envelope.message.body, ...envelope.message.parameters)
        break

      case LincolnMessageType.warn:
        log.warning(envelope.message.body, ...envelope.message.parameters)
        break
    }
  }

  protected async renderError(enveloper: LincolnEnvelope): Promise<void> {
    const log = DenoLog.getLogger('console')
    log.error(enveloper.message.body, enveloper.message.parameters)
  }
}

export function attachLincolnLogOutput(logger: Lincoln): void {
  new LincolnLogOutput(logger)
}
