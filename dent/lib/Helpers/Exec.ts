const decoder = new TextDecoder()

export async function Exec(command: string, ...args: string[]): Promise<string> {
  const process = Deno.run({ cmd: [command, ...args] })
  const output = await process.output()
  return decoder.decode(output)
}
