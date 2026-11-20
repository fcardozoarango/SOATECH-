/**
 * ============================================================================
 * GESTOR DE ALMACENAMIENTO TEMPORAL (MOCK REPOSITORY) — SOATECH DEMO
 * ============================================================================
 * Maneja el almacenamiento local temporal para la versión demostrativa.
 * Permite persistir cambios durante la sesión y ofrece un botón de
 * "Restablecer a valores de fábrica" que recupera el 100% de los datos iniciales.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOATECH_STORAGE = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    const STORAGE_KEY = 'SOATECH_DEMO_STATE_V2';
    let memoriaFallback = null;

    /**
     * Clona profundamente un objeto para evitar mutaciones directas.
     */
    function clonar(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Comprueba si LocalStorage está disponible y accesible.
     */
    function esLocalStorageDisponible() {
        try {
            const prueba = '__soatech_test__';
            localStorage.setItem(prueba, prueba);
            localStorage.removeItem(prueba);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Inicializa los datos en almacenamiento con la semilla mock.
     */
    function inicializar() {
        const semilla = window.SOATECH_MOCK_DATA;
        if (!semilla) {
            console.error('SOATECH: Datos semilla no encontrados.');
            return null;
        }

        const datosIniciales = {
            version: '1.0.0-demo',
            fechaInicializacion: new Date().toISOString(),
            consignacion: clonar(semilla.DATOS_CONSIGNACION_PROVEEDOR),
            puntosDeVenta: clonar(semilla.PUNTOS_DE_VENTA_DEMO),
            usuarios: clonar(semilla.USUARIOS_DEMO),
            operaciones: clonar(semilla.OPERACIONES_DEMO_INICIALES),
            sesionActivaId: 'usr-admin-demo' // Por defecto inicia como Admin Demo
        };

        if (esLocalStorageDisponible()) {
            const guardado = localStorage.getItem(STORAGE_KEY);
            if (!guardado) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(datosIniciales));
                return datosIniciales;
            }
            try {
                return JSON.parse(guardado);
            } catch (e) {
                console.warn('SOATECH: Datos corruptos en LocalStorage. Restableciendo de fábrica...');
                localStorage.setItem(STORAGE_KEY, JSON.stringify(datosIniciales));
                return datosIniciales;
            }
        } else {
            if (!memoriaFallback) {
                memoriaFallback = datosIniciales;
            }
            return memoriaFallback;
        }
    }

    /**
     * Obtiene el estado global actual.
     */
    function getEstadoCompleto() {
        if (esLocalStorageDisponible()) {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                try { return JSON.parse(raw); } catch (e) {}
            }
        }
        return memoriaFallback || inicializar();
    }

    /**
     * Guarda el estado global actualizado.
     */
    function guardarEstadoCompleto(nuevoEstado) {
        if (esLocalStorageDisponible()) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoEstado));
        } else {
            memoriaFallback = clonar(nuevoEstado);
        }
    }

    /**
     * Obtiene una sección específica del almacenamiento (puntosDeVenta, consignacion, etc.).
     */
    function obtener(clave) {
        const estado = getEstadoCompleto();
        return estado[clave] ? clonar(estado[clave]) : null;
    }

    /**
     * Actualiza una sección específica del almacenamiento.
     */
    function guardar(clave, valor) {
        const estado = getEstadoCompleto();
        estado[clave] = clonar(valor);
        guardarEstadoCompleto(estado);
        return estado[clave];
    }

    /**
     * Restablece el 100% de los datos demo al estado de fábrica.
     */
    function resetearDatosDeFabrica() {
        const semilla = window.SOATECH_MOCK_DATA;
        if (!semilla) return false;

        const estadoLimpio = {
            version: '1.0.0-demo',
            fechaInicializacion: new Date().toISOString(),
            consignacion: clonar(semilla.DATOS_CONSIGNACION_PROVEEDOR),
            puntosDeVenta: clonar(semilla.PUNTOS_DE_VENTA_DEMO),
            usuarios: clonar(semilla.USUARIOS_DEMO),
            operaciones: clonar(semilla.OPERACIONES_DEMO_INICIALES),
            sesionActivaId: 'usr-admin-demo'
        };

        if (esLocalStorageDisponible()) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoLimpio));
        }
        memoriaFallback = estadoLimpio;
        return true;
    }

    // Inicialización automática
    inicializar();

    return {
        obtener,
        guardar,
        resetearDatosDeFabrica,
        getEstadoCompleto,
        esLocalStorageDisponible
    };
});
