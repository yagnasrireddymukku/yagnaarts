/**
 * Dark/light theme toggle with persistence. The initial theme (avoiding a
 * flash of the wrong theme) is restored by a small inline script in each
 * page's <head>, before this module even loads — this only handles the
 * user clicking the toggle afterward.
 */

const STORAGE_KEY = 'ya-theme';

function isDark() {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit) return explicit === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const icon = btn.querySelector('i');
    if (icon) icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  });
}

export function initTheme() {
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTheme(isDark() ? 'light' : 'dark');
    });
  });
  // Sync icon state on load in case a stored preference was already applied
  // by the inline head script.
  setTheme(isDark() ? 'dark' : 'light');
}
