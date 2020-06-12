import { Lincoln } from './Lincoln.ts'
import { createOptions } from './CreateOptions.ts'
import { LincolnOptions } from './LincolnOptions.ts'
import { LincolnLogTransform } from './LincolnLogTransform.ts'

export function createLogger(namespace: string | LincolnOptions, transformers: LincolnLogTransform[] = []): Lincoln {
  const options = typeof namespace === 'string' ? createOptions(namespace) : namespace
  const lincoln = new Lincoln(options)
  transformers.map((transformer) => lincoln.intercept(transformer))
  return lincoln
}
