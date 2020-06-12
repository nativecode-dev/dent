import { config, Essentials, ObjectMerge } from '../deps.ts'

import { DentOptions } from './DentOptions.ts'

export class Dent {
  private readonly env: { [key: string]: string }
  private readonly options: DentOptions

  constructor(options: Essentials.DeepPartial<DentOptions>) {
    this.env = config()
    this.options = ObjectMerge.merge<DentOptions>(options)
  }
}
