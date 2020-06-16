import { debounce, debouncer } from '../lib/Debounce.ts'

Deno.test('should debounce', () => {
  return new Promise((resolve) => {
    debounce(() => resolve(), 250)
  })
})

Deno.test('should debouncer', () => {
  return new Promise((resolve) => {
    const func = debouncer(() => resolve(), 250)
    func()
    func()
  })
})
