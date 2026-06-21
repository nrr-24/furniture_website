'use client';

import { useEffect } from 'react';

/**
 * Scroll-triggered reveal for elements tagged `.sw-reveal` / `.sw-reveal-x`.
 *
 * Adds `reveal-ready` to the page's scroll container (`main.app-content`) so the
 * hidden initial state kicks in only once JS is running, then reveals each
 * tagged element once as it scrolls into view. Mirrors the behaviour wired into
 * the homepage so projects / craftsmanship / contact share one implementation.
 *
 * Pass a `ready` flag (e.g. a data-loaded boolean) so the observer re-attaches
 * after async content renders; defaults to true for static pages.
 */
export function useScrollReveal(ready: boolean = true) {
  useEffect(() => {
    if (!ready) return;
    const container = document.querySelector('main.app-content');
    if (!container) return;

    const els = container.querySelectorAll('.sw-reveal, .sw-reveal-x');
    if (els.length === 0) return;

    // No IntersectionObserver → just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }

    container.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target); // reveal once
          }
        }),
      { root: container, threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);
}
