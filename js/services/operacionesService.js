/**
 * ============================================================================
 * SERVICIO DE REGISTRO Y MONITOREO DE OPERACIONES (DEMO) — SOATECH
 * ============================================================================
 * Gestiona el ciclo de vida completo de las operaciones de emisión de SOAT:
 * 1. Envío con comprobante de pago por el Punto de Venta (Estado: Pendiente de revisión)
 * 2. Auditoría y verificación por el Proveedor Héctor Vargas
 * 3. Confirmación (Estado: Confirmada) o Rechazo con motivo (Estado: Rechazada)
 * 4. Corrección y reenvío de comprobantes rechazados
 * 5. Trazabilidad completa e historial de auditoría de cada operación
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOATECH_OPERACIONES = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    const storage = window.SOATECH_STORAGE;

    /**
     * Obtiene el listado de operaciones con soporte de filtros avanzados.
     * @param {object} filtros { posId, estado, terminoBusqueda }
     */
    async function getOperaciones(filtros = {}) {
        let ops = storage.obtener('operaciones') || [];

        // Filtro estricto por punto de venta (para aislamiento del POS o filtro del Admin)
        if (filtros.posId) {
            ops = ops.filter((o) => o.posId === filtros.posId);
        }

        // Filtro por estado: 'Pendiente de revisión', 'Confirmada', 'Rechazada'
        if (filtros.estado && filtros.estado !== 'todos' && filtros.estado !== '') {
            ops = ops.filter((o) => o.estado && o.estado.toLowerCase() === filtros.estado.toLowerCase());
        }

        // Filtro por término de búsqueda (ID, placa, nombre POS, descripción vehículo, código)
        if (filtros.terminoBusqueda) {
            const term = filtros.terminoBusqueda.toLowerCase().trim();
            ops = ops.filter(
                (o) =>
                    (o.id && o.id.toLowerCase().includes(term)) ||
                    (o.posNombre && o.posNombre.toLowerCase().includes(term)) ||
                    (o.vehiculoDescripcion && o.vehiculoDescripcion.toLowerCase().includes(term)) ||
                    (o.placa && o.placa.toLowerCase().includes(term)) ||
                    (o.referenciaAprobacion && o.referenciaAprobacion.toLowerCase().includes(term)) ||
                    String(o.codigoTarifa).includes(term)
            );
        }

        // Ordenar por fecha descendente (más recientes primero)
        return ops.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    /**
     * Obtiene una operación específica por su ID.
     */
    async function getOperacionPorId(id) {
        const ops = storage.obtener('operaciones') || [];
        return ops.find((o) => o.id === id) || null;
    }

    /**
     * Registra una nueva operación con soporte de comprobante de pago.
     * La operación nace en estado "Pendiente de revisión" para que Héctor la audite.
     */
    async function registrarOperacionDemo(datosLiquidacion, posInfo, datosPago = {}) {
        if (!datosLiquidacion || !posInfo) {
            throw new Error('Datos de liquidación o de punto de venta incompletos.');
        }

        const ops = storage.obtener('operaciones') || [];
        const nuevoNumero = 1000 + ops.length + 1;
        const nuevoId = 'OP-DEMO-' + nuevoNumero;
        const ahora = new Date().toISOString();

        const nuevaOp = {
            id: nuevoId,
            posId: posInfo.id,
            posNombre: posInfo.nombre,
            fecha: ahora,
            codigoTarifa: datosLiquidacion.codigo,
            vehiculoDescripcion: datosLiquidacion.descripcion,
            servicio: datosLiquidacion.servicioNombre || 'Particular',
            placa: (datosPago.placa || 'DEMO-' + Math.floor(100 + Math.random() * 900)).toUpperCase(),
            valorConsignar: datosLiquidacion.precioConsignar,
            comision: datosLiquidacion.ganancia,
            valorCobrar: datosLiquidacion.precioCobrar,
            estado: 'Pendiente de revisión',
            bancoOrigen: datosPago.bancoOrigen || 'Bancolombia',
            referenciaAprobacion:
                datosPago.referenciaAprobacion || 'REF-' + Math.floor(100000 + Math.random() * 900000),
            comprobanteUrl: datosPago.comprobanteUrl || 'comprobante-demo.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: ahora,
                    estado: 'Pendiente de revisión',
                    autor: posInfo.nombre,
                    nota: `Operación registrada y comprobante de pago (${datosPago.bancoOrigen || 'Bancolombia'}) enviado para revisión de Héctor Vargas.`
                }
            ]
        };

        ops.unshift(nuevaOp);
        storage.guardar('operaciones', ops);
        return nuevaOp;
    }

    /**
     * Héctor confirma y aprueba la operación tras verificar el comprobante de pago.
     */
    async function confirmarOperacion(id, notas = '') {
        const ops = storage.obtener('operaciones') || [];
        const index = ops.findIndex((o) => o.id === id);

        if (index === -1) {
            throw new Error(`Operación ${id} no encontrada.`);
        }

        const ahora = new Date().toISOString();
        ops[index].estado = 'Confirmada';
        ops[index].motivoRechazo = null;
        ops[index].fechaConfirmacion = ahora;

        if (!ops[index].historial) ops[index].historial = [];
        ops[index].historial.push({
            fecha: ahora,
            estado: 'Confirmada',
            autor: 'Héctor Vargas (Proveedor)',
            nota: notas || 'Comprobante y transferencia verificados con éxito. Emisión de SOAT aprobada.'
        });

        storage.guardar('operaciones', ops);
        return ops[index];
    }

    /**
     * Héctor rechaza la operación especificando el motivo exacto para que el POS pueda corregir.
     */
    async function rechazarOperacion(id, motivo) {
        if (!motivo || !motivo.trim()) {
            throw new Error('Debe proporcionar un motivo de rechazo claro para el punto de venta.');
        }

        const ops = storage.obtener('operaciones') || [];
        const index = ops.findIndex((o) => o.id === id);

        if (index === -1) {
            throw new Error(`Operación ${id} no encontrada.`);
        }

        const ahora = new Date().toISOString();
        ops[index].estado = 'Rechazada';
        ops[index].motivoRechazo = motivo.trim();
        ops[index].fechaRechazo = ahora;

        if (!ops[index].historial) ops[index].historial = [];
        ops[index].historial.push({
            fecha: ahora,
            estado: 'Rechazada',
            autor: 'Héctor Vargas (Proveedor)',
            nota: `Operación rechazada: ${motivo.trim()}`
        });

        storage.guardar('operaciones', ops);
        return ops[index];
    }

    /**
     * El Punto de Venta corrige los datos del pago y reenvía el comprobante para nueva revisión.
     */
    async function reenviarComprobante(id, datosPagoCorregido, autorNombre = 'Punto de Venta') {
        const ops = storage.obtener('operaciones') || [];
        const index = ops.findIndex((o) => o.id === id);

        if (index === -1) {
            throw new Error(`Operación ${id} no encontrada.`);
        }

        const ahora = new Date().toISOString();
        ops[index].estado = 'Pendiente de revisión';
        ops[index].motivoRechazo = null;
        ops[index].bancoOrigen = datosPagoCorregido.bancoOrigen || ops[index].bancoOrigen;
        ops[index].referenciaAprobacion = datosPagoCorregido.referenciaAprobacion || ops[index].referenciaAprobacion;
        if (datosPagoCorregido.comprobanteUrl) {
            ops[index].comprobanteUrl = datosPagoCorregido.comprobanteUrl;
        }

        if (!ops[index].historial) ops[index].historial = [];
        ops[index].historial.push({
            fecha: ahora,
            estado: 'Pendiente de revisión',
            autor: autorNombre,
            nota: `Comprobante y referencia corregidos (Banco: ${ops[index].bancoOrigen}, Ref: ${ops[index].referenciaAprobacion}). Reenviado para auditoría del proveedor.`
        });

        storage.guardar('operaciones', ops);
        return ops[index];
    }

    /**
     * Calcula métricas agregadas y contadores de auditoría para el dashboard del Administrador.
     */
    async function getMetricasResumen() {
        const ops = storage.obtener('operaciones') || [];
        const puntos = storage.obtener('puntosDeVenta') || [];

        const totalOperaciones = ops.length;
        const pendientes = ops.filter((o) => o.estado === 'Pendiente de revisión').length;
        const confirmadas = ops.filter((o) => o.estado === 'Confirmada').length;
        const rechazadas = ops.filter((o) => o.estado === 'Rechazada').length;

        const totalConsignado = ops.reduce((acc, cur) => acc + (cur.valorConsignar || 0), 0);
        const totalConsignadoConfirmado = ops
            .filter((o) => o.estado === 'Confirmada')
            .reduce((acc, cur) => acc + (cur.valorConsignar || 0), 0);
        const totalComisiones = ops.reduce((acc, cur) => acc + (cur.comision || 0), 0);
        const totalVendido = ops.reduce((acc, cur) => acc + (cur.valorCobrar || 0), 0);

        const posActivos = puntos.filter((p) => p.estado === 'activo').length;
        const posTotal = puntos.length;

        return {
            totalOperaciones,
            pendientes,
            confirmadas,
            rechazadas,
            totalConsignado,
            totalConsignadoConfirmado,
            totalComisiones,
            totalVendido,
            posActivos,
            posTotal
        };
    }

    return {
        getOperaciones,
        getOperacionPorId,
        registrarOperacionDemo,
        confirmarOperacion,
        rechazarOperacion,
        reenviarComprobante,
        getMetricasResumen
    };
});
