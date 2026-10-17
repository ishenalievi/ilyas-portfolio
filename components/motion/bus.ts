// The hand-off between the page transitions and everything else that moves.
// Transitions come first: page motion waits until the overlay is gone.

// Every full page load starts with the menacing intro, so we begin "covered".
let covering = true;
const waiting = new Set<() => void>();
const watchers = new Set<(covering: boolean) => void>();

/** Called by the TransitionProvider when the overlay goes up or comes down. */
export function setCovering(v: boolean) {
  covering = v;
  watchers.forEach((cb) => cb(v));
  if (!v) {
    const list = [...waiting];
    waiting.clear();
    list.forEach((cb) => cb());
  }
}

export const isCovering = () => covering;

/** Hear about every cover/reveal. Returns an unsubscribe function. */
export function watchCovering(cb: (covering: boolean) => void) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}

/** Runs cb once no transition is on screen. Returns a cancel function. */
export function afterReveal(cb: () => void, fallbackMs = 8000) {
  if (!covering) {
    cb();
    return () => {};
  }
  let done = false;
  const once = () => {
    if (done) return;
    done = true;
    clearTimeout(t);
    waiting.delete(once);
    cb();
  };
  // never leave the page waiting if a transition fails to report back
  const t = setTimeout(once, fallbackMs);
  waiting.add(once);
  return () => {
    done = true;
    clearTimeout(t);
    waiting.delete(once);
  };
}
