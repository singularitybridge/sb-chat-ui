/**
 * singleFlight — ensures only ONE async operation executes for a given key
 * within a short TTL window. This collapses bursts of identical HTTP calls
 * (e.g. during React Strict-Mode double mount) while still allowing manual
 * refreshes after the window passes.
 *
 * Caller MUST construct a stable `key` that includes a hash of query params /
 * request body so `/users?page=2` and `/users?page=3` do not collide.
 */

type InFlightEntry<T = unknown> = {
  started: number;
  promise: Promise<T>;
};

const inFlight: Map<string, InFlightEntry> = new Map();

/**
 * Run an async function, ensuring there is at most one in-flight call per key
 * inside the TTL window.
 *
 * @param key  Unique identifier for this call
 *             (e.g. `GET /user?page=2` or hashed body).
 * @param fn   Function returning a Promise (the async operation).
 * @param ttl  Time-to-live window in milliseconds. Defaults to 30 000 ms.
 */
export function singleFlight<T>(
  key: string,
  fn: () => Promise<T>,
  ttl = 30_000
): Promise<T> {
  const hit = inFlight.get(key) as InFlightEntry<T> | undefined;

  // If we have a recent entry (still inside TTL), return its promise.
  if (hit && Date.now() - hit.started < ttl) {
    return hit.promise;
  }

  // Otherwise execute the function and cache its promise.
  const promise = fn()
    .finally(() => {
      // Keep the entry for the TTL duration, then evict to allow fresh fetches.
      setTimeout(() => inFlight.delete(key), ttl);
    });

  inFlight.set(key, { started: Date.now(), promise });
  return promise;
}
