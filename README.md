# Isla de Walesa · v30

Juego HTML5 para celular y computadora. La versión v30 se ejecuta desde `index.html`; sus sprites originales y las máscaras de coloreado ya están integrados en el HTML.

## GitHub Pages

1. En **Settings → General → Danger Zone**, selecciona **Change repository visibility → Public** si usas GitHub Free.
2. En **Settings → Pages**, cambia **Build and deployment → Source** a **GitHub Actions**.
3. El flujo `.github/workflows/pages.yml` publica automáticamente al actualizar `main`.

Enlace previsto: **https://creoqisaac-cloud.github.io/Mundo-pequeno/**

## Guardado y migración

La partida usa la clave `walesa-ds-v1`. Al cambiar de dominio, el almacenamiento local de Netlify no se transfiere automáticamente. En el sitio anterior, entra a **Partida → Guardar archivo de respaldo**; en GitHub Pages, entra a **Partida → Abrir archivo de respaldo**.

## Archivos

- `index.html`: juego v30 completo (incluye recursos gráficos Procreate como datos integrados).
- `manifest.webmanifest`: instalación como aplicación web.
- `sw.js`: caché offline de la v30.
- `icon.svg`: icono adaptable.
- `.github/workflows/pages.yml`: publicación automática en GitHub Pages.

La versión de código fuente y recursos originales, incluidos los iconos PNG, se conserva por separado en el ZIP de proyecto del chat. Al migrar el ZIP completo al repositorio se pueden restaurar dichos iconos sin modificar la partida.
