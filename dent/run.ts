import { parse } from './deps.ts'

import { Dent } from './lib/Dent.ts'
import { DentOptions } from './lib/DentOptions.ts'
import { CommitParser } from './lib/Semver/CommitParser.ts'

const args = parse(Deno.args) as DentOptions

const dent = new Dent()
dent.register('commit-parser', CommitParser)

args._.map((command) => {
  if (dent.exists(command)) {
    dent.exec(command, args)
  }
})
