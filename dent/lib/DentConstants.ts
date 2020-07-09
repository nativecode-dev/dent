export const DentConstants: { readonly [key: string]: any } = {
  commit: /^(?:[a-h0-9]{7}\s\(\w+\s->\s\w+\)\s+)?(build|chore|ci|docs|feat|feature|fix|perf|refactor|revert|style|test)(\([a-z ]+\))?:\s?([\w\s]+)$/gim,
}
