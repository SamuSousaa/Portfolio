/*
 * Sidebar encolhida: guardada no localStorage e aplicada antes da primeira
 * pintura (classe html.sb-collapsed), para a página não pular ao carregar.
 * Larguras e transições em globals.css (--sidebar-w, .sb-full, .sb-mini).
 */
export const SIDEBAR_KEY = "sidebar";
export const SIDEBAR_COLLAPSED = "sb-collapsed";

export const sidebarInitScript = `(function(){try{if(localStorage.getItem(${JSON.stringify(SIDEBAR_KEY)})==="collapsed")document.documentElement.classList.add(${JSON.stringify(
  SIDEBAR_COLLAPSED,
)});}catch(e){}})();`;
