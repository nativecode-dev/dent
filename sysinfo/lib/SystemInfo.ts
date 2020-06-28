export function getHost(): string {
  return Deno.env.get('HOST') || Deno.hostname() || 'localhost'
}
