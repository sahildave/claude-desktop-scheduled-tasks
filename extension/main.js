// Shows scheduled-task runs in the Code sidebar as ordinary sessions.
// The sidebar drops any session whose `scheduledTaskId` is set. This script finds the
// store that holds local Code sessions and clears that field on each run, so the app
// draws the runs with its own rows: status dots, unread, approvals, Archive menu.
// The Scheduled page lists runs through its own call, so it keeps working.
(function () {
  if (window.__schedSidebarLoaded) return;
  window.__schedSidebarLoaded = true;

  const isStore = (v) => v && typeof v === 'object' && typeof v.getState === 'function' &&
    typeof v.setState === 'function' && typeof v.subscribe === 'function';
  const isSessionStore = (s) => {
    try {
      const st = s.getState();
      return st && Array.isArray(st.sessions) && 'isInitialized' in st && 'archivedRowsPending' in st;
    } catch (e) { return false; }
  };
  const fiberOf = (el) => {
    const k = el && Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
    return k ? el[k] : null;
  };

  // The store sits in a hook's state, sometimes wrapped (useMemo's [value, deps], a ref).
  function storeIn(v, d) {
    if (!v || typeof v !== 'object' || d > 2 || v.$$typeof) return null;
    if (isStore(v)) return isSessionStore(v) ? v : null;
    if (Array.isArray(v) && v.length > 50) return null;
    for (const k of Object.keys(v).slice(0, 30)) {
      let x; try { x = v[k]; } catch (e) { continue; }
      const hit = storeIn(x, d + 1);
      if (hit) return hit;
    }
    return null;
  }

  function findStore() {
    const el = document.querySelector('[data-row-key]');
    let f = fiberOf(el);
    while (f && f.return) f = f.return;
    if (!f) return null;
    const stack = [f];
    let n = 0;
    while (stack.length && n++ < 100000) {
      const x = stack.pop();
      for (let h = x.memoizedState, i = 0; h && typeof h === 'object' && i < 80; h = h.next, i++) {
        const hit = storeIn(h.memoizedState, 0);
        if (hit) return hit;
      }
      if (x.sibling) stack.push(x.sibling);
      if (x.child) stack.push(x.child);
    }
    return null;
  }

  function strip(store) {
    const { sessions } = store.getState();
    const n = sessions.filter((s) => s && s.scheduledTaskId).length;
    if (!n) return;
    console.warn('[sched-sidebar] showing ' + n + ' scheduled runs of ' + sessions.length + ' sessions');
    store.setState({ sessions: sessions.map((s) => (s && s.scheduledTaskId ? { ...s, scheduledTaskId: undefined } : s)) });
  }

  let current = null;
  let unsubscribe = null;
  let misses = 0;
  function attach() {
    if (current && isSessionStore(current)) return;
    const store = findStore();
    if (!store) { if (++misses % 10 === 1) console.warn('[sched-sidebar] session store not found yet'); return; }
    if (store === current) return;
    console.warn('[sched-sidebar] attached to session store');
    if (unsubscribe) unsubscribe();
    current = store;
    unsubscribe = store.subscribe(() => strip(store));
    strip(store);
  }

  console.warn('[sched-sidebar] loaded');
  attach();
  setInterval(attach, 3000);
})();
