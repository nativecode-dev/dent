type ThrottleCallback = (...args: any[]) => any | Promise<any>

interface GlobalContext {
  [key: string]: ThrottleContext
}

interface ThrottleContext {
  callback: ThrottleCallback
  name: string
}

const QUEUE: GlobalContext = {
  global: {
    callback: () => {},
    name: 'global',
  },
}

export function throttle(callbacks: ThrottleCallback[], max: number = 2, context: ThrottleContext = QUEUE.global) {}
