import { Essentials, ObjectMap, ObjectMerge } from '../deps.ts'

import { EnvOptions } from './EnvOptions.ts'

export class Env {
  private readonly options: EnvOptions

  constructor(options: Essentials.DeepPartial<EnvOptions>) {
    this.options = ObjectMerge.mergex<EnvOptions>({ dedupe: true }, options)
  }

  toObject(): any {
    const obj = this.paths()
      .map((path) => path.split('.'))
      .reduce<any>((result, paths) => ({ ...result, ...this.createNode(paths, result) }), {})

    return obj
  }

  toVariables(): any {
    const objmap = new ObjectMap(this.toObject())
    return objmap.paths().reduce<any>((output, current) => {
      const name = current.replace(/\./g, '_')
      const value = objmap.getValue(current)
      output[name] = value
      return output
    }, {})
  }

  private casing(value: string): string {
    return value.toLowerCase()
  }

  private createNode(paths: string[], context: any = {}): any {
    const lastIndex = paths.length - 1
    const parts = paths.slice(0, lastIndex)
    const property = this.casing(paths.slice(lastIndex).join())
    const value = this.options.env[paths.join('_')]

    const varobj = parts.reduce<any>((result, current) => {
      const key = this.casing(current)
      if (result[key]) {
        return result[key]
      }
      return (result[key] = {})
    }, context)

    varobj[property] = value

    return context
  }

  private paths(): string[] {
    return Object.keys(this.options.env)
      .map((envname) => envname.replace(/\_/g, '.'))
      .filter((paths) => this.options.prefix.map((prefix) => prefix.toUpperCase()).includes(paths.split('.')[0].toUpperCase()))
      .sort()
  }
}
