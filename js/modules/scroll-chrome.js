/**
 * Scroll progress bar + back-to-top button, shared across every page
 * (markup lives in header.html / footer.html).
 */
export function initScrollChrome() {
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';

    if (backToTop) {
      const shouldShow = scrollTop > 400;
      backToTop.hidden = !shouldShow;
      if (shouldShow) requestAnimationFrame(() => backToTop.classList.add('is-visible'));
      else backToTop.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}
