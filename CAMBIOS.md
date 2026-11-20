# Historial de cambios

## 2026-11-20 — Reparación y mejoras de la demo

### Correcciones
- **La app no cargaba:** `js/app.js` tenía un merge mal resuelto con casi todas las líneas
  duplicadas (versión vieja + nueva mezcladas), lo que daba un error de sintaxis. Se dejó solo la
  versión nueva (placa, estados, corregir y reenviar, tutorial).
- **`INDEX.html` → `index.html`:** con mayúsculas no abre en hosting Linux (GitHub Pages, Netlify, Vercel).
- **Historial de la operación mostraba "undefined":** la pantalla leía `accion`/`usuario` y los datos
  usan `estado`/`autor`.
- **Al confirmar un pago** se guardaba el nombre del administrador como nota; ahora se usa el mensaje estándar.
- **Tabla de monitoreo (admin) desalineada:** faltaba la columna «Total Cobrado» y la placa ocupaba otra columna.
  Ahora la placa va junto al vehículo, también en «Mis Operaciones».
- **Seguridad (XSS):** el texto escrito por usuarios (placa, referencia, motivo, cuentas) se insertaba sin
  escapar. Se agregó `escaparHtml()` en todos esos puntos.

### Mejoras
- Las ventanas `alert()`/`confirm()` del navegador se reemplazaron por **notificaciones** con el estilo de la
  plataforma (éxito, aviso, error) y un **diálogo de confirmación** propio (Esc o clic afuera cancela).
- Las validaciones de formularios marcan en rojo el campo que falta y le dan el foco.
- **Celular:** el encabezado ya no se sale de la pantalla; las pestañas se desplazan horizontalmente.
- Foco visible al navegar con teclado y color de selección acorde a la marca.
- Se eliminaron copias viejas (`backup_original/`, `js/app underscorecopy.js`); siguen en el historial de Git.
- Código formateado con Prettier y configuración de ESLint para detectar errores como el del merge.
- Archivos `Abrir SOATECH.bat` y `Actualizar SOATECH.bat` para usar la demo sin terminal.
- `AGENTS.md` / `GEMINI.md` con las reglas del proyecto para Antigravity y otros agentes.

### Pendiente / ideas siguientes
- Confirmar con negocio: el redondeo a $1.000 se suma a la comisión, y la moto ≤200 c.c. con cobro plano
  ($390.000) ignora la comisión personalizada del punto.
- Centralizar nombres y teléfonos de contacto en un archivo de configuración (hoy están en `index.html` y JS).
- Para producción: backend real, inicio de sesión y carga de imagen del comprobante.
