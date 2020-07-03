import { ArrayMergeType } from './ArrayMergeType.ts'

export interface ObjectMergeOptions {
  array: ArrayMergeType
}

export const DefaultObjectMergeOptions: ObjectMergeOptions = {
  array: ArrayMergeType.none,
}
