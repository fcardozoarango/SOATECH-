/**
 * ============================================================================
 * MOTOR DE CÁLCULO Y LIQUIDACIÓN — SOATECH 2026
 * ============================================================================
 * Contiene las funciones matemáticas de liquidación, validación de entradas
 * y aplicación de comisiones dinámicas por punto de venta.
 * 
 * Reglas de integridad:
 * 1. La tarifa oficial del SOAT se toma exclusivamente de PRECIOS_BASE (2026) y
 *    es totalmente inmutable.
 * 2. El monto a consignar al proveedor es exactamente igual a la tarifa oficial.
 * 3. La comisión del punto de venta se calcula de forma independiente según
 *    la configuración de rangos del establecimiento activo.
 * 4. El total a cobrar al cliente es la suma de la tarifa oficial más la comisión,
 *    con redondeo reglamentario al alza de $1.000 en $1.000 (o tarifa plana de $390.000
 *    en motos de hasta 200 c.c.).
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

    /**
     * Da formato de moneda colombiana (COP) con separadores de miles.
     * Ejemplo: 1250000 -> "$1.250.000"
     */
    function formatearMoneda(valor) {
        if (typeof valor !== 'number' || isNaN(valor)) return '$0';
        return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Da formato numérico entero con separadores de miles.
     */
    function formatearNumero(valor) {
        if (valor == null) return '';
        return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Determina el tramo de cilindraje según el tarifario:
     * 1: Menos de 1.500 c.c.
     * 2: Entre 1.500 y 2.500 c.c.
     * 3: Más de 2.500 c.c.
     */
    function obtenerTramoCilindraje(cc) {
        if (cc < 1500) return 1;
        if (cc <= 2500) return 2;
        return 3;
    }

    /**
     * Calcula la antigüedad en años y el código correspondiente:
     * 1: Menos de 10 años
     * 2: 10 o más años
     */
    function calcularAntiguedad(anioModelo, anioReferencia) {
        const ref = anioReferencia || new Date().getFullYear();
        const anios = Math.max(0, ref - anioModelo);
        return {
            anios: anios,
            codigo: anios >= 10 ? 2 : 1
        };
    }

    /**
     * Valida el valor del cilindraje ingresado por el usuario.
     */
    function validarCilindraje(valorTexto, tipoVehiculoId) {
        if (!valorTexto) return { valido: false, valor: null, mensajeError: null };
        const limpio = String(valorTexto).replace(/\D/g, '');
        if (!limpio) return { valido: false, valor: null, mensajeError: null };

        const cc = parseInt(limpio, 10);
        const minimo = tipoVehiculoId === 'moto' ? 20 : 400;
        const maximo = 20000;

        if (cc < minimo || cc > maximo) {
            return {
                valido: false,
                valor: null,
                mensajeError: 'Revisa el cilindraje: va en c.c., no en litros (ej: 1600, no 1.6).'
            };
        }

        return { valido: true, valor: cc, mensajeError: null };
    }

    /**
     * Valida el año modelo ingresado por el usuario.
     */
    function validarAnioModelo(valorTexto, anioReferencia, finalizado) {
        if (!valorTexto) return { valido: false, valor: null, mensajeError: null };
        const texto = String(valorTexto).trim();
        if (!texto) return { valido: false, valor: null, mensajeError: null };

        if (!/^\d{4}$/.test(texto)) {
            return {
                valido: false,
                valor: null,
                mensajeError: finalizado ? 'Escribe el año con 4 dígitos (ej: 2018).' : null
            };
        }

        const anio = parseInt(texto, 10);
        const limiteSuperior = anioReferencia + 1;
        if (anio < 1940 || anio > limiteSuperior) {
            return {
                valido: false,
                valor: null,
                mensajeError: `El año debe estar entre 1940 y ${limiteSuperior}.`
            };
        }

        return { valido: true, valor: anio, mensajeError: null };
    }

    /**
     * Determina la comisión a aplicar según los rangos del establecimiento.
     * Si no se provee configuración, usa el esquema estándar por defecto.
     */
    function resolverComisionEstablecimiento(precioBase, codigoTarifa, posConfig) {
        const precioFijoMoto = posConfig?.motosFijoCobro || 390000;

        // Regla de motos hasta 200 c.c. (Códigos 110 y 120)
        if (codigoTarifa === 110 || codigoTarifa === 120) {
            const ganancia = Math.max(0, precioFijoMoto - precioBase);
            return {
                comisionNominal: ganancia,
                esPrecioFijoMoto: true,
                precioFijoCobro: precioFijoMoto,
                reglaAplicada: `Tarifa fija de cobro para motos hasta 200 c.c. ($${formatearMoneda(precioFijoMoto)})`
            };
        }

        // Esquema de rangos configurado para el punto de venta
        const rangos = (posConfig && Array.isArray(posConfig.comisiones) && posConfig.comisiones.length > 0)
            ? posConfig.comisiones
            : [
                { desde: 0, hasta: 999999, comision: 25000, etiqueta: 'SOAT menor a $1.000.000' },
                { desde: 1000000, hasta: null, comision: 30000, etiqueta: 'SOAT desde $1.000.000' }
            ];

        let regla = rangos.find(r => {
            const cumpleDesde = r.desde == null || precioBase >= r.desde;
            const cumpleHasta = r.hasta == null || precioBase <= r.hasta;
            return cumpleDesde && cumpleHasta;
        });

        if (!regla) {
            regla = rangos[rangos.length - 1];
        }

        const monto = regla ? Number(regla.comision) : 25000;
        const etiqueta = regla?.etiqueta || (precioBase < 1000000 ? 'SOAT menor a $1.000.000' : 'SOAT desde $1.000.000');

        return {
            comisionNominal: monto,
            esPrecioFijoMoto: false,
            precioFijoCobro: null,
            reglaAplicada: `${etiqueta} (+${formatearMoneda(monto)})`
        };
    }

    /**
     * Proceso principal de liquidación del SOAT.
     * Separa de forma estricta e inequívoca:
     * - Tarifa oficial SOAT (Valor a consignar al proveedor)
     * - Comisión calculada del punto de venta
     * - Total a cobrar al cliente
     * 
     * @param {object} estado Estado de la UI { svc, type, cc, year, ton, pax, p6 }
     * @param {object} tarifasData Módulo maestro de tarifas (SOAT_TARIFAS)
     * @param {object|null} posConfig Configuración opcional del punto de venta activo
     * @returns {object|null}
     */
    function liquidar(estado, tarifasData, posConfig = null) {
        if (!estado.type) return null;

        const tipo = tarifasData.TIPOS.find(t => t.id === estado.type);
        if (!tipo) return null;

        // Regla especial para 6 o más pasajeros
        if (tipo.id === 'p6' && estado.p6 === 'no') {
            return {
                incompleto: true,
                errorEspecial: 'El tarifario usa esta categoría solo para vehículos con 6 o más pasajeros registrados. Elige otro tipo de vehículo.'
            };
        }

        // Verificar que todos los campos requeridos por este tipo estén diligenciados
        const faltanCampos = tipo.preguntas.some(k => estado[k] == null);
        if (faltanCampos) {
            return null;
        }

        // Parámetros para resolver el código tarifario oficial
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
        const precioBaseOficial = tarifasData.PRECIOS_BASE[codigo];

        if (precioBaseOficial == null) {
            return {
                error: `No se encontró tarifa oficial en el tarifario 2026 para el código calculado (${codigo}).`
            };
        }

        // Resolver la comisión según el punto de venta activo
        const comisionData = resolverComisionEstablecimiento(precioBaseOficial, codigo, posConfig);

        let totalCobrarCliente;
        let comisionEfectiva;
        let baseSinRedondeo;
        let aplicoRedondeo = false;
        let valorRedondeo = 0;

        if (comisionData.esPrecioFijoMoto) {
            totalCobrarCliente = comisionData.precioFijoCobro;
            comisionEfectiva = totalCobrarCliente - precioBaseOficial;
            baseSinRedondeo = totalCobrarCliente;
        } else {
            baseSinRedondeo = precioBaseOficial + comisionData.comisionNominal;
            // Redondeo reglamentario definido en el tarifario comercial: al alza a múltiplos de $1.000
            const paso = tarifasData.CONFIG?.PASO_REDONDEO || 1000;
            totalCobrarCliente = Math.ceil(baseSinRedondeo / paso) * paso;
            valorRedondeo = totalCobrarCliente - baseSinRedondeo;
            aplicoRedondeo = valorRedondeo > 0;
            // La comisión efectiva absorbe el redondeo al alza comercial
            comisionEfectiva = totalCobrarCliente - precioBaseOficial;
        }

        return {
            exito: true,
            codigo: codigo,
            descripcion: tarifasData.DESCRIPCIONES[codigo] || 'Descripción no disponible',

            // 1. TARIFA OFICIAL SOAT (Inmutable, regulada por el Estado)
            tarifaOficialSoat: precioBaseOficial,

            // 2. MONTO QUE EL PUNTO DE VENTA DEBE CONSIGNAR AL PROVEEDOR (Héctor Vargas)
            montoConsignarProveedor: precioBaseOficial,

            // 3. COMISIÓN Y GANANCIA DEL PUNTO DE VENTA
            comisionPuntoVenta: comisionEfectiva,
            comisionNominal: comisionData.comisionNominal,
            reglaComisionAplicada: comisionData.reglaAplicada,

            // 4. TOTAL A COBRAR AL CLIENTE EN VENTANILLA
            totalCobrarCliente: totalCobrarCliente,

            // Detalles complementarios del cálculo
            esPrecioFijoMoto: comisionData.esPrecioFijoMoto,
            aplicoRedondeo: aplicoRedondeo,
            valorRedondeo: valorRedondeo,
            baseSinRedondeo: baseSinRedondeo,

            // Alias de retrocompatibilidad para la interfaz existente
            precioConsignar: precioBaseOficial,
            precioCobrar: totalCobrarCliente,
            ganancia: comisionEfectiva,

            tipoVehiculo: tipo,
            parametrosUsados: params,
            posUtilizado: posConfig ? { id: posConfig.id, nombre: posConfig.nombre } : null
        };
    }

    return {
        formatearMoneda,
        formatearNumero,
        obtenerTramoCilindraje,
        calcularAntiguedad,
        validarCilindraje,
        validarAnioModelo,
        resolverComisionEstablecimiento,
        liquidar
    };
});
