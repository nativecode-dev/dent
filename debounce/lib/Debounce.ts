interface GlobalContext {
  [key: string]: DebounceContext
}

interface DebounceContext {
  name: string
  timer: number | null
}

const CTX: GlobalContext = {
  global: { name: 'global', timer: null },
}

export type DebounceCallback = (...args: any[]) => any | Promise<any>

export function debounce(callback: DebounceCallback, throttle: number = 1000, context: DebounceContext = CTX.global) {
  if (context.timer) {
    clearTimeout(context.timer)
  }

  context.timer = setTimeout(() => callback(), throttle)
}

export function debouncer(callback: DebounceCallback, throttle: number = 1000) {
  const context: DebounceContext = {
    name: callback.name,
    timer: null,
  }

  return (...args: any[]): any => debounce((...args: any[]) => callback(...args), throttle, context)
}
