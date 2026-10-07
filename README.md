# Currículum web — Pau Alarcón

Sitio estático, sin dependencias ni proceso de compilación. Se publica tal cual.

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Todo el contenido del currículum. |
| `styles.css` | Diseño, tema claro y oscuro, y hoja de estilos de impresión. |
| `app.js` | Tema, idioma, índice activo, paleta de comandos, copiar datos y animaciones. |
| `i18n.js` | Traducciones al catalán y al inglés, y textos que genera `app.js`. |
| `og.jpg` | Imagen de 1200×630 px para WhatsApp, LinkedIn y Twitter. |
| `robots.txt`, `sitemap.xml` | Indexación en buscadores. |

## Ver el sitio en local

```
python -m http.server 8777
```

Después abre `http://127.0.0.1:8777`.

## Publicar en GitHub Pages

1. Copia el contenido de esta carpeta a la raíz del repositorio de la web.
2. Añade un archivo `CNAME` con el texto `paualarcon.com` si usas el dominio propio.
3. Activa GitHub Pages sobre la rama principal.

## Cómo actualizar el contenido

- **Datos de contacto**: aparecen en `index.html` (sección 06),
  en el bloque `application/ld+json` del `<head>` y en la lista `commands` de `app.js`.
  Cambia todos los sitios a la vez (también vale para LinkedIn y GitHub).
- **Experiencia**: cada puesto es un `<li class="tl-item">` de la sección 02. El puesto
  actual lleva además la clase `tl-now` y la tarjeta `xp-feature`.
- **Nivel de una competencia**: edita el atributo `data-level` del elemento `<li>`
  correspondiente en la sección 04. El valor va de 0 a 100; los puntos y la etiqueta
  (Avanzado, Sólido, En desarrollo) se calculan solos.
- **Foto**: `foto.webp` y `foto.jpg` (640×800 px). Si cambias la foto, sustituye los dos.
- **Nuevo proyecto**: duplica un `<li>` de la lista `.work` y actualiza el número.
- **Idiomas (ES · CA · EN)**: el selector está arriba del índice y en la barra móvil.
  El castellano se lee de `index.html`. Cada texto traducible lleva `data-i18n="clave"`
  (o `data-i18n-attr="aria-label:clave"` para atributos); la misma clave va en `ca` y `en`
  de `i18n.js`. Si cambias un texto en castellano, cambia también sus dos traducciones.
  El idioma elegido se guarda en el navegador; en la primera visita se usa el del navegador.

## Atajos de teclado

| Atajo | Acción |
| --- | --- |
| `Ctrl` + `K` o `/` | Abrir la paleta de comandos. |
| `↑` `↓` y `Enter` | Moverse por la paleta y abrir el resultado. |
| `Esc` | Cerrar la paleta. |

## Accesibilidad y rendimiento

- Contraste conforme a WCAG 2.2 AA en ambos temas.
- Navegación completa por teclado, enlace para saltar al contenido y foco siempre visible.
- Respeta `prefers-reduced-motion`: sin animaciones si el sistema las desactiva.
- Sin frameworks: solo tipografías de Google Fonts y cuatro archivos propios.
- El botón de PDF usa la impresión del navegador con una maqueta propia en A4.
