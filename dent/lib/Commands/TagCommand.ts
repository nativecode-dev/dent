import { Arguments, ArgumentOptions, Command } from '../../deps.ts'

export interface TagCommandOptions extends Arguments {
  subcommand: string
}

export class TagCommand implements Command<TagCommandOptions> {
  aliases = []
  name = 'tag'

  build = (args: ArgumentOptions): ArgumentOptions => {
    return args
  }

  execute = async (args: TagCommandOptions) => {}
}
