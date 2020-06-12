import { ObjectMap } from '../deps.ts'

import { LincolnLogTransform } from '../LincolnLogTransform.ts'

export function createScrubTransformer(properties: string[]): LincolnLogTransform {
  const scrub = (obj: any) => {
    const objmap = new ObjectMap(obj)

    objmap.nodes
      .filter((node) => node.type === 'string')
      .filter((node) => node.path.some((property) => properties.includes(property)))
      .map((node) => (node.value = '[SECRET]'))

    return objmap.toObject()
  }

  return (message) => {
    if (typeof message.body === 'object') {
      message.body = scrub(message.body)
    }

    message.parameters = message.parameters.reduce<any[]>((parameters, param) => {
      if (typeof param === 'object') {
        return [...parameters, scrub(param)]
      }

      return parameters
    }, [])

    return message
  }
}
