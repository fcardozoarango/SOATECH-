/**
 * ============================================================================
 * DATOS SEMILLA PARA MODO DEMOSTRACIÓN — SOATECH
 * ============================================================================
 * Todos los registros de este archivo son EXCLUSIVAMENTE DEMOSTRATIVOS y
 * están identificados con la etiqueta [DEMO] para evitar confusiones con
 * establecimientos u operaciones reales.
 *
 * Los datos de consignación del proveedor corresponden a la información
 * oficial entregada por Héctor Adrián Vargas Álvarez.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOATECH_MOCK_DATA = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    // 1. Datos Centralizados de Consignación del Proveedor (Oficiales y Compartidos)
    const DATOS_CONSIGNACION_PROVEEDOR = {
        titular: {
            nombre: 'Héctor Adrián Vargas Álvarez',
            documentoTipo: 'Cédula de Ciudadanía',
            documentoNumero: '12.201.029'
        },
        // Soporte del Proveedor (Héctor) - Identificación Verde
        soporteProveedor: {
            responsable: 'Héctor Vargas',
            telefono: '320 338 80 51',
            telefonoFormateado: '+57 320 338 8051',
            whatsappUrl:
                'https://wa.me/573203388051?text=Hola%20H%C3%A9ctor,%20necesito%20asistencia%20con%20una%20consignaci%C3%B3n%20o%20emisi%C3%B3n%20SOAT'
        },
        // Soporte Técnico de la Plataforma SOATECH - Identificación Azul (Sin nombres personales)
        soporteTecnicoPlataforma: {
            nombre: 'Soporte Técnico SOATECH',
            telefono: '+57 324 442 5912',
            whatsappUrl:
                'https://wa.me/573244425912?text=Hola,%20necesito%20soporte%20t%C3%A9cnico%20en%20la%20plataforma%20SOATECH'
        },
        cuentas: [
            {
                id: 'bancolombia',
                entidad: 'Bancolombia',
                tipoCuenta: 'Cuenta de ahorros',
                numero: '28570378050',
                activo: true,
                colorTema: '#fd0'
            },
            {
                id: 'nequi',
                entidad: 'Nequi',
                tipoCuenta: 'Billetera digital',
                numero: '3176432663',
                activo: true,
                colorTema: '#200020'
            },
            {
                id: 'davivienda',
                entidad: 'Davivienda',
                tipoCuenta: 'Cuenta de ahorros',
                numero: '488430942380',
                activo: true,
                colorTema: '#ed1c24'
            },
            {
                id: 'daviplata',
                entidad: 'Daviplata',
                tipoCuenta: 'Depósito de bajo monto',
                numero: '3176432663',
                llave: '@davi3176432663',
                activo: true,
                colorTema: '#eb1b23'
            }
        ]
    };

    // 2. Esquemas de Comisiones Preconfiguradas para la Demo
    const ESQUEMAS_COMISION_BASE = {
        estandar: [
            { desde: 0, hasta: 999999, comision: 25000, etiqueta: 'SOAT menor a $1.000.000' },
            { desde: 1000000, hasta: null, comision: 30000, etiqueta: 'SOAT desde $1.000.000' }
        ],
        preferencial: [
            { desde: 0, hasta: 999999, comision: 30000, etiqueta: 'SOAT menor a $1.000.000' },
            { desde: 1000000, hasta: null, comision: 35000, etiqueta: 'SOAT desde $1.000.000' }
        ],
        escalonado: [
            { desde: 0, hasta: 799999, comision: 20000, etiqueta: 'SOAT menor a $800.000' },
            { desde: 800000, hasta: 1499999, comision: 30000, etiqueta: 'SOAT entre $800.000 y $1.500.000' },
            { desde: 1500000, hasta: null, comision: 40000, etiqueta: 'SOAT desde $1.500.000' }
        ]
    };

    // 3. Catálogo de 20 Puntos de Venta Ficticios [DEMO]
    const PUNTOS_DE_VENTA_DEMO = [
        {
            id: 'DEMO-POS-01',
            codigo: 'POS-001',
            nombre: '[DEMO] Punto de Venta 01 - Centro Bogotá',
            departamento: 'Cundinamarca',
            ciudad: 'Bogotá D.C.',
            responsable: 'Carlos Andrés Gómez (Demo)',
            telefono: '3101234501',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-05'
        },
        {
            id: 'DEMO-POS-02',
            codigo: 'POS-002',
            nombre: '[DEMO] Punto de Venta 02 - Chapinero Norte',
            departamento: 'Cundinamarca',
            ciudad: 'Bogotá D.C.',
            responsable: 'María Paula Ríos (Demo)',
            telefono: '3111234502',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.preferencial)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-08'
        },
        {
            id: 'DEMO-POS-03',
            codigo: 'POS-003',
            nombre: '[DEMO] Punto de Venta 03 - Autopista Sur',
            departamento: 'Cundinamarca',
            ciudad: 'Soacha',
            responsable: 'Jorge Enrique Castro (Demo)',
            telefono: '3121234503',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.escalonado)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-10'
        },
        {
            id: 'DEMO-POS-04',
            codigo: 'POS-004',
            nombre: '[DEMO] Punto de Venta 04 - Poblado Medellín',
            departamento: 'Antioquia',
            ciudad: 'Medellín',
            responsable: 'Laura Cristina Maya (Demo)',
            telefono: '3131234504',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.preferencial)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-12'
        },
        {
            id: 'DEMO-POS-05',
            codigo: 'POS-005',
            nombre: '[DEMO] Punto de Venta 05 - Bello Centro',
            departamento: 'Antioquia',
            ciudad: 'Bello',
            responsable: 'David Fernando Restrepo (Demo)',
            telefono: '3141234505',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-15'
        },
        {
            id: 'DEMO-POS-06',
            codigo: 'POS-006',
            nombre: '[DEMO] Punto de Venta 06 - Envigado La Mina',
            departamento: 'Antioquia',
            ciudad: 'Envigado',
            responsable: 'Andrea Carolina Londoño (Demo)',
            telefono: '3151234506',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-17'
        },
        {
            id: 'DEMO-POS-07',
            codigo: 'POS-007',
            nombre: '[DEMO] Punto de Venta 07 - Chipichape Cali',
            departamento: 'Valle del Cauca',
            ciudad: 'Cali',
            responsable: 'Santiago Morales (Demo)',
            telefono: '3161234507',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.preferencial)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-20'
        },
        {
            id: 'DEMO-POS-08',
            codigo: 'POS-008',
            nombre: '[DEMO] Punto de Venta 08 - Versalles Cali',
            departamento: 'Valle del Cauca',
            ciudad: 'Cali',
            responsable: 'Diana Marcela Osorio (Demo)',
            telefono: '3171234508',
            estado: 'inactivo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-22'
        },
        {
            id: 'DEMO-POS-09',
            codigo: 'POS-009',
            nombre: '[DEMO] Punto de Venta 09 - Prado Barranquilla',
            departamento: 'Atlántico',
            ciudad: 'Barranquilla',
            responsable: 'Javier Elías Char (Demo)',
            telefono: '3181234509',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.escalonado)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-25'
        },
        {
            id: 'DEMO-POS-10',
            codigo: 'POS-010',
            nombre: '[DEMO] Punto de Venta 10 - Murillo Barranquilla',
            departamento: 'Atlántico',
            ciudad: 'Barranquilla',
            responsable: 'Valeria Sofía Blanco (Demo)',
            telefono: '3191234510',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-01-27'
        },
        {
            id: 'DEMO-POS-11',
            codigo: 'POS-011',
            nombre: '[DEMO] Punto de Venta 11 - Cabecera Bucaramanga',
            departamento: 'Santander',
            ciudad: 'Bucaramanga',
            responsable: 'Germán Alonso Silva (Demo)',
            telefono: '3201234511',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.preferencial)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-01'
        },
        {
            id: 'DEMO-POS-12',
            codigo: 'POS-012',
            nombre: '[DEMO] Punto de Venta 12 - Floridablanca Centro',
            departamento: 'Santander',
            ciudad: 'Floridablanca',
            responsable: 'Lina María Mantilla (Demo)',
            telefono: '3211234512',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-03'
        },
        {
            id: 'DEMO-POS-13',
            codigo: 'POS-013',
            nombre: '[DEMO] Punto de Venta 13 - Los Nogales Pereira',
            departamento: 'Risaralda',
            ciudad: 'Pereira',
            responsable: 'Mauricio Cardona (Demo)',
            telefono: '3221234513',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.preferencial)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-05'
        },
        {
            id: 'DEMO-POS-14',
            codigo: 'POS-014',
            nombre: '[DEMO] Punto de Venta 14 - Dosquebradas Sol',
            departamento: 'Risaralda',
            ciudad: 'Dosquebradas',
            responsable: 'Gloria Inés Patiño (Demo)',
            telefono: '3231234514',
            estado: 'inactivo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-07'
        },
        {
            id: 'DEMO-POS-15',
            codigo: 'POS-015',
            nombre: '[DEMO] Punto de Venta 15 - El Cable Manizales',
            departamento: 'Caldas',
            ciudad: 'Manizales',
            responsable: 'Alejandro Duque (Demo)',
            telefono: '3241234515',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-09'
        },
        {
            id: 'DEMO-POS-16',
            codigo: 'POS-016',
            nombre: '[DEMO] Punto de Venta 16 - Carrera 14 Armenia',
            departamento: 'Quindío',
            ciudad: 'Armenia',
            responsable: 'Juliana Cárdenas (Demo)',
            telefono: '3251234516',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-11'
        },
        {
            id: 'DEMO-POS-17',
            codigo: 'POS-017',
            nombre: '[DEMO] Punto de Venta 17 - Centro Ibagué',
            departamento: 'Tolima',
            ciudad: 'Ibagué',
            responsable: 'Humberto Lozano (Demo)',
            telefono: '3261234517',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.escalonado)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-13'
        },
        {
            id: 'DEMO-POS-18',
            codigo: 'POS-018',
            nombre: '[DEMO] Punto de Venta 18 - La 70 Villavicencio',
            departamento: 'Meta',
            ciudad: 'Villavicencio',
            responsable: 'Paola Andrea Baquero (Demo)',
            telefono: '3271234518',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-14'
        },
        {
            id: 'DEMO-POS-19',
            codigo: 'POS-019',
            nombre: '[DEMO] Punto de Venta 19 - Centro Pasto',
            departamento: 'Nariño',
            ciudad: 'Pasto',
            responsable: 'Camilo Ernesto Guerrero (Demo)',
            telefono: '3281234519',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.estandar)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-15'
        },
        {
            id: 'DEMO-POS-20',
            codigo: 'POS-020',
            nombre: '[DEMO] Punto de Venta 20 - Parque Cúcuta',
            departamento: 'Norte de Santander',
            ciudad: 'Cúcuta',
            responsable: 'Néstor Raúl Peñaranda (Demo)',
            telefono: '3291234520',
            estado: 'activo',
            comisiones: JSON.parse(JSON.stringify(ESQUEMAS_COMISION_BASE.preferencial)),
            motosFijoCobro: 390000,
            fechaRegistro: '2026-02-16'
        }
    ];

    // 4. Usuarios Ficticios Demo para Simulación de Roles
    const USUARIOS_DEMO = [
        {
            id: 'usr-admin-demo',
            nombre: 'Héctor Adrián Vargas Álvarez',
            rol: 'admin',
            rolEtiqueta: 'Administrador / Proveedor',
            correo: 'hector.vargas@soatech.demo',
            posId: null,
            avatar: 'HV'
        },
        {
            id: 'usr-pos-01-demo',
            nombre: 'Carlos Andrés Gómez',
            rol: 'pos',
            rolEtiqueta: 'Punto de Venta 01 (Bogotá)',
            correo: 'carlos.gomez@soatech.demo',
            posId: 'DEMO-POS-01',
            avatar: 'PV'
        },
        {
            id: 'usr-pos-02-demo',
            nombre: 'María Paula Ríos',
            rol: 'pos',
            rolEtiqueta: 'Punto de Venta 02 (Chapinero)',
            correo: 'maria.rios@soatech.demo',
            posId: 'DEMO-POS-02',
            avatar: 'PV'
        }
    ];

    // 5. Historial de Operaciones Ficticias Demo con estados: Pendiente de revisión, Confirmada y Rechazada
    const OPERACIONES_DEMO_INICIALES = [
        {
            id: 'OP-DEMO-1001',
            posId: 'DEMO-POS-01',
            posNombre: '[DEMO] Punto de Venta 01 - Centro Bogotá',
            fecha: '2026-02-20T08:15:30',
            codigoTarifa: 120,
            vehiculoDescripcion: 'Moto, entre 100 y 200 c.c.',
            servicio: 'Particular',
            placa: 'KZX-94C',
            valorConsignar: 363300,
            comision: 26700,
            valorCobrar: 390000,
            estado: 'Pendiente de revisión',
            bancoOrigen: 'Bancolombia',
            referenciaAprobacion: 'TRX-894201',
            comprobanteUrl: 'demo-receipt-01.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-20T08:15:30',
                    estado: 'Pendiente de revisión',
                    autor: 'Carlos Gómez (Punto de Venta 01)',
                    nota: 'Comprobante de transferencia Bancolombia adjuntado por valor de $363.300.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1002',
            posId: 'DEMO-POS-01',
            posNombre: '[DEMO] Punto de Venta 01 - Centro Bogotá',
            fecha: '2026-02-19T16:30:15',
            codigoTarifa: 521,
            vehiculoDescripcion: 'Vehículo familiar, 1.500 a 2.500 c.c., <10 años',
            servicio: 'Particular',
            placa: 'FGR-123',
            valorConsignar: 564700,
            comision: 25000,
            valorCobrar: 590000,
            estado: 'Confirmada',
            bancoOrigen: 'Davivienda',
            referenciaAprobacion: 'DAV-448109',
            comprobanteUrl: 'demo-receipt-02.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-19T16:30:15',
                    estado: 'Pendiente de revisión',
                    autor: 'Carlos Gómez (Punto de Venta 01)',
                    nota: 'Transferencia por $564.700 enviada.'
                },
                {
                    fecha: '2026-02-19T16:45:00',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Pago confirmado y verificado en cuenta Davivienda. SOAT expedido exitosamente.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1003',
            posId: 'DEMO-POS-02',
            posNombre: '[DEMO] Punto de Venta 02 - Chapinero Norte',
            fecha: '2026-02-19T14:45:00',
            codigoTarifa: 221,
            vehiculoDescripcion: 'Campero o camioneta, 1.500 a 2.500 c.c., <10 años',
            servicio: 'Particular',
            placa: 'MWN-789',
            valorConsignar: 966600,
            comision: 30000,
            valorCobrar: 997000,
            estado: 'Rechazada',
            bancoOrigen: 'Nequi',
            referenciaAprobacion: 'NQ-771802',
            comprobanteUrl: 'demo-receipt-03.png',
            motivoRechazo:
                'El comprobante adjunto está borroso y el valor transferido ($900.000) no corresponde a la tarifa oficial requerida ($966.600). Por favor verificar y reenviar.',
            historial: [
                {
                    fecha: '2026-02-19T14:45:00',
                    estado: 'Pendiente de revisión',
                    autor: 'María Paula Ríos (Punto de Venta 02)',
                    nota: 'Comprobante de Nequi adjuntado.'
                },
                {
                    fecha: '2026-02-19T15:10:00',
                    estado: 'Rechazada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Rechazado: Comprobante borroso y valor incompleto.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1004',
            posId: 'DEMO-POS-03',
            posNombre: '[DEMO] Punto de Venta 03 - Autopista Sur',
            fecha: '2026-02-19T11:10:48',
            codigoTarifa: 320,
            vehiculoDescripcion: 'Carga o mixto, entre 5 y 15 toneladas',
            servicio: 'Público',
            placa: 'SOZ-456',
            valorConsignar: 1307800,
            comision: 30000,
            valorCobrar: 1338000,
            estado: 'Confirmada',
            bancoOrigen: 'Bancolombia',
            referenciaAprobacion: 'BCO-998120',
            comprobanteUrl: 'demo-receipt-04.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-19T11:10:48',
                    estado: 'Pendiente de revisión',
                    autor: 'Jorge Castro (Punto de Venta 03)',
                    nota: 'Consignación por $1.307.800 enviada.'
                },
                {
                    fecha: '2026-02-19T11:25:30',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Pago verificado en Bancolombia.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1005',
            posId: 'DEMO-POS-04',
            posNombre: '[DEMO] Punto de Venta 04 - Poblado Medellín',
            fecha: '2026-02-19T09:20:10',
            codigoTarifa: 110,
            vehiculoDescripcion: 'Moto, menos de 100 c.c.',
            servicio: 'Particular',
            placa: 'LMN-33D',
            valorConsignar: 276200,
            comision: 113800,
            valorCobrar: 390000,
            estado: 'Pendiente de revisión',
            bancoOrigen: 'Daviplata',
            referenciaAprobacion: 'DP-317643',
            comprobanteUrl: 'demo-receipt-05.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-19T09:20:10',
                    estado: 'Pendiente de revisión',
                    autor: 'Laura Maya (Punto de Venta 04)',
                    nota: 'Giro enviado por Daviplata a la llave @davi3176432663.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1006',
            posId: 'DEMO-POS-02',
            posNombre: '[DEMO] Punto de Venta 02 - Chapinero Norte',
            fecha: '2026-02-18T17:50:33',
            codigoTarifa: 721,
            vehiculoDescripcion: 'Auto negocio o taxi, 1.500 a 2.500 c.c., <10 años',
            servicio: 'Público',
            placa: 'TXB-881',
            valorConsignar: 370000,
            comision: 30000,
            valorCobrar: 400000,
            estado: 'Confirmada',
            bancoOrigen: 'Nequi',
            referenciaAprobacion: 'NQ-118844',
            comprobanteUrl: 'demo-receipt-06.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-18T17:50:33',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Pago confirmado y conciliado.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1007',
            posId: 'DEMO-POS-05',
            posNombre: '[DEMO] Punto de Venta 05 - Bello Centro',
            fecha: '2026-02-18T15:15:20',
            codigoTarifa: 130,
            vehiculoDescripcion: 'Moto, más de 200 c.c.',
            servicio: 'Particular',
            placa: 'PQR-99F',
            valorConsignar: 781400,
            comision: 25000,
            valorCobrar: 807000,
            estado: 'Confirmada',
            bancoOrigen: 'Bancolombia',
            referenciaAprobacion: 'BCO-776102',
            comprobanteUrl: 'demo-receipt-07.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-18T15:15:20',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Aprobado.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1008',
            posId: 'DEMO-POS-03',
            posNombre: '[DEMO] Punto de Venta 03 - Autopista Sur',
            fecha: '2026-02-18T11:05:42',
            codigoTarifa: 611,
            vehiculoDescripcion: '6 o más pasajeros, <2.500 c.c., <10 años',
            servicio: 'Particular',
            placa: 'KKL-554',
            valorConsignar: 817300,
            comision: 30000,
            valorCobrar: 848000,
            estado: 'Confirmada',
            bancoOrigen: 'Davivienda',
            referenciaAprobacion: 'DAV-891023',
            comprobanteUrl: 'demo-receipt-08.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-18T11:05:42',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Confirmado.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1009',
            posId: 'DEMO-POS-01',
            posNombre: '[DEMO] Punto de Venta 01 - Centro Bogotá',
            fecha: '2026-02-18T09:40:11',
            codigoTarifa: 810,
            vehiculoDescripcion: 'Servicio público urbano municipal, buses y busetas',
            servicio: 'Público',
            placa: 'WTC-102',
            valorConsignar: 693300,
            comision: 25000,
            valorCobrar: 719000,
            estado: 'Confirmada',
            bancoOrigen: 'Bancolombia',
            referenciaAprobacion: 'BCO-445100',
            comprobanteUrl: 'demo-receipt-09.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-18T09:40:11',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Confirmado.'
                }
            ]
        },
        {
            id: 'OP-DEMO-1010',
            posId: 'DEMO-POS-06',
            posNombre: '[DEMO] Punto de Venta 06 - Envigado La Mina',
            fecha: '2026-02-17T15:02:59',
            codigoTarifa: 512,
            vehiculoDescripcion: 'Vehículo familiar, <1.500 c.c., 10 o más años',
            servicio: 'Particular',
            placa: 'HHT-901',
            valorConsignar: 612900,
            comision: 25000,
            valorCobrar: 638000,
            estado: 'Confirmada',
            bancoOrigen: 'Nequi',
            referenciaAprobacion: 'NQ-882910',
            comprobanteUrl: 'demo-receipt-10.png',
            motivoRechazo: null,
            historial: [
                {
                    fecha: '2026-02-17T15:02:59',
                    estado: 'Confirmada',
                    autor: 'Héctor Vargas (Proveedor)',
                    nota: 'Confirmado.'
                }
            ]
        }
    ];

    return {
        DATOS_CONSIGNACION_PROVEEDOR,
        ESQUEMAS_COMISION_BASE,
        PUNTOS_DE_VENTA_DEMO,
        USUARIOS_DEMO,
        OPERACIONES_DEMO_INICIALES
    };
});
