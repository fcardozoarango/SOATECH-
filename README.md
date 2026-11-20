# SOATECH — Demo de gestión y liquidación SOAT 2026

Plataforma demo para proveedores de SOAT y sus puntos de venta: calculadora con el tarifario
oficial 2026, comisiones por punto, cuentas para consignar y revisión de comprobantes.

## Abrir la demo (sin instalar nada)

1. Doble clic en **`Abrir SOATECH.bat`**.
2. Se abre en tu navegador. Usa «⇄ Cambiar Perfil» para pasar de Administrador a Punto de Venta.
3. «Restablecer Demo» devuelve todo a los datos iniciales.

## Actualizar a la última versión

Doble clic en **`Actualizar SOATECH.bat`**. Descarga los cambios de GitHub y abre la demo.
Necesita [Git para Windows](https://git-scm.com/download/win) instalado.

## Para quien programa

- Proyecto en HTML, CSS y JavaScript puro, sin build.
- Reglas y estructura del código: [AGENTS.md](AGENTS.md) (también lo usan Antigravity y otros agentes de IA).
- Historial de cambios: [CAMBIOS.md](CAMBIOS.md).
- Calidad (opcional, requiere Node.js):
  ```bash
  npx prettier@3.3.3 --write "js/**/*.js" "css/*.css" index.html
  npx eslint@9 js
  ```
