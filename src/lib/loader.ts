/*
 * Loader de boot (receita 8): na primeira visita da sessão e em toda recarga
 * forçada (Ctrl+Shift+R); a recarga comum (Ctrl+R) não mostra. ~1,9 s no total.
 * O script do <head> decide antes da primeira pintura (classe html.loader-on),
 * então quem já viu na sessão nunca vê o loader piscar. Pula com reduced motion
 * e em navegador automatizado (navigator.webdriver), para os testes de tela.
 */
export const LOADER_KEY = "intro-vista";
export const LOADER_DONE = "loader:done";

/**
 * Recarga forçada? O navegador manda "Cache-Control: no-cache" (e "Pragma: no-cache")
 * só no Ctrl+Shift+R; a recarga comum manda "max-age=0". Lido no servidor (layout),
 * que marca <html data-loader="force">.
 */
export const isHardReload = (h: Headers) => /no-cache/i.test(h.get("cache-control") ?? "") || /no-cache/i.test(h.get("pragma") ?? "");

export const loaderInitScript = `(function(){try{var d=document.documentElement;if((d.dataset.loader==="force"||!sessionStorage.getItem(${JSON.stringify(
  LOADER_KEY,
)}))&&!navigator.webdriver&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("loader-on");}catch(e){}})();`;

/** O loader ainda está na tela? (usado pela entrada das páginas para esperar) */
export const loaderActive = () => typeof document !== "undefined" && document.documentElement.classList.contains("loader-on");
