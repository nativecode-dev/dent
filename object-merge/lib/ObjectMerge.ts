import { Essentials, deepmerge } from '../deps.ts'

import { ArrayMergeType } from './ArrayMergeType.ts'
import { ObjectMergeOptions, DefaultObjectMergeOptions } from './ObjectMergeOptions.ts'

export namespace ObjectMerge {
  function arrayof(type: string, collection: any[]): boolean {
    return collection.every((item) => typeof item === type)
  }

  function exists(element: any, collection: any[]): boolean {
    return collection.some((source) =>
      Object.keys(element).reduce((previous, key) => (source[key] === element[key] ? true : previous), false),
    )
  }

  function targets(element: any, collection: any[]): any[] {
    return collection.filter((target) => Object.keys(element).some((key) => element[key] === target[key]))
  }

  export function custom<T extends any>(options: ObjectMergeOptions, ...sources: Array<Essentials.DeepPartial<T>>): T {
    const combine = (target: any[], source: any[], options: any) => {
      const destination = target.slice()

      source.forEach((element, index) => {
        if (typeof destination[index] === 'undefined') {
          destination[index] = options.cloneUnlessOtherwiseSpecified(element, options)
        } else if (exists(element, target) === false && options.isMergeableObject(element)) {
          destination[index] = custom(options, target[index], element)
        } else if (target.indexOf(element) === -1 && exists(element, target) === false) {
          destination.push(element)
        }
      })

      return destination
    }

    const dedupe = (target: any[], source: any[], options: any): any[] => {
      if (arrayof('object', source)) {
        return combine(target, source, options)
      }

      return source
        .concat(target.slice())
        .filter((item, index, array) => array.indexOf(item) === index)
        .reduce<T[]>((results, item) => (results.includes(item) ? results : [...results, item]), [])
    }

    const overwrite = (_: any[], source: any[]) => source

    const convert = (options: ObjectMergeOptions) => {
      switch (options.array) {
        case ArrayMergeType.combine:
          return { arrayMerge: combine }
        case ArrayMergeType.dedupe:
          return { arrayMerge: dedupe }
        case ArrayMergeType.overwrite:
          return { arrayMerge: overwrite }
        default:
          return {}
      }
    }

    return sources.filter((x) => x !== undefined).reduce<T>((target, source) => deepmerge(target, source, convert(options)), {} as T)
  }

  export function merge<T extends any>(...sources: Array<Essentials.DeepPartial<T>>): T {
    return custom(DefaultObjectMergeOptions, ...sources)
  }
}
