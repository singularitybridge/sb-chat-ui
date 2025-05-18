/**
 * singleFlight — ensures only ONE async operation executes for a given key.
 * Any concurrent callers with the same key will await the first promise.
 * Once the promise resolves or rejects, the key is cleared, so the next call
 * will trigger a fresh execution.
 */
const inFlight: Map<string, Promise<any>> = new Map();

/**
 * Run an async function, ensuring there is at most one in-flight call per key.
 * @param key   Unique identifier for this call (e.g. 'GET /user', 'POST /session')
 * @param fn    Function returning a Promise (the actual async operation)
 */
export function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // If there's already a promise for this key, return it.
  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  // Otherwise execute and store.
  const p = fn()
    .catch((err) => {
      // On error, purge the key so retries are possible.
      inFlight.delete(key);
      throw err;
    })
    .then((res) => {
      // Success: also purge key (we don't want stale cache for ever)
      inFlight.delete(key);
      return res;
    });

  inFlight.set(key, p);
  return p;
}
