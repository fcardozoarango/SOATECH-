/**
 * ============================================================================
 * TARIFAS Y DATOS MAESTROS - CALCULADORA SOAT 2026
 * ============================================================================
 * Este archivo contiene las tablas oficiales de tarifas del SOAT vigentes
 * a partir del 1 de enero de 2026, las descripciones legales de cada código,
 * la clasificación de vehículos y los parámetros requeridos para su liquidación.
 *
 * Diseñado para ser cargado tanto como script estándar (file:///)
 * como módulo ES.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOAT_TARIFAS = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    // 1. Configuración de parámetros comerciales y vigencia
    const CONFIG = {
        ANIO_TARIFA: 2026,
        UMBRAL_COMISION: 1000000, // $1.000.000 COP
        MARGEN_MENOR_UMBRAL: 25000, // $25.000 COP si valor base < $1.000.000
        MARGEN_MAYOR_UMBRAL: 30000, // $30.000 COP si valor base >= $1.000.000
        PASO_REDONDEO: 1000 // Redondeo al alza de $1.000 en $1.000
    };

    // 2. Precios fijos especiales (política comercial)
    // Motos hasta 200 c.c. (códigos 110 y 120) se liquidan a cobro fijo de $390.000
    const PRECIOS_FIJOS_COBRO = {
        110: 390000,
        120: 390000
    };

    // 3. Tabla oficial de precios base para Punto de Venta (Valor a Consignar)
    const PRECIOS_BASE = {
        // Ciclomotores y Motocicletas
        10: 144100, // Ciclomotor
        110: 276200, // Moto, menos de 100 c.c.
        120: 363300, // Moto, entre 100 y 200 c.c.
        130: 781400, // Moto, más de 200 c.c.
        140: 406900, // Motocarro (5 pasajeros), tricimoto y cuadriciclo

        // Camperos y Camionetas
        211: 812800, // < 1.500 c.c., menos de 10 años
        212: 973000, // < 1.500 c.c., 10 o más años
        221: 966600, // 1.500 - 2.500 c.c., menos de 10 años
        222: 1146400, // 1.500 - 2.500 c.c., 10 o más años
        231: 1135300, // > 2.500 c.c., menos de 10 años
        232: 1299000, // > 2.500 c.c., 10 o más años

        // Carga o Mixto
        310: 908400, // Menos de 5 toneladas
        320: 1307800, // De 5 a 15 toneladas
        330: 1646900, // Más de 15 toneladas

        // Oficial Especial
        410: 1024500, // Menos de 1.500 c.c.
        420: 1285200, // De 1.500 a 2.500 c.c.
        430: 1535600, // Más de 2.500 c.c.

        // Vehículos Familiares
        511: 467300, // < 1.500 c.c., menos de 10 años
        512: 612900, // < 1.500 c.c., 10 o más años
        521: 564700, // 1.500 - 2.500 c.c., menos de 10 años
        522: 697400, // 1.500 - 2.500 c.c., 10 o más años
        531: 656000, // > 2.500 c.c., menos de 10 años
        532: 774300, // > 2.500 c.c., 10 o más años

        // Vehículos de 6 o más pasajeros
        611: 817300, // < 2.500 c.c., menos de 10 años
        612: 1042700, // < 2.500 c.c., 10 o más años
        621: 1092300, // >= 2.500 c.c., menos de 10 años
        622: 1306600, // >= 2.500 c.c., 10 o más años

        // Autos de Negocio / Taxis
        711: 301900, // < 1.500 c.c., menos de 10 años
        712: 372000, // < 1.500 c.c., 10 o más años
        721: 370000, // 1.500 - 2.500 c.c., menos de 10 años
        722: 452400, // 1.500 - 2.500 c.c., 10 o más años
        731: 471400, // > 2.500 c.c., menos de 10 años
        732: 549300, // > 2.500 c.c., 10 o más años

        // Transporte Público Urbano e Intermunicipal
        810: 693300, // Servicio público urbano (municipal), buses y busetas
        910: 685500, // Intermunicipal, menos de 10 pasajeros
        920: 985300 // Intermunicipal, 10 o más pasajeros
    };

    // 4. Catálogo de descripciones textuales para cada código
    const DESCRIPCIONES = (function () {
        const desc = {
            10: 'Ciclomotor',
            110: 'Moto, menos de 100 c.c.',
            120: 'Moto, entre 100 y 200 c.c.',
            130: 'Moto, más de 200 c.c.',
            140: 'Motocarro (5 pasajeros), tricimoto y cuadriciclo',
            310: 'Carga o mixto, menos de 5 toneladas',
            320: 'Carga o mixto, entre 5 y 15 toneladas',
            330: 'Carga o mixto, más de 15 toneladas',
            810: 'Servicio público urbano (municipal), buses y busetas',
            910: 'Servicio público intermunicipal, menos de 10 pasajeros',
            920: 'Servicio público intermunicipal, 10 o más pasajeros'
        };

        const c3 = ['menos de 1.500 c.c.', 'entre 1.500 y 2.500 c.c.', 'más de 2.500 c.c.'];
        const c2 = ['menos de 2.500 c.c.', '2.500 o más c.c.'];
        const a2 = ['menos de 10 años', '10 o más años'];

        const gruposGenerales = [
            [2, 'Campero o camioneta'],
            [5, 'Vehículo familiar'],
            [7, 'Auto de negocio o taxi']
        ];

        gruposGenerales.forEach(([prefijo, nombre]) => {
            for (let t = 1; t <= 3; t++) {
                for (let a = 1; a <= 2; a++) {
                    desc[prefijo * 100 + t * 10 + a] = `${nombre}, ${c3[t - 1]}, ${a2[a - 1]}`;
                }
            }
        });

        for (let t = 1; t <= 2; t++) {
            for (let a = 1; a <= 2; a++) {
                desc[600 + t * 10 + a] = `Vehículo de 6 o más pasajeros, ${c2[t - 1]}, ${a2[a - 1]}`;
            }
        }

        for (let k = 1; k <= 3; k++) {
            desc[400 + k * 10] = `Oficial especial, ${c3[k - 1]}`;
        }

        return desc;
    })();

    // 5. Opciones de Servicio oficial de tránsito
    const SERVICIOS = {
        par: { id: 'par', nombre: 'Particular', tag: 'Privado / Particular' },
        pub: { id: 'pub', nombre: 'Público', tag: 'Servicio Público' },
        ofi: { id: 'ofi', nombre: 'Oficial', tag: 'Vehículos del Estado' }
    };

    // 6. Diccionario de preguntas y parámetros condicionales
    const PREGUNTAS = {
        cc: {
            id: 'cc',
            etiqueta: 'Cilindraje del motor (c.c.)',
            ayuda: 'Revisa la casilla "Cilindraje" en la tarjeta de propiedad.',
            placeholder: 'Ejemplo: 1600'
        },
        year: {
            id: 'year',
            etiqueta: 'Año modelo del vehículo',
            ayuda: 'Revisa la casilla "Modelo" en la tarjeta de propiedad.',
            placeholder: 'Ejemplo: 2018'
        },
        ton: {
            id: 'ton',
            etiqueta: 'Capacidad de carga máxima autorizada',
            ayuda: 'Revisa la capacidad de carga (1 tonelada = 1.000 kg).',
            opciones: [
                ['1', 'Menos de 5 toneladas', 'Carga menor a 5.000 kg'],
                ['2', 'De 5 a 15 toneladas', 'De 5.000 kg a 15.000 kg'],
                ['3', 'Más de 15 toneladas', 'Carga superior a 15.000 kg']
            ]
        },
        pax: {
            id: 'pax',
            etiqueta: 'Capacidad de pasajeros autorizada',
            ayuda: 'Capacidad autorizada registrada en la licencia de tránsito.',
            opciones: [
                ['1', 'Menos de 10 pasajeros', 'Capacidad menor a 10 ocupantes'],
                ['2', '10 o más pasajeros', 'Capacidad de 10 o más ocupantes']
            ]
        },
        p6: {
            id: 'p6',
            etiqueta: '¿La tarjeta indica 6 o más pasajeros?',
            ayuda: 'El tarifario exige capacidad certificada de 6 o más plazas.',
            opciones: [
                ['si', 'Sí, cuenta con 6 o más pasajeros'],
                ['no', 'No, menos de 6 pasajeros']
            ]
        }
    };

    // 7. Tipos de vehículo y sus reglas de negocio
    const TIPOS = [
        {
            id: 'moto',
            nombre: 'Motocicleta',
            subtitulo: 'Menores y mayores a 200 c.c.',
            servicios: ['par', 'pub'],
            preguntas: ['cc'],
            icono: 'moto',
            resolverCodigo: function (v) {
                return v.cc < 100 ? 110 : v.cc <= 200 ? 120 : 130;
            }
        },
        {
            id: 'ciclo',
            nombre: 'Ciclomotor',
            subtitulo: 'Bicicletas eléctricas asistidas y ciclomotores',
            servicios: ['par', 'pub'],
            preguntas: [],
            icono: 'moto',
            resolverCodigo: function () {
                return 10;
            }
        },
        {
            id: 'mc',
            nombre: 'Motocarro / Tricimoto',
            subtitulo: 'Motocarro 5 pasajeros, tricimoto y cuadriciclo',
            servicios: ['par', 'pub'],
            preguntas: [],
            icono: 'tri',
            resolverCodigo: function () {
                return 140;
            }
        },
        {
            id: 'fam',
            nombre: 'Vehículo familiar',
            subtitulo: 'Automóviles particulares y familiares',
            servicios: ['par', 'pub'],
            preguntas: ['cc', 'year'],
            icono: 'car',
            resolverCodigo: function (v, t3) {
                return 500 + t3(v.cc) * 10 + v.antiguedadCodigo;
            }
        },
        {
            id: 'cam',
            nombre: 'Campero o Camioneta',
            subtitulo: 'Pick-ups, camperos y camionetas SUV',
            servicios: ['par', 'pub'],
            preguntas: ['cc', 'year'],
            icono: 'car',
            resolverCodigo: function (v, t3) {
                return 200 + t3(v.cc) * 10 + v.antiguedadCodigo;
            }
        },
        {
            id: 'p6',
            nombre: '6 o más pasajeros',
            subtitulo: 'Capacidad registrada de 6 o más personas',
            servicios: ['par', 'pub'],
            preguntas: ['p6', 'cc', 'year'],
            icono: 'car',
            resolverCodigo: function (v) {
                return 600 + (v.cc < 2500 ? 1 : 2) * 10 + v.antiguedadCodigo;
            }
        },
        {
            id: 'neg',
            nombre: 'Auto de negocio / Taxi',
            subtitulo: 'Taxis y vehículos de servicio comercial',
            servicios: ['par', 'pub'],
            preguntas: ['cc', 'year'],
            icono: 'car',
            resolverCodigo: function (v, t3) {
                return 700 + t3(v.cc) * 10 + v.antiguedadCodigo;
            }
        },
        {
            id: 'car',
            nombre: 'Vehículo de carga o mixto',
            subtitulo: 'Camiones, furgones, estacas y volquetas',
            servicios: ['par', 'pub'],
            preguntas: ['ton'],
            icono: 'truck',
            resolverCodigo: function (v) {
                return 300 + v.ton * 10;
            }
        },
        {
            id: 'bus',
            nombre: 'Bus o buseta urbana',
            subtitulo: 'Servicio de transporte municipal urbano',
            servicios: ['pub'],
            preguntas: [],
            icono: 'bus',
            resolverCodigo: function () {
                return 810;
            }
        },
        {
            id: 'int',
            nombre: 'Público intermunicipal',
            subtitulo: 'Rutas intermunicipales autorizadas',
            servicios: ['pub'],
            preguntas: ['pax'],
            icono: 'bus',
            resolverCodigo: function (v) {
                return 900 + v.pax * 10;
            }
        },
        {
            id: 'ofi',
            nombre: 'Oficial especial',
            subtitulo: 'Vehículos oficiales del Estado',
            servicios: ['ofi'],
            preguntas: ['cc'],
            icono: 'car',
            resolverCodigo: function (v, t3) {
                return 400 + t3(v.cc) * 10;
            }
        }
    ];

    // 8. Agrupación visual limpia de tipos de vehículo
    const GRUPOS = [
        {
            nombre: 'Motos y similares',
            tipos: ['moto', 'ciclo', 'mc']
        },
        {
            nombre: 'Automóviles, camperos y camionetas',
            tipos: ['fam', 'cam', 'p6', 'neg']
        },
        {
            nombre: 'Carga y transporte pesado',
            tipos: ['car']
        },
        {
            nombre: 'Buses y servicio público colectivo',
            tipos: ['bus', 'int']
        },
        {
            nombre: 'Vehículos de servicio oficial',
            tipos: ['ofi']
        }
    ];

    return {
        CONFIG,
        PRECIOS_FIJOS_COBRO,
        PRECIOS_BASE,
        DESCRIPCIONES,
        SERVICIOS,
        PREGUNTAS,
        TIPOS,
        GRUPOS
    };
});
