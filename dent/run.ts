import { Throttle, parse } from './deps.ts'

import { Dent } from './lib/Dent.ts'
import { TagRelease } from './lib/Semver/TagRelease.ts'
import { TagCommit } from './lib/Semver/TagCommit.ts'

const parsed = parse(Deno.args, { boolean: true })

const dent = new Dent()
dent.register('tag-next', TagCommit)
dent.register('tag-release', TagRelease)

const tasks = parsed._.reduce<string[]>((results, current) => (typeof current === 'string' ? [...results, current] : results), [])
  .filter((command) => dent.exists(command))
  .map((command) => async () => {
    const result = await dent.exec(command, parsed)
    console.log(result)
    return result
  })

await Throttle.serial(tasks)
