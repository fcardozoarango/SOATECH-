/**
 * ============================================================================
 * COPIA DE SEGURIDAD - MOTOR DE CÁLCULO SOAT 2026
 * ============================================================================
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOAT_CALCULADORA = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    function formatearMoneda(valor) {
        if (typeof valor !== 'number' || isNaN(valor)) return '$0';
        return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function formatearNumero(valor) {
        if (valor == null) return '';
        return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function obtenerTramoCilindraje(cc) {
        if (cc < 1500) return 1;
        if (cc <= 2500) return 2;
        return 3;
    }

    function calcularAntiguedad(anioModelo, anioReferencia) {
        const ref = anioReferencia || new Date().getFullYear();
        const anios = Math.max(0, ref - anioModelo);
        return { anios, codigo: anios >= 10 ? 2 : 1 };
    }

    function calcularCobroFinal(codigoTarifa, precioBase, config, preciosFijos) {
        const esFijo = !!(preciosFijos && preciosFijos[codigoTarifa]);
        let baseConMargen;
        let margenAplicado;

        if (esFijo) {
            baseConMargen = preciosFijos[codigoTarifa];
            margenAplicado = baseConMargen - precioBase;
        } else {
            margenAplicado = precioBase < config.UMBRAL_COMISION 
                ? config.MARGEN_MENOR_UMBRAL 
                : config.MARGEN_MAYOR_UMBRAL;
            baseConMargen = precioBase + margenAplicado;
        }

        const cobroCliente = Math.ceil(baseConMargen / config.PASO_REDONDEO) * config.PASO_REDONDEO;
        const ganancia = cobroCliente - precioBase;

        return {
            codigo: codigoTarifa,
            precioBase,
            baseConMargen,
            cobroCliente,
            ganancia,
            margenAplicado,
            esPrecioFijo: esFijo,
            aplicoRedondeo: cobroCliente !== baseConMargen
        };
    }

    function validarCilindraje(valorTexto, tipoVehiculoId) {
        if (!valorTexto) return { valido: false, valor: null, mensajeError: null };
        const limpio = String(valorTexto).replace(/\D/g, '');
        if (!limpio) return { valido: false, valor: null, mensajeError: null };
        const cc = parseInt(limpio, 10);
        const minimo = tipoVehiculoId === 'moto' ? 20 : 400;
        const maximo = 20000;
        if (cc < minimo || cc > maximo) {
            return { valido: false, valor: null, mensajeError: 'Revisa el cilindraje: va en c.c., no en litros (ej: 1600, no 1.6).' };
        }
        return { valido: true, valor: cc, mensajeError: null };
    }

    function validarAnioModelo(valorTexto, anioReferencia, finalizado) {
        if (!valorTexto) return { valido: false, valor: null, mensajeError: null };
        const texto = String(valorTexto).trim();
        if (!texto) return { valido: false, valor: null, mensajeError: null };
        if (!/^\d{4}$/.test(texto)) {
            return { valido: false, valor: null, mensajeError: finalizado ? 'Escribe el año con 4 dígitos (ej: 2018).' : null };
        }
        const anio = parseInt(texto, 10);
        const limiteSuperior = anioReferencia + 1;
        if (anio < 1940 || anio > limiteSuperior) {
            return { valido: false, valor: null, mensajeError: `El año debe estar entre 1940 y ${limiteSuperior}.` };
        }
        return { valido: true, valor: anio, mensajeError: null };
    }

    function liquidar(estado, tarifasData) {
        if (!estado.type) return null;
        const tipo = tarifasData.TIPOS.find(t => t.id === estado.type);
        if (!tipo) return null;

        if (tipo.id === 'p6' && estado.p6 === 'no') {
            return {
                incompleto: true,
                errorEspecial: 'El tarifario usa esta categoría solo para vehículos con 6 o más pasajeros registrados. Elige otro tipo de vehículo.'
            };
        }

        const faltanCampos = tipo.preguntas.some(k => estado[k] == null);
        if (faltanCampos) return null;

        const anioRef = tarifasData.CONFIG.ANIO_TARIFA;
        const antiguedad = estado.year != null 
            ? calcularAntiguedad(estado.year, anioRef) 
            : { anios: 0, codigo: 1 };

        const params = {
            cc: estado.cc,
            year: estado.year,
            ton: Number(estado.ton) || 0,
            pax: Number(estado.pax) || 0,
            p6: estado.p6,
            antiguedadAnios: antiguedad.anios,
            antiguedadCodigo: antiguedad.codigo
        };

        const codigo = tipo.resolverCodigo(params, obtenerTramoCilindraje);
        const precioBase = tarifasData.PRECIOS_BASE[codigo];

        if (precioBase == null) {
            return { error: `No se encontró tarifa oficial para el código calculado (${codigo}).` };
        }

        const calculo = calcularCobroFinal(
            codigo, 
            precioBase, 
            tarifasData.CONFIG, 
            tarifasData.PRECIOS_FIJOS_COBRO
        );

        return {
            exito: true,
            codigo,
            descripcion: tarifasData.DESCRIPCIONES[codigo] || 'Descripción no disponible',
            precioConsignar: calculo.precioBase,
            precioCobrar: calculo.cobroCliente,
            ganancia: calculo.ganancia,
            baseConMargen: calculo.baseConMargen,
            margenAplicado: calculo.margenAplicado,
            esPrecioFijo: calculo.esPrecioFijo,
            aplicoRedondeo: calculo.aplicoRedondeo,
            tipoVehiculo: tipo,
            parametrosUsados: params
        };
    }

    return {
        formatearMoneda,
        formatearNumero,
        obtenerTramoCilindraje,
        calcularAntiguedad,
        calcularCobroFinal,
        validarCilindraje,
        validarAnioModelo,
        liquidar
    };
});
