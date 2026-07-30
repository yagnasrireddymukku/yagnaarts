export function initPreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;

  const hide = () => el.classList.add('is-hidden');

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }
}
