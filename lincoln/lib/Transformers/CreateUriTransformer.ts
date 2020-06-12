import { LincolnMessage } from '../LincolnMessage.ts'

const PATTERN = /((?:git|http[s]?|ftp|ssh):\/\/)(?:.*):(?:.*)@([a-zA-Z0-9\.]+)/gim

export function createUriTransformer(message: LincolnMessage): LincolnMessage {
  if (typeof message.body === 'string') {
    message.body = message.body.replace(PATTERN, '$1[protected]@$2')

    message.parameters = message.parameters.map((parameter) => {
      if (typeof parameter === 'string') {
        return parameter.replace(PATTERN, '$1[protected]@$2')
      }

      return parameter
    })
  }

  return message
}
