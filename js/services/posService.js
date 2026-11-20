/**
 * ============================================================================
 * SERVICIO DE PUNTOS DE VENTA Y COMISIONES (DEMO) — SOATECH
 * ============================================================================
 * Gestiona el catálogo de los 20–25 puntos de venta, sus estados (activo/inactivo)
 * y el cálculo de comisiones dinámicas por rangos para cada establecimiento.
 * 
 * Reglas de negocio:
 * 1. Las tarifas oficiales del SOAT son inmutables y nunca se alteran.
 * 2. Cada punto de venta posee su propia configuración de comisiones.
 * 3. Las comisiones no pueden ser negativas ni contener rangos superpuestos.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOATECH_POS = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    const storage = window.SOATECH_STORAGE;

    /**
     * Valida que una lista de rangos de comisión sea consistente:
     * - No permite valores negativos.
     * - No permite que 'desde' sea mayor o igual que 'hasta'.
     * - No permite rangos superpuestos.
     * 
     * @param {Array} rangos 
     * @returns {{ valido: boolean, error: string|null }}
     */
    function validarRangosComision(rangos) {
        if (!Array.isArray(rangos) || rangos.length === 0) {
            return { valido: false, error: 'Debe especificar al menos un rango de comisión.' };
        }

        // Ordenar por 'desde' para validar superposiciones
        const ordenados = [...rangos].sort((a, b) => (a.desde || 0) - (b.desde || 0));

        for (let i = 0; i < ordenados.length; i++) {
            const r = ordenados[i];

            if (r.comision == null || isNaN(r.comision) || Number(r.comision) < 0) {
                return { valido: false, error: `La comisión del rango ${i + 1} no puede ser negativa ni vacía.` };
            }

            if (r.desde == null || isNaN(r.desde) || Number(r.desde) < 0) {
                return { valido: false, error: `El valor inicial 'desde' del rango ${i + 1} debe ser mayor o igual a 0.` };
            }

            if (r.hasta !== null && (isNaN(r.hasta) || Number(r.hasta) <= Number(r.desde))) {
                return { valido: false, error: `En el rango ${i + 1}, el valor 'hasta' debe ser mayor que 'desde'.` };
            }

            // Comprobar superposición con el rango anterior
            if (i > 0) {
                const anterior = ordenados[i - 1];
                if (anterior.hasta === null) {
                    return { valido: false, error: `El rango anterior cubre hasta el infinito; no puede haber rangos posteriores superpuestos.` };
                }
                if (Number(r.desde) <= Number(anterior.hasta)) {
                    return { valido: false, error: `Superposición detectada entre el rango ${i} y el rango ${i + 1}.` };
                }
            }
        }

        return { valido: true, error: null };
    }

    /**
     * Obtiene el listado completo de puntos de venta.
     */
    async function getPuntosVenta() {
        return storage.obtener('puntosDeVenta') || [];
    }

    /**
     * Obtiene los datos de un punto de venta por su ID.
     */
    async function getPuntoVentaPorId(posId) {
        const puntos = storage.obtener('puntosDeVenta') || [];
        return puntos.find(p => p.id === posId) || null;
    }

    /**
     * Alterna el estado activo/inactivo de un punto de venta.
     */
    async function toggleEstadoPuntoVenta(posId) {
        const puntos = storage.obtener('puntosDeVenta') || [];
        const pos = puntos.find(p => p.id === posId);
        if (!pos) throw new Error(`Punto de venta ${posId} no encontrado.`);

        pos.estado = pos.estado === 'activo' ? 'inactivo' : 'activo';
        storage.guardar('puntosDeVenta', puntos);
        return pos;
    }

    /**
     * Actualiza la estructura de comisiones por rangos de un punto de venta con validación.
     */
    async function actualizarComisionesPuntoVenta(posId, nuevosRangos) {
        const validacion = validarRangosComision(nuevosRangos);
        if (!validacion.valido) {
            throw new Error(validacion.error);
        }

        const puntos = storage.obtener('puntosDeVenta') || [];
        const pos = puntos.find(p => p.id === posId);
        if (!pos) throw new Error(`Punto de venta ${posId} no encontrado.`);

        pos.comisiones = nuevosRangos;
        storage.guardar('puntosDeVenta', puntos);
        return pos;
    }

    /**
     * Calcula la comisión que le corresponde a un punto de venta según el valor oficial a consignar.
     * Retorna { comision, esPrecioFijoMoto, precioFijoCobro, reglaAplicada, posNombre }.
     * 
     * @param {string|object} posIdOData ID o datos del punto de venta
     * @param {number} valorSoatBase Tarifa oficial legal a consignar
     * @param {number} codigoTarifa Código de la tarifa (ej: 110, 120, 521)
     */
    async function calcularComision(posIdOData, valorSoatBase, codigoTarifa) {
        let pos = null;
        if (typeof posIdOData === 'string') {
            pos = await getPuntoVentaPorId(posIdOData);
        } else if (posIdOData && typeof posIdOData === 'object') {
            pos = posIdOData;
        }

        // Esquema por defecto si no se especifica punto de venta
        const rangos = (pos && Array.isArray(pos.comisiones) && pos.comisiones.length > 0)
            ? pos.comisiones
            : [
                { desde: 0, hasta: 999999, comision: 25000, etiqueta: 'Estándar (< $1.000.000)' },
                { desde: 1000000, hasta: null, comision: 30000, etiqueta: 'Estándar (≥ $1.000.000)' }
            ];

        const precioFijoCobro = pos?.motosFijoCobro || 390000;

        // Regla oficial/comercial para motos hasta 200 c.c. (Códigos 110 y 120): Cobro plano $390.000
        if (codigoTarifa === 110 || codigoTarifa === 120) {
            const comisionFija = Math.max(0, precioFijoCobro - valorSoatBase);
            return {
                comision: comisionFija,
                esPrecioFijoMoto: true,
                precioFijoCobro: precioFijoCobro,
                reglaAplicada: `Tarifa plana de cobro para motos hasta 200 c.c. ($${precioFijoCobro.toLocaleString('es-CO')})`,
                posNombre: pos ? pos.nombre : 'Punto por defecto'
            };
        }

        // Búsqueda del rango correspondiente según el valor oficial base
        let reglaEncontrada = rangos.find(r => {
            const cumpleMinimo = r.desde == null || valorSoatBase >= r.desde;
            const cumpleMaximo = r.hasta == null || valorSoatBase <= r.hasta;
            return cumpleMinimo && cumpleMaximo;
        });

        if (!reglaEncontrada) {
            // Si el valor supera todos los topes definidos, aplica el último rango configurado
            reglaEncontrada = rangos[rangos.length - 1];
        }

        const comisionMonto = reglaEncontrada ? Number(reglaEncontrada.comision) : 25000;
        const etiquetaRegla = reglaEncontrada?.etiqueta || `Rango $${reglaEncontrada?.desde?.toLocaleString('es-CO') || 0} - ${reglaEncontrada?.hasta ? '$' + reglaEncontrada.hasta.toLocaleString('es-CO') : 'en adelante'}`;

        return {
            comision: comisionMonto,
            esPrecioFijoMoto: false,
            precioFijoCobro: null,
            reglaAplicada: `${etiquetaRegla} (+${comisionMonto.toLocaleString('es-CO')})`,
            posNombre: pos ? pos.nombre : 'Punto por defecto'
        };
    }

    return {
        validarRangosComision,
        getPuntosVenta,
        getPuntoVentaPorId,
        toggleEstadoPuntoVenta,
        actualizarComisionesPuntoVenta,
        calcularComision
    };
});
