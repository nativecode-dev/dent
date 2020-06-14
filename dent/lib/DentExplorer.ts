import {
  exists,
  load,
  path,
  Ignore,
  DentModule,
  DentModuleFile,
  DentConfig,
  DentModuleType,
  ObjectMerge,
} from '../deps.ts'

export class DentExplorer {
  async explore(directory: string): Promise<{ config: DentConfig; module: DentModule }> {
    const config = await this.getDenoYaml(path.join(directory, '.deno.yaml'))
    const ignore: Ignore = config.ignore.patterns.reduce((result, current) => result.add(current), new Ignore())

    const current: DentModule = {
      files: [],
      modules: [],
      name: path.basename(directory),
      path: path.dirname(directory),
    }

    for await (const entry of Deno.readDir(directory)) {
      if (this.isIgnored(ignore, entry)) {
        continue
      }

      if (entry.isDirectory) {
        const { module } = await this.explore(path.join(directory, entry.name))
        module.modules.push(module)
        continue
      }

      if (entry.isFile) {
        const file: DentModuleFile = { name: entry.name, path: directory, type: this.entryFileType(config, entry.name) }
        current.files.push(file)
        continue
      }
    }

    return { config, module: current }
  }

  protected reservedNames(): string[] {
    return ['deps.ts', 'mod.ts', 'mod_run.ts', 'mod_test.ts', 'test.ts', 'test_deps.ts']
  }

  private entryFileType(config: DentConfig, name: string): DentModuleType {
    if (this.reservedNames().includes(name)) {
      return DentModuleType.reserved
    }

    if (config.extensions.tests.some((ext) => name.endsWith(ext))) {
      return DentModuleType.test
    }

    if (config.extensions.code.includes(path.extname(name))) {
      return DentModuleType.code
    }

    return DentModuleType.misc
  }

  private async getDenoYaml(filepath: string): Promise<DentConfig> {
    const defaults = {
      extends: [],
      ignore: { patterns: [] },
      sync: { Indexer: true, TestIndexer: true },
      extensions: { code: ['.js', '.ts'], tests: ['.test.js', '_test.js', '.test.ts', '_test.ts'] },
      permissions: ['allow-env', 'allow-read'],
    }

    if (await exists(filepath)) {
      const yaml = await Deno.readTextFile(filepath)
      return ObjectMerge.merge(defaults, load(yaml))
    }

    return defaults
  }

  private isIgnored(ignore: Ignore, entry: Deno.DirEntry): boolean {
    const result = ignore.test(entry.name)
    const ignored = result.ignored && result.unignored === false
    return ignored || entry.name.startsWith('.') || entry.isSymlink
  }
}
