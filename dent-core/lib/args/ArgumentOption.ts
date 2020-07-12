export type ArgumentTypes = 'array' | 'boolean' | 'json' | 'list' | 'number' | 'string'

export interface ArgumentOption {
  aliases: string[]
  default: any
  name: string
  type: ArgumentTypes
}
