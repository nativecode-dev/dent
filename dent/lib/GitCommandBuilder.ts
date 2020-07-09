export class GitCommandBuilder {
  private readonly builders: GitCommandOptionBuilder[] = []

  build(): string {
    return this.builders.reduce<string[]>((command, current) => [...command, current.toString()], []).join(' ')
  }

  command(name: string) {
    const builder = new GitCommandOptionBuilder()
    this.builders.push(builder)
    return builder
  }

  options() {
    const builder = new GitCommandOptionBuilder()
    this.builders.push(builder)
    return builder
  }
}

class GitCommandOptionBuilder {
  private readonly options = new Map<string, string>()

  option(key: string, value: string) {
    this.options.set(key, value)
    return this
  }

  toElements(): string[] {
    const elements: string[] = []

    for (const [key, value] of this.options.entries()) {
      elements.push([key.length === 1 ? '-' : '--', key].join(''))

      if (value) {
        elements.push(value)
      }
    }

    return elements
  }

  toString(): string {
    return this.toElements().join(' ')
  }
}
