import type { IMutex } from '@/application/ports/IMutex';

/**
 * Adapter — InMemoryMutex
 *
 * Per-key promise-chain mutex. Each key has its own queue: the next
 * acquirer awaits the previous acquirer's release. Single-process only;
 * a real deployment would back this with Redis / Postgres advisory locks.
 */
export class InMemoryMutex implements IMutex {
  private readonly chains = new Map<string, Promise<unknown>>();

  async runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.chains.get(key) ?? Promise.resolve();
    const result = previous.then(fn, fn);
    const tail = result.catch(() => undefined);
    this.chains.set(key, tail);
    try {
      return await result;
    } finally {
      // Drop the entry only if no one else queued behind us, so the map
      // doesn't leak one slot per product touched.
      if (this.chains.get(key) === tail) {
        this.chains.delete(key);
      }
    }
  }
}
