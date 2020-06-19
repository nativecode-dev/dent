import { ConnectorOptions, Redis, connect } from '../deps.ts'

export class Cache {
  private redis: Redis | undefined

  constructor(private readonly coptions: ConnectorOptions) {}

  async open() {
    this.redis =
      this.redis ||
      (await connect({
        hostname: this.coptions.endpoint.host,
        password: this.coptions.credentials?.password,
        db: this.coptions.arguments?.db,
        port: this.coptions.endpoint.port,
        tls: this.coptions.arguments?.tls,
      }))
  }

  close(): void {
    if (this.redis) {
      this.redis.close()
    }

    this.redis = undefined
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (this.redis === undefined) {
      throw new Error('no connection')
    }
    const value = await this.redis.get(key)

    if (value) {
      return JSON.parse(value)
    }
  }

  async set<T>(key: string, value: any) {
    if (this.redis === undefined) {
      throw new Error('no connection')
    }

    const json = JSON.stringify(value)
    await this.redis.set(key, json)
  }
}
