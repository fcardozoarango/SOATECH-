/**
 * ============================================================================
 * SERVICIO DE DATOS DE CONSIGNACIÓN DEL PROVEEDOR (DEMO) — SOATECH
 * ============================================================================
 * Centraliza la información bancaria y cuentas del proveedor para que todos
 * los puntos de venta consulten la misma configuración oficial.
 *
 * Permite que el Administrador edite o active/desactive cuentas bancarias
 * y que los puntos de venta consulten y copien la información al instante.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOATECH_CONSIGNACION = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    const storage = window.SOATECH_STORAGE;

    /**
     * Obtiene la configuración centralizada de consignación.
     */
    async function getDatosConsignacion() {
        return storage.obtener('consignacion') || {};
    }

    /**
     * Actualiza la información completa de consignación (Solo Administrador).
     */
    async function actualizarDatosConsignacion(nuevosDatos) {
        if (!nuevosDatos.titular || !nuevosDatos.titular.nombre) {
            throw new Error('El nombre del titular es obligatorio.');
        }
        storage.guardar('consignacion', nuevosDatos);
        return nuevosDatos;
    }

    /**
     * Actualiza o activa/desactiva un medio de pago individual.
     */
    async function actualizarCuenta(cuentaId, camposActualizados) {
        const consignacion = await getDatosConsignacion();
        const cuentas = consignacion.cuentas || [];
        const index = cuentas.findIndex((c) => c.id === cuentaId);

        if (index === -1) {
            throw new Error(`Cuenta ${cuentaId} no encontrada.`);
        }

        cuentas[index] = { ...cuentas[index], ...camposActualizados };
        consignacion.cuentas = cuentas;
        storage.guardar('consignacion', consignacion);
        return cuentas[index];
    }

    return {
        getDatosConsignacion,
        actualizarDatosConsignacion,
        actualizarCuenta
    };
});
