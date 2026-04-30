/**
 * Port Interface — IMutex
 *
 * Provides per-key serialization for critical sections that must run
 * atomically (e.g. read-modify-write of a product's stock).
 *
 * The infrastructure implementation decides the strategy: in-memory
 * mutex queue, Redis lock, database row lock, etc.
 */
export interface IMutex {
  /**
   * Runs `fn` with exclusive access to the resource identified by `key`.
   * Concurrent callers with the same key are serialized; different keys
   * proceed in parallel.
   */
  runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T>;
}
