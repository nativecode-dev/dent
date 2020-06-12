import { LincolnOptions } from './LincolnOptions.ts'

export function createOptions(namespace: string): LincolnOptions {
  return { namespace, namespaceSeparator: ':' }
}
