import { Lincoln, exists, path } from '../deps.ts'

import { Project } from './Models/Project.ts'
import { ProjectModule } from './Models/ProjectModule.ts'

export interface UpdaterOptions {}

export class Updater {
  private readonly options: UpdaterOptions
  private readonly log: Lincoln

  constructor(logger: Lincoln, options: UpdaterOptions) {
    this.log = logger.extend('updater')
    this.options = options
  }

  async update(project: Project) {
    for (const module of project.modules) {
      if (module.ignored === false) {
        await this.files(module)
      }
    }

    const tests = project.modules
      .filter((module) => module.files.some((file) => file.name === 'test.ts'))
      .map((module) => {
        const filename = path.relative(project.location, path.join(module.location, 'test.ts'))
        return `import './${filename}'`
      })
      .sort()

    await Deno.writeTextFile(path.join(project.location, 'test.ts'), tests.join('\n'))
  }

  private async files(module: ProjectModule): Promise<ProjectModule> {
    const codefiles = module.code
      .filter((file) => file.location.split('/').includes('lib'))
      .map((file) => {
        const filename = path.relative(module.location, path.join(file.location, file.name))
        return `export * from './${filename}'`
      })
      .sort()

    const modfiles = module.files
      .filter((file) => file.name === 'mod.ts')
      .map((file) => {
        const filename = path.relative(module.location, path.join(file.location, file.name))
        return `export * from './${filename}'`
      })
      .sort()

    this.log.debug(module.location, modfiles)

    const testfiles = module.code
      .filter((file) => file.location.split('/').includes('tests'))
      .map((file) => {
        const filename = path.relative(module.location, path.join(file.location, file.name))
        return `import './${filename}'`
      })
      .sort()

    const mod = path.join(module.location, 'mod.ts')
    const modtest = path.join(module.location, 'test.ts')

    if (await exists(mod)) {
      await Deno.remove(mod)
    }

    if (await exists(modtest)) {
      await Deno.remove(modtest)
    }

    if (codefiles.length > 0) {
      await Deno.writeTextFile(mod, codefiles.join('\n'))
      this.log.debug(`wrote ${mod}`)
    }

    if (testfiles.length > 0) {
      await Deno.writeTextFile(modtest, testfiles.join('\n'))
      this.log.debug(`wrote ${modtest}`)
    }

    return module
  }
}
