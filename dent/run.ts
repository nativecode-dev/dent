import { ObjectMerge, Throttle, parse } from './deps.ts'

import { Dent } from './lib/Dent.ts'
import { DentOptions } from './lib/DentOptions.ts'
import { TagNext } from './lib/Semver/TagNext.ts'
import { TagCommits } from './lib/Semver/TagCommits.ts'
import { TagRelease } from './lib/Semver/TagRelease.ts'

const argv = parse(Deno.args, { boolean: true })
const parsed: DentOptions = ObjectMerge.merge<DentOptions>({ 'dry-run': false, silent: false }, argv)

const dent = new Dent()
dent.register('tag-commits', TagCommits)
dent.register('tag-next', TagNext)
dent.register('tag-release', TagRelease)

const tasks = parsed._.reduce<string[]>((results, current) => (typeof current === 'string' ? [...results, current] : results), [])
  .filter((command) => dent.exists(command))
  .map((command) => async () => await dent.exec(command, parsed))

await Throttle.serial(tasks)
