# Guía para agentes de IA (Antigravity, Gemini, Claude, etc.)

Este archivo explica cómo está hecho SOATECH y qué reglas seguir al modificarlo.
Léelo completo antes de tocar código.

## Qué es

Demo comercial de una plataforma de **liquidación y gestión de SOAT 2026 (Colombia)**:
- **Administrador / proveedor** (Héctor Vargas): ve los 20 puntos de venta, edita comisiones,
  edita las cuentas bancarias y aprueba o rechaza operaciones.
- **Punto de venta (POS)**: cotiza con la calculadora, registra ventas con comprobante,
  consulta cuentas y comisiones, y corrige operaciones rechazadas.

Es **solo frontend**: HTML + CSS + JavaScript puro, sin frameworks, sin build y sin servidor.
Los datos viven en `localStorage` (clave `SOATECH_DEMO_STATE_V2`) y se pueden restablecer
con el botón «Restablecer Demo».

## Cómo se ejecuta

- Doble clic en `Abrir SOATECH.bat`, o abrir `index.html` en el navegador.
- Para actualizar desde GitHub: `Actualizar SOATECH.bat`.
- No requiere `npm install`. Node solo hace falta para las herramientas opcionales de calidad.

## Estructura

```
index.html                      Todas las vistas (se muestran/ocultan por JS)
css/styles.css                  Tokens de diseño (claro/oscuro), layout y calculadora
css/admin.css                   Pestañas, tablas, formularios y modales
css/pos.css                     Vistas del punto de venta, soporte y WhatsApp
css/feedback.css                Notificaciones (toasts), diálogo de confirmación y ajustes móviles
css/theme.css                   TEMA VISUAL ACTUAL (se carga último): tokens, dock, barra superior,
                                tarjetas, animaciones y modo oscuro. Los estilos nuevos van aquí.
js/tarifas.js                   Tarifario oficial 2026  (window.SOAT_TARIFAS)
js/calculadora.js               Motor de liquidación    (window.SOAT_CALCULADORA)
js/data/mockData.js             Datos demo iniciales: 20 POS, cuentas, operaciones
js/services/mockStorage.js      Lectura/escritura en localStorage (window.SOATECH_STORAGE)
js/services/authService.js      Perfiles demo           (window.SOATECH_AUTH)
js/services/posService.js       Puntos de venta         (window.SOATECH_POS)
js/services/consignacionService.js  Cuentas del proveedor (window.SOATECH_CONSIGNACION)
js/services/operacionesService.js   Ciclo de operaciones (window.SOATECH_OPERACIONES)
js/app.js                       Orquestador de la UI: vistas, eventos, modales
```

El orden de los `<script>` en `index.html` importa: datos → servicios → tarifas → calculadora → app.

## Reglas obligatorias

1. **No modificar `js/tarifas.js` ni `js/calculadora.js`** salvo que el cambio sea sobre la tarifa
   oficial o las reglas de liquidación. La tarifa oficial nunca cambia por comisiones.
2. **Nunca usar `alert()` ni `confirm()`.** Usar las funciones de `js/app.js`:
   - `notificar(mensaje, { tipo: 'exito' | 'error' | 'aviso' | 'info', titulo, duracion })`
   - `avisarCampo(idCampo, mensaje)` para validaciones (marca el campo y le da foco)
   - `await confirmar({ titulo, mensaje, textoConfirmar, peligro })` → devuelve `true`/`false`
3. **Escapar todo texto que escriba un usuario** antes de insertarlo con `innerHTML`:
   `${escaparHtml(valor)}`. Aplica a placas, referencias, motivos, nombres, cuentas, etc.
4. **Usar los tokens CSS** definidos en `css/theme.css`. No inventar colores fijos; así el modo oscuro
   sigue funcionando. Tokens principales:
   - Superficies: `--paper` (fondo), `--paper-raised` (tarjeta blanca), `--stone` y `--clay` (tarjetas grises),
     `--ink` (tarjeta/botón negro) con su texto `--on-ink`. En modo oscuro `--ink` se invierte a claro.
   - Texto: `--text-primary`, `--text-secondary`, `--text-muted`.
   - Estados: `--success-*`, `--warning-*`, `--error-*`. Acento menta para deltas sobre negro: `--mint`.
   - Forma y movimiento: `--radius-lg` (22 px, tarjetas), `999px` para píldoras, `--ease-out`.
5. **Estilo visual "papel y tinta"** (inspirado en dashboards monocromáticos tipo Corbel):
   - Monocromático: el color solo comunica estado (**verde** confirmado/ganancia, **ámbar** pendiente,
     **rojo** rechazado). Nada de degradados ni bordes de color a la izquierda.
   - Tarjetas sin borde, radio 22 px; botones en píldora (`btn-primary-action` negro,
     `btn-action-sm` claro con anillo interior).
   - **Sin emojis.** Los iconos salen del sprite SVG al inicio de `index.html`
     (`<svg class="ico"><use href="#i-nombre" /></svg>`, o `ico('nombre')` en JS). Para un icono nuevo,
     agrega un `<symbol>` al sprite con trazo 1.8 y `stroke="currentColor"`.
   - Navegación: pestañas en `construirMenuNavegacion()` (barra superior con indicador deslizante) y
     herramientas en el dock lateral (`.dock__btn` con `.dock__tip`). Títulos de cada vista en `VISTAS_INFO`.
   - Animaciones: las vistas entran con la clase `view-enter` (sube y se desenfoca suave, escalonado).
     Respetar `prefers-reduced-motion` (ya está cubierto en `theme.css`).
6. Todo el texto visible va en **español** de Colombia.
7. Los datos del historial de una operación usan los campos `fecha`, `estado`, `autor`, `nota`.
8. Mantener la app usable en celular (probar a 375 px de ancho, sin scroll horizontal).

## Antes de terminar un cambio

```bash
npx prettier@3.3.3 --write "js/**/*.js" "css/*.css" index.html   # formato
npx eslint@9 js                                                   # errores (debe dar 0 errores)
```

Luego abrir la demo y probar el flujo completo:
1. Perfil **Punto de Venta 01** → calculadora → Particular → Vehículo familiar → 1600 c.c. → año 2018.
2. «Registrar Operación Demo» → placa, banco y referencia → «Enviar para Revisión».
3. Perfil **Administrador** → Monitoreo de Operaciones → «Ver Detalle» → Rechazar con motivo.
4. Perfil **Punto de Venta 01** → Mis Operaciones → «Corregir y Reenviar».
5. Perfil **Administrador** → Confirmar pago. Revisar que el historial se vea completo.
6. Abrir la consola del navegador (F12): no debe haber errores en rojo.

## Errores que ya pasaron (no repetir)

- Un merge mal resuelto dejó `js/app.js` con todas las líneas duplicadas y la app dejó de cargar.
  Al resolver conflictos, quedarse con **una sola** versión y correr `npx eslint@9 js` antes de hacer commit.
- `INDEX.html` en mayúsculas no abre en hosting Linux (GitHub Pages, Netlify). El archivo debe llamarse `index.html`.
