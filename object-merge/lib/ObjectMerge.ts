import { Essentials } from '../deps.ts'

import { ObjectMergeOptions, DefaultObjectMergeOptions } from './ObjectMergeOptions.ts'

export namespace ObjectMerge {
  function clone(source: any | any[], target: any, options: ObjectMergeOptions): any | any[] {
    if (Array.isArray(source) && Array.isArray(target)) {
      if (options.dedupe) {
        return [...new Set(source.concat(target))]
      }
      return [...source, ...target]
    } else if (Array.isArray(source)) {
      return [...source]
    }

    if (typeof source !== 'object' || typeof target !== 'object') {
      return source
    }

    if (source instanceof Date || target instanceof Date) {
      return source
    }

    return Object.keys(source).reduce<any>((result, property) => {
      const sourceValue = source[property]
      const targetValue = result[property]

      const sourceType = typeof sourceValue
      const targetType = typeof targetValue

      if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        if (options.dedupe) {
          result[property] = [...new Set(targetValue.concat(sourceValue))]
        } else {
          result[property] = [...targetValue, ...sourceValue]
        }
      } else if (Array.isArray(sourceValue)) {
        result[property] = [...sourceValue]
      } else if (sourceType === 'object' && targetType === 'object') {
        result[property] = { ...clone({ ...sourceValue }, { ...targetValue }, options) }
      } else if (sourceValue !== targetValue) {
        result[property] = sourceValue
      }

      return target
    }, target)
  }

  export function merge<T extends any>(...targets: Array<Essentials.DeepPartial<T>>): T {
    return mergex(DefaultObjectMergeOptions, ...targets)
  }

  export function mergex<T extends any>(options: ObjectMergeOptions, ...targets: Array<Essentials.DeepPartial<T>>): T {
    return targets.filter((x) => x !== undefined).reduce<T>((target, source) => clone(source, target, options), {} as T)
  }
}
