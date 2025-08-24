import { describe, it, expect } from '@jest/globals'

describe('Basic Jest Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test')
    await expect(promise).resolves.toBe('test')
  })
})