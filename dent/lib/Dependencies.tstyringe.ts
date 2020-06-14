import { DependencyContainer, Router } from '../deps.ts'

import { Dent } from './Dent.ts'
import { DentConfig } from './DentConfig.ts'
import { DentOptions } from './DentOptions.ts'

export function dependencies<T extends DentOptions>(container: DependencyContainer) {
  return container
    .createChildContainer()
    .registerSingleton<Dent<T>>(Dent, Dent)
    .registerSingleton<DentConfig<T>>(DentConfig, DentConfig)
    .registerSingleton<Router>(Router, Router)
}
