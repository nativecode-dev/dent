import { Ignore, exists, path } from '../deps.ts'

import { Project } from './Models/Project.ts'
import { ProjectFile } from './Models/ProjectFile.ts'
import { ProjectModule } from './Models/ProjectModule.ts'

const RESERVED_FILE_NAMES = ['deps.ts', 'mod.ts', 'mod_run.ts', 'mod_test.ts', 'run.ts', 'test.ts', 'test_deps.ts']

const DENO_IGNORE = new Ignore()
const DENO_IGNORE_NAME = '.denoignore'

export class Crawler {
  async crawl(cwd: string): Promise<Project> {
    const project: Project = {
      location: cwd,
      modules: [],
      name: cwd,
    }

    await this.ignore(path.join(cwd, DENO_IGNORE_NAME), DENO_IGNORE)

    for await (const entry of Deno.readDir(cwd)) {
      if (this.ignored(cwd, cwd, entry)) {
        continue
      }

      if (entry.isDirectory) {
        const module = await this.module(path.join(cwd, entry.name))
        project.modules.push(module)
      }
    }

    return project
  }

  private async module(cwd: string): Promise<ProjectModule> {
    const projectProjectFiles = async (workdir: string) => {
      let files: ProjectFile[] = []

      await this.ignore(path.join(workdir, DENO_IGNORE_NAME), DENO_IGNORE)

      for await (const entry of Deno.readDir(workdir)) {
        if (this.ignored(cwd, workdir, entry)) {
          continue
        }

        if (entry.isDirectory) {
          const children = await projectProjectFiles(path.join(workdir, entry.name))
          files = [...files, ...children]
        }

        if (entry.name.endsWith('.ts')) {
          files.push({ ...entry, location: workdir })
        }
      }

      return files
    }

    const files = await projectProjectFiles(cwd)

    return {
      code: files.filter((file) => RESERVED_FILE_NAMES.includes(file.name.toLowerCase()) === false),
      files: files.filter((file) => RESERVED_FILE_NAMES.includes(file.name.toLowerCase())),
      ignored: files.length === 0,
      location: cwd,
      name: cwd.split('/').reduce<string>((_, current) => current, ''),
    }
  }

  private async ignore(path: string, ignore: Ignore) {
    if (await exists(path)) {
      const modignore = await Deno.readTextFile(path)

      modignore
        .trim()
        .split('\n')
        .reduce((result, current) => result.add(current), ignore)
    }
  }

  private ignored(cwd: string, workdir: string, entry: Deno.DirEntry): boolean {
    const fullpath = path.join(workdir, entry.name)
    const ignored = DENO_IGNORE.test(path.relative(cwd, fullpath))

    if (ignored.ignored && ignored.unignored === false) {
      return true
    }

    if (entry.isSymlink || entry.name.startsWith('.')) {
      return true
    }

    return false
  }
}
