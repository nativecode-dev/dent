import { parse } from './deps.ts'

import { Dent } from './lib/Dent.ts'
import { DentOptions } from './lib/DentOptions.ts'
import { TagRelease } from './lib/Semver/TagRelease.ts'
import { CommitParser } from './lib/Semver/CommitParser.ts'

const args = parse(Deno.args) as DentOptions

const dent = new Dent()
dent.register('commit-parser', CommitParser)
dent.register('tag-release', TagRelease)

args._.map((command) => {
  if (dent.exists(command)) {
    dent.exec(command, args)
  }
})
