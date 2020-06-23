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
      const cloneValue = result[property]
      const sourceValue = source[property]

      const cloneType = typeof cloneValue
      const sourceType = typeof sourceValue

      if (Array.isArray(cloneValue) && Array.isArray(sourceValue)) {
        if (options.dedupe) {
          result[property] = [...new Set(cloneValue.concat(sourceValue))]
        } else {
          result[property] = [...cloneValue, ...sourceValue]
        }
      } else if (Array.isArray(sourceValue)) {
        result[property] = [...sourceValue]
      } else if (cloneType === 'object' && sourceType === 'object') {
        result[property] = clone(sourceValue, { ...cloneValue }, options)
      } else if (sourceValue !== cloneValue) {
        result[property] = sourceValue
      }

      return target
    }, target)
  }

  export function merge<T extends any>(...targets: Array<Essentials.DeepPartial<T>>): T {
    return mergex(DefaultObjectMergeOptions, {} as any, ...targets)
  }

  export function mergex<T extends any>(options: ObjectMergeOptions, ...targets: Array<Essentials.DeepPartial<T>>): T {
    return targets.filter((x) => x !== undefined).reduce((target, source) => clone(source, target, options)) as T
  }
}
