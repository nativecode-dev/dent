import { Args, Throttle, parse } from '../../deps.ts'

import { Arguments } from './Arguments.ts'
import { ArgumentOptions } from './ArgumentOptions.ts'
import { Command } from './Command.ts'

export namespace Executor {
  const REGISTRY = new Map<string, Command<Arguments>>()

  function validate(args: Args, options: ArgumentOptions): boolean {
    return true
  }

  export async function execute(args: string[]) {
    const argv = parse(args)

    const tasks = argv._.map((name) => async () => {
      if (typeof name === 'string' && REGISTRY.has(name)) {
        const command = REGISTRY.get(name)

        if (command) {
          const options: ArgumentOptions = {}
          options[name] = [{ aliases: command.aliases, default: undefined, name, type: 'string' }]

          const opts = command.build(options)

          if (validate(argv, opts)) {
            await command.execute(argv)
          }
        }
      }
    })

    await Throttle.serial(tasks)
  }

  export function register(...commands: Command<Arguments>[]): void {
    commands.forEach((command) => REGISTRY.set(command.name, command))
  }
}
