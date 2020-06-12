import { ResourceParamType } from './ResourceParamType.ts'

export interface ResourceParam {
  key: string
  type: ResourceParamType
  value: any
}

export type ResourceParams = ResourceParam[]
