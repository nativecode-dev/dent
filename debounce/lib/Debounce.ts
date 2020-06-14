type DebounceCallback = (...args: any[]) => any | Promise<any>

const context: { timeout: number | null } = { timeout: null }

export function debounce(callback: DebounceCallback, throttle: number = 1000) {
  if (context.timeout) {
    clearTimeout(context.timeout)
  }

  context.timeout = setTimeout(callback, throttle)
}
