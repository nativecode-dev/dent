import { Throttle, parse } from './deps.ts'

import { Dent } from './lib/Dent.ts'
import { TagRelease } from './lib/Semver/TagRelease.ts'
import { CommitParser } from './lib/Semver/CommitParser.ts'

const parsed = parse(Deno.args, { boolean: true })

const dent = new Dent()
dent.register('commit-parser', CommitParser)
dent.register('tag-release', TagRelease)

const tasks = parsed._.reduce<string[]>((results, current) => (typeof current === 'string' ? [...results, current] : results), [])
  .filter((command) => dent.exists(command))
  .map((command) => () => dent.exec(command, parsed))

await Throttle.serial(tasks)
