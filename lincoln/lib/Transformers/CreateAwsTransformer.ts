import { LincolnMessage } from '../LincolnMessage.ts'

const PATTERN_ACCESS_KEY = /\s{0}([A-Z0-9]{20})\s?/gim
const PATTERN_SECRET_KEY = /\s{0}([A-Za-z0-9/+=]{40})\s?/gim

export function createAwsTransformer(message: LincolnMessage): LincolnMessage {
  if (typeof message.body === 'string') {
    message.body = message.body
      .replace(PATTERN_SECRET_KEY, '[AWS_SECRET_ACCESS_KEY]')
      .replace(PATTERN_ACCESS_KEY, '[AWS_ACCESS_KEY_ID]')
  }

  message.parameters = message.parameters.map((parameter) => {
    if (typeof parameter === 'string') {
      return parameter
        .replace(PATTERN_SECRET_KEY, '[AWS_SECRET_ACCESS_KEY]')
        .replace(PATTERN_ACCESS_KEY, '[AWS_ACCESS_KEY_ID]')
    }

    return parameter
  })

  return message
}
