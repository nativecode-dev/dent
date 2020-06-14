import { Essentials, ObjectMerge, exists, join, readJson, writeJson } from '../deps.ts'

import { DentOptions } from './DentOptions.ts'

export class DentConfig<T extends DentOptions> {
  async load(cwd: string = Deno.cwd(), defaults: Essentials.DeepPartial<T>): Promise<T> {
    const filename = join(cwd, '.dent.json')

    if (await exists(filename)) {
      const json: any = await readJson(filename)
      return ObjectMerge.merge(defaults, json)
    }

    return ObjectMerge.merge(defaults)
  }

  async save(cwd: string = Deno.cwd(), options: T): Promise<void> {
    const filename = join(cwd, '.dent.json')
    await writeJson(filename, options)
  }
}
