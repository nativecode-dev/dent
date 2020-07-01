import { Essentials, deepmerge } from '../deps.ts'

import { ArrayMergeType } from './ArrayMergeType.ts'
import { ObjectMergeOptions, DefaultObjectMergeOptions } from './ObjectMergeOptions.ts'

export namespace ObjectMerge {
  const combine = (target: any[], source: any[], options: any) => {
    const destination = target.slice()

    source.forEach((item, index) => {
      if (typeof destination[index] === 'undefined') {
        destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
      } else if (options.isMergeableObject(item)) {
        destination[index] = merge(target[index], item, options)
      } else if (target.indexOf(item) === -1) {
        destination.push(item)
      }
    })

    return destination
  }

  const dedupe = <T extends any>(source: T[], target: T[] = []): T[] => {
    return source
      .concat(target || [])
      .filter((item, index, array) => array.indexOf(item) === index)
      .reduce<T[]>((results, item) => {
        if (results.includes(item)) {
          return results
        }
        return [...results, item]
      }, [])
  }

  const overwrite = (_: any[], source: any[]) => source

  function convert(options: ObjectMergeOptions) {
    switch (options.array) {
      case ArrayMergeType.combine:
        return { arrayMerge: combine }
      case ArrayMergeType.overwrite:
        return { arrayMerge: overwrite }
      default:
        return { arrayMerge: dedupe }
    }
  }

  export function custom<T extends any>(options: ObjectMergeOptions, ...sources: Array<Essentials.DeepPartial<T>>): T {
    return sources.filter((x) => x !== undefined).reduce<T>((target, source) => deepmerge(target, source, convert(options)), {} as T)
  }

  export function merge<T extends any>(...sources: Array<Essentials.DeepPartial<T>>): T {
    return custom(DefaultObjectMergeOptions, ...sources)
  }
}
