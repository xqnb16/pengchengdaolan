/* A WebView reload can discard the browser's scroll position. Keep a brief,
   tab-local checkpoint without restoring it on fresh links or detail views. */
(() => {
  if (!document.documentElement.classList.contains('wechat-mobile')) return;

  const key = 'pengcheng-reading-position';
  const page = () => location.pathname + location.search + location.hash;
  const inDetail = () => location.hash.startsWith('#site-');
  let storage;
  let saved;
  try {
    storage = sessionStorage;
    saved = JSON.parse(storage.getItem(key));
  } catch {
    return;
  }

  let lastWrite = -Infinity;
  function save() {
    if (inDetail()) return;
    lastWrite = performance.now();
    try {
      storage.setItem(key, JSON.stringify({ page: page(), y: Math.max(0, scrollY), time: Date.now() }));
    } catch {}
  }

  const navigation = performance.getEntriesByType('navigation')[0];
  const reloaded = navigation ? navigation.type === 'reload' : performance.navigation?.type === 1;
  if (reloaded && !inDetail() && saved?.page === page() &&
      Number.isFinite(saved.y) && saved.y > 64 && Date.now() - saved.time < 5 * 60 * 1000) {
    // Let the browser restore its own scroll position first.
    requestAnimationFrame(() => {
      if (scrollY <= 8 && page() === saved.page) scrollTo(0, saved.y);
    });
  }

  addEventListener('scroll', () => {
    if (performance.now() - lastWrite >= 160) save();
  }, { passive: true });
  addEventListener('pagehide', save);
})();
