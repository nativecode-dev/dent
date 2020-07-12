import { Arguments } from './Arguments.ts'
import { ArgumentOptions } from './ArgumentOptions.ts'

export interface Command<TArguments extends Arguments> {
  readonly aliases: string[]
  readonly name: string

  build(args: ArgumentOptions): ArgumentOptions
  execute(args: TArguments): Promise<void>
}
