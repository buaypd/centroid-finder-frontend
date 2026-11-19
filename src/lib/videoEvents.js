// A tiny event so the library can reload after a video is uploaded from the
// nav bar, without the two components having to share state.

const EVENT = 'centroid:videos-changed';

export function notifyVideosChanged() {
  window.dispatchEvent(new Event(EVENT));
}

// Subscribes to changes; returns the function that unsubscribes.
export function onVideosChanged(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
