// Runs in <head> before the first paint, so a saved Light or Dark choice never
// flashes the other theme. System is the absence of a choice: no data-theme
// attribute, and tokens.css follows the device setting.
export const THEME_STORAGE_KEY = "ff-theme";

export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
