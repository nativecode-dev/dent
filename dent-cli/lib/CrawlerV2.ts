import { exists, path } from '../deps.ts'

export enum CrawlerFileType {
  directory = 'DIRECTORY',
  file = 'FILE',
}

export interface CrawlerFile {
  name: string
  path: string
  type: CrawlerFileType
}

export interface CrawlerV2Options {
  types: {
    code: string[]
    meta: string[]
  }
}

export class CrawlerV2 {
  constructor(protected readonly options: CrawlerV2Options) {}

  async crawl(cwd: string): Promise<CrawlerFile[]> {
    let results: CrawlerFile[] = []

    if ((await exists(cwd)) === false) {
      throw new Error(`directory does not exist: ${cwd}`)
    }

    for await (const entry of Deno.readDir(cwd)) {
      const workdir = path.join(cwd, entry.name)

      if (entry.isDirectory) {
        results.push({ name: entry.name, path: cwd, type: CrawlerFileType.directory })
        results = [...results, ...(await this.crawl(workdir))]
        continue
      }

      results.push({ name: entry.name, path: cwd, type: CrawlerFileType.file })
    }

    return results
  }
}
