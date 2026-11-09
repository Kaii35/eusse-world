const THEME_STORAGE_KEY = 'eusse-theme'

/**
 * Aplica el tema ANTES del primer pintado. Sin esto, quien usa modo oscuro ve un
 * destello del tema claro en cada carga: `ThemeProvider` sólo actúa tras hidratar.
 *
 * Es el único script en línea de la app: no hay forma de leer `localStorage` antes de
 * pintar desde el servidor. Su contenido es estático (sin datos de usuario), así que no
 * abre ninguna vía de inyección. La clave debe coincidir con la de `ThemeProvider`.
 */
const script = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light'}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
