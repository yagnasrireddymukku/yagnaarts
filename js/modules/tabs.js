/**
 * Generic pill-tab switcher for every `.tabs` block (homepage "Shop by
 * Collection", PDP's Description/Specs/Care/Reviews). Markup convention:
 * each .tab-btn has data-tab="X" and there's a sibling panel with id="tab-X".
 */
export function initTabs() {
  document.querySelectorAll('.tabs').forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    const panelsContainer = tabGroup.nextElementSibling;
    if (!panelsContainer) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        panelsContainer.querySelectorAll(':scope > .tab-panel').forEach((panel) => {
          panel.classList.remove('is-active');
        });
        const target = panelsContainer.querySelector('#tab-' + btn.dataset.tab);
        target?.classList.add('is-active');
      });
    });
  });
}
