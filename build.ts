import { exists } from 'https://deno.land/std/fs/exists.ts'
import { join, relative } from 'https://deno.land/std/path/mod.ts'

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

const RESERVED_FILE_NAMES = ['deps.ts', 'mod.ts', 'mod_test.ts', 'test_deps.ts']

async function crawlProject(cwd: string): Promise<Project> {
  const project: Project = {
    location: cwd,
    modules: [],
    name: cwd,
  }

  for await (const entry of Deno.readDir(cwd)) {
    if (entry.isSymlink) {
      continue
    }

    if (entry.name.startsWith('.')) {
      continue
    }

    if (entry.isDirectory) {
      const module = await crawlProjectFiles(join(cwd, entry.name))
      project.modules.push(module)
    }
  }

  return project
}

async function crawlProjectFiles(cwd: string): Promise<ProjectModule> {
  const projectProjectFiles = async (workdir: string) => {
    let files: ProjectFile[] = []

    for await (const entry of Deno.readDir(workdir)) {
      if (entry.isSymlink) {
        continue
      }

      if (entry.name === '.modignore') {
        return []
      }

      if (entry.name.startsWith('.')) {
        continue
      }

      if (entry.isDirectory) {
        const children = await projectProjectFiles([workdir, entry.name].join('/'))
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

async function updateProjectFiles(module: ProjectModule) {
  const codefiles = module.code
    .filter((file) => file.location.split('/').includes('lib'))
    .map((file) => {
      const filename = relative(module.location, join(file.location, file.name))
      return `export * from './${filename}'`
    })
    .sort()

  const testfiles = module.code
    .filter((file) => file.location.split('/').includes('tests'))
    .map((file) => {
      const filename = relative(module.location, join(file.location, file.name))
      return `import './${filename}'`
    })
    .sort()

  const mod = join(module.location, 'mod.ts')
  const modtest = join(module.location, 'mod_test.ts')

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
      await updateProjectFiles(module)
    }
  }

  const tests = project.modules
    .map((module) => {
      const filename = relative(project.location, join(module.location, 'mod_test.ts'))
      return `import './${filename}'`
    })
    .sort()

  await Deno.writeTextFile(join(project.location, 'mod_test.ts'), tests.join('\n'))
}

const project = await crawlProject(Deno.cwd())
await updateProject(project)
