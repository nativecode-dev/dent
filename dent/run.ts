import { ObjectMerge, Throttle, parse } from './deps.ts'

import { Dent } from './lib/Dent.ts'
import { DentOptions } from './lib/DentOptions.ts'
import { TagNext } from './lib/Semver/TagNext.ts'
import { TagCommits } from './lib/Semver/TagCommits.ts'
import { TagRelease } from './lib/Semver/TagRelease.ts'

const argv = parse(Deno.args, { boolean: true })
const options: DentOptions = ObjectMerge.merge<DentOptions>({ 'dry-run': false, silent: false }, argv)

const isCI = Deno.env.get('CI') !== undefined
const isProduction = Deno.env.get('DENO_ENV') !== 'production'

if (isCI || isProduction) {
  console.log(options)
}

const dent = new Dent()
dent.register('tag-commits', TagCommits)
dent.register('tag-next', TagNext)
dent.register('tag-release', TagRelease)

try {
  const tasks = options._.reduce<string[]>((results, current) => (typeof current === 'string' ? [...results, current] : results), [])
    .filter((command) => dent.exists(command))
    .map((command) => async () => await dent.exec(command, options))

  await Throttle.serial(tasks)
} catch (error) {
  console.error(error)
}
