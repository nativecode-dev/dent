import * as path from 'https://deno.land/std@0.57.0/path/mod.ts'

import { Ignore } from './ignore/mod.ts'
import { exists } from 'https://deno.land/std@0.57.0/fs/exists.ts'

interface Project {
  location: string
  modules: ProjectModule[]
  name: string
}

interface ProjectModule {
  code: ProjectCodeFile[]
  files: ProjectFile[]
  ignored: boolean
  location: string
  name: string
}

interface ProjectFile extends Deno.DirEntry {
  location: string
}

interface ProjectCodeFile extends ProjectFile {}

const RESERVED_FILE_NAMES = ['deps.ts', 'mod.ts', 'mod_run.ts', 'mod_test.ts', 'test_deps.ts']

const DENO_IGNORE = new Ignore()
const DENO_IGNORE_NAME = '.denoignore'

async function crawlProject(cwd: string): Promise<Project> {
  const project: Project = {
    location: cwd,
    modules: [],
    name: cwd,
  }

  await updateDenoIgnore(path.join(cwd, DENO_IGNORE_NAME), DENO_IGNORE)

  for await (const entry of Deno.readDir(cwd)) {
    if (ignoreEntry(cwd, cwd, entry)) {
      continue
    }

    if (entry.isDirectory) {
      const module = await crawlModuleFiles(path.join(cwd, entry.name))
      project.modules.push(module)
    }
  }

  return project
}

async function crawlModuleFiles(cwd: string): Promise<ProjectModule> {
  const projectProjectFiles = async (workdir: string) => {
    let files: ProjectFile[] = []

    await updateDenoIgnore(path.join(workdir, DENO_IGNORE_NAME), DENO_IGNORE)

    for await (const entry of Deno.readDir(workdir)) {
      if (ignoreEntry(cwd, workdir, entry)) {
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

function ignoreEntry(cwd: string, workdir: string, entry: Deno.DirEntry): boolean {
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

async function updateDenoIgnore(path: string, ignore: Ignore) {
  if (await exists(path)) {
    const modignore = await Deno.readTextFile(path)

    modignore
      .trim()
      .split('\n')
      .reduce((result, current) => result.add(current), ignore)
  }
}

async function updateModuleFiles(module: ProjectModule): Promise<ProjectModule> {
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
  const modtest = path.join(module.location, 'mod_test.ts')

  if (await exists(mod)) {
    await Deno.remove(mod)
  }

  if (await exists(modtest)) {
    await Deno.remove(modtest)
  }

  if (codefiles.length > 0) {
    await Deno.writeTextFile(mod, codefiles.join('\n'))
  }

  if (testfiles.length > 0) {
    await Deno.writeTextFile(modtest, testfiles.join('\n'))
  }

  return module
}

async function updateProject(project: Project) {
  for (const module of project.modules) {
    if (module.ignored === false) {
      await updateModuleFiles(module)
    }
  }

  const tests = project.modules
    .filter((module) => module.files.some((file) => file.name === 'mod_test.ts'))
    .map((module) => {
      const filename = path.relative(project.location, path.join(module.location, 'mod_test.ts'))
      return `import './${filename}'`
    })
    .sort()

  await Deno.writeTextFile(path.join(project.location, 'mod_test.ts'), tests.join('\n'))
}

await updateProject(await crawlProject(Deno.cwd()))
