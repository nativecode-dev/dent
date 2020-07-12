export const DentConstants: { readonly [key: string]: any } = {
  commit: /^(?:[a-h0-9]{7}\s)?(:?\(.*\)\s)?(build|breaking\schange|chore|ci|docs|feat|feature|fix|perf|refactor|revert|style|test)(\([\w\s\_\-\.]+\))?:\s?(.*)$/gim,
}
