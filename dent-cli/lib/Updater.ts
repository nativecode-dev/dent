import { exists, path } from '../deps.ts'

import { Project } from './Project.ts'
import { ProjectModule } from './ProjectModule.ts'

export class Updater {
  async updateProject(project: Project, log: boolean = false) {
    for (const module of project.modules) {
      if (module.ignored === false) {
        await this.updateModuleFiles(module, log)
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

  private async updateModuleFiles(module: ProjectModule, log: boolean): Promise<ProjectModule> {
    const codefiles = module.code
      .filter((file) => file.location.split('/').includes('lib'))
      .map((file) => {
        const filename = path.relative(module.location, path.join(file.location, file.name))
        return `export * from './${filename}'`
      })
      .sort()

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
      if (log) {
        console.log(`wrote ${mod}`)
      }
    }

    if (testfiles.length > 0) {
      await Deno.writeTextFile(modtest, testfiles.join('\n'))
      if (log) {
        console.log(`wrote ${modtest}`)
      }
    }

    return module
  }
}
