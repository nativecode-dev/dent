import { Essentials, ObjectMerge } from '../deps.ts'

import { DentOptions } from './DentOptions.ts'
import { DentCommandExec } from './DentCommandExec.ts'

export class Dent {
  private readonly commands = new Map<string, DentCommandExec>()
  private readonly options: DentOptions

  constructor(options: Essentials.DeepPartial<DentOptions> = {}) {
    this.options = ObjectMerge.merge<DentOptions>(options)
  }

  exec(name: string, args: DentOptions): Promise<void> {
    const executor = this.commands.get(name)

    if (executor) {
      return executor(args)
    }

    return Promise.resolve(undefined)
  }

  exists(name: string): boolean {
    return this.commands.has(name)
  }

  register(name: string, exec: DentCommandExec) {
    this.commands.set(name, exec)
  }
}
