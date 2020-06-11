export interface ObjectMapValue {
  name: string
  path: string[]
  properties: ObjectMapValue[]
  type: string
  value: any
}
