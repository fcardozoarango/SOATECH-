/**
 * ============================================================================
 * ORQUESTADOR PRINCIPAL DE LA PLATAFORMA SOATECH 2026
 * ============================================================================
 * Gestiona la navegación entre perfiles (Administrador vs. Punto de Venta),
 * la reactividad de la calculadora, el renderizado de módulos administrativos,
 * los datos de consignación con copiado rápido, el monitoreo de operaciones,
 * el flujo de registro/revisión/confirmación/rechazo/reenvío de comprobantes
 * y el tutorial minimizable para administración de puntos de venta.
 *
 * IMPORTANTE:
 *   - Este archivo NO modifica tarifas.js ni calculadora.js.
 *   - Los valores oficiales SOAT provienen exclusivamente de TARIFAS y CALC.
 *   - Soporte técnico SOATECH: +57 324 442 5912 (azul)
 *   - Soporte proveedor Héctor: 320 338 80 51 (verde) — números diferentes.
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // Servicios y módulos maestros
    // -------------------------------------------------------------------------
    const TARIFAS = window.SOAT_TARIFAS;
    const CALC = window.SOAT_CALCULADORA;
    const POS_SERVICE = window.SOATECH_POS;
    const AUTH_SERVICE = window.SOATECH_AUTH;
    const STORAGE = window.SOATECH_STORAGE;
    const CONSIGNACION_SERVICE = window.SOATECH_CONSIGNACION;
    const OPERACIONES_SERVICE = window.SOATECH_OPERACIONES;

    if (!TARIFAS || !CALC) {
        console.error('SOATECH: No se pudieron cargar los módulos maestros de tarifas o calculadora.');
        return;
    }

    /* ------------------------------------------------------------------------
     * 1. Estado Global de la Sesión y de la Calculadora
     * --------------------------------------------------------------------- */
    let usuarioActual = null;
    let posActivo = null;
    let vistaActiva = 'calculadora';
    let ultimaLiquidacion = null;
    let posParaEditarComisiones = null;
    /* =========================================================================
     * 1. ESTADO GLOBAL DE LA SESIÓN Y DE LA CALCULADORA
     * ====================================================================== */
    let usuarioActual = null;   // Usuario demo activo
    let posActivo = null;   // Punto de venta seleccionado
    let vistaActiva = 'calculadora';
    let ultimaLiquidacion = null;   // Resultado del último cálculo exitoso
    let posParaEditarComisiones = null; // POS en edición en el modal de comisiones

    // Parámetros actuales de la calculadora
    const estadoCalc = {
        svc: null,   // 'par' | 'pub' | 'ofi'
        svc: null,  // 'par' | 'pub' | 'ofi'
        type: null,  // 'moto', 'fam', 'cam', etc.
        cc: null,
        cc: null,
        year: null,
        ton: null,
        pax: null,
        p6: null
        ton: null,
        pax: null,
        p6: null
    };

    let animFrame = null;
    let ultimoCobro = 0;
    let animFrame = null;
    let ultimoCobro = 0;
    let ultimoConsignar = 0;
    let timerValidacion = {};
    const PREFIERE_MOVIMIENTO_REDUCIDO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PREFIERE_MOVIMIENTO_REDUCIDO =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------------
     * 2. Colección de Iconos SVG Minimalistas
     * --------------------------------------------------------------------- */
    /* =========================================================================
     * 2. COLECCIÓN DE ICONOS SVG MINIMALISTAS
     * ====================================================================== */
    const ICONOS = {
        car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
        moto: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="M12 17h4l4-8h-5l-3 4H8l-3-4H2"/></svg>',
        car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
        moto: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="M12 17h4l4-8h-5l-3 4H8l-3-4H2"/></svg>',
        truck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
        bus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M8 3v8"/><path d="M16 3v8"/><path d="M4 15h16"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>',
        tri: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14l5-7h4l3 7"/><path d="M11 7h4v4h-5z"/></svg>',
        copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        bus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M8 3v8"/><path d="M16 3v8"/><path d="M4 15h16"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>',
        tri: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14l5-7h4l3 7"/><path d="M11 7h4v4h-5z"/></svg>',
        copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
        sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    };

    /* ------------------------------------------------------------------------
     * 3. Referencias al DOM
     * --------------------------------------------------------------------- */
    /* =========================================================================
     * 3. REFERENCIAS AL DOM
     * ====================================================================== */
    const dom = {
        themeToggle: document.getElementById('btnThemeToggle'),
        btnReset: document.getElementById('btnReset'),
        avisoVigencia: document.getElementById('avisoVigencia'),
        mainNavTabs: document.getElementById('mainNavTabs'),
        headerRoleBadge: document.getElementById('headerRoleBadge'),
        themeToggle: document.getElementById('btnThemeToggle'),
        btnReset: document.getElementById('btnReset'),
        avisoVigencia: document.getElementById('avisoVigencia'),
        mainNavTabs: document.getElementById('mainNavTabs'),
        headerRoleBadge: document.getElementById('headerRoleBadge'),

        // Barra Demo
        demoActiveProfileName: document.getElementById('demoActiveProfileName'),
        btnOpenProfileModal: document.getElementById('btnOpenProfileModal'),
        selectDemoPos: document.getElementById('selectDemoPos'),
        demoSchemeTag: document.getElementById('demoSchemeTag'),
        btnDemoResetFactory: document.getElementById('btnDemoResetFactory'),
        btnOpenProfileModal: document.getElementById('btnOpenProfileModal'),
        selectDemoPos: document.getElementById('selectDemoPos'),
        demoSchemeTag: document.getElementById('demoSchemeTag'),
        btnDemoResetFactory: document.getElementById('btnDemoResetFactory'),

        // Vistas
        views: {
            calculadora: document.getElementById('viewCalculadora'),
            admin_dashboard: document.getElementById('viewAdminDashboard'),
            admin_pos: document.getElementById('viewAdminPos'),
            admin_consignacion: document.getElementById('viewAdminConsignacion'),
            admin_operaciones: document.getElementById('viewAdminOperaciones'),
            pos_consignacion: document.getElementById('viewPosConsignacion'),
            pos_comisiones: document.getElementById('viewPosComisiones'),
            pos_operaciones: document.getElementById('viewPosOperaciones'),
            pos_soporte: document.getElementById('viewPosSoporte')
            calculadora: document.getElementById('viewCalculadora'),
            admin_dashboard: document.getElementById('viewAdminDashboard'),
            admin_pos: document.getElementById('viewAdminPos'),
            admin_consignacion: document.getElementById('viewAdminConsignacion'),
            admin_operaciones: document.getElementById('viewAdminOperaciones'),
            pos_consignacion: document.getElementById('viewPosConsignacion'),
            pos_comisiones: document.getElementById('viewPosComisiones'),
            pos_operaciones: document.getElementById('viewPosOperaciones'),
            pos_soporte: document.getElementById('viewPosSoporte')
        },

        // Calculadora
        stepCard1: document.getElementById('stepCard1'),
        stepCard2: document.getElementById('stepCard2'),
        stepCard3: document.getElementById('stepCard3'),
        stepTag1: document.getElementById('stepTag1'),
        stepTag2: document.getElementById('stepTag2'),
        stepTag3: document.getElementById('stepTag3'),
        servicesGrid: document.getElementById('servicesGrid'),
        typesCatalog: document.getElementById('typesCatalog'),
        paramsContainer: document.getElementById('paramsContainer'),
        summaryContainer: document.getElementById('summaryContainer'),
        summaryHeaderPos: document.getElementById('summaryHeaderPos'),
        tableSearch: document.getElementById('tableSearch'),
        tariffsTableBody: document.getElementById('tariffsTableBody'),
        stepCard1: document.getElementById('stepCard1'),
        stepCard2: document.getElementById('stepCard2'),
        stepCard3: document.getElementById('stepCard3'),
        stepTag1: document.getElementById('stepTag1'),
        stepTag2: document.getElementById('stepTag2'),
        stepTag3: document.getElementById('stepTag3'),
        servicesGrid: document.getElementById('servicesGrid'),
        typesCatalog: document.getElementById('typesCatalog'),
        paramsContainer: document.getElementById('paramsContainer'),
        summaryContainer: document.getElementById('summaryContainer'),
        summaryHeaderPos: document.getElementById('summaryHeaderPos'),
        tableSearch: document.getElementById('tableSearch'),
        tariffsTableBody: document.getElementById('tariffsTableBody'),

        // Modales
        modalDemoAuth: document.getElementById('modalDemoAuth'),
        btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
        btnCancelAuthModal: document.getElementById('btnCancelAuthModal'),
        // ---- Modal 1: Selector de perfiles demo ----
        modalDemoAuth: document.getElementById('modalDemoAuth'),
        btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
        btnCancelAuthModal: document.getElementById('btnCancelAuthModal'),
        btnSelectAdminProfile: document.getElementById('btnSelectAdminProfile'),
        btnSelectPos1Profile: document.getElementById('btnSelectPos1Profile'),
        btnSelectPos2Profile: document.getElementById('btnSelectPos2Profile'),
        btnSelectPos1Profile: document.getElementById('btnSelectPos1Profile'),
        btnSelectPos2Profile: document.getElementById('btnSelectPos2Profile'),

        modalEditComisiones: document.getElementById('modalEditComisiones'),
        editComisionesTitle: document.getElementById('editComisionesTitle'),
        btnCloseComisionesModal: document.getElementById('btnCloseComisionesModal'),
        // ---- Modal 2: Editor de comisiones (Admin) ----
        modalEditComisiones: document.getElementById('modalEditComisiones'),
        editComisionesTitle: document.getElementById('editComisionesTitle'),
        btnCloseComisionesModal: document.getElementById('btnCloseComisionesModal'),
        btnCancelComisionesModal: document.getElementById('btnCancelComisionesModal'),
        btnSaveComisionesModal: document.getElementById('btnSaveComisionesModal'),
        comisionesFormContainer: document.getElementById('comisionesFormContainer'),
        btnSaveComisionesModal: document.getElementById('btnSaveComisionesModal'),
        comisionesFormContainer: document.getElementById('comisionesFormContainer'),

        // Contenedores dinámicos de módulos
        adminKpiGrid: document.getElementById('adminKpiGrid'),
        adminPosTableBody: document.getElementById('adminPosTableBody'),
        searchPosInput: document.getElementById('searchPosInput'),
        adminConsignacionForms: document.getElementById('adminConsignacionForms'),
        btnSaveConsignacionAdmin: document.getElementById('btnSaveConsignacionAdmin'),
        // ---- Modal 3: Detalle de operación (Admin — Héctor revisa comprobante) ----
        modalDetalleOperacionAdmin: document.getElementById('modalDetalleOperacionAdmin'),
        detalleOpBody: document.getElementById('detalleOpBody'),
        detalleOpFooter: document.getElementById('detalleOpFooter'),
        btnCerrarDetalleOpModal: document.getElementById('btnCerrarDetalleOpModal'),

        // ---- Modal 4: Registro de pago (POS registra operación con comprobante) ----
        modalRegistroPagoPos: document.getElementById('modalRegistroPagoPos'),
        registroPagoBody: document.getElementById('registroPagoBody'),
        btnCerrarRegistroPagoPos: document.getElementById('btnCerrarRegistroPagoPos'),
        btnCancelarPagoPos: document.getElementById('btnCancelarPagoPos'),
        btnEnviarPagoPos: document.getElementById('btnEnviarPagoPos'),

        // ---- Modal 5: Corregir y reenviar comprobante rechazado (POS) ----
        modalCorregirPagoPos: document.getElementById('modalCorregirPagoPos'),
        corregirPagoBody: document.getElementById('corregirPagoBody'),
        btnCerrarCorregirPagoPos: document.getElementById('btnCerrarCorregirPagoPos'),
        btnCancelarCorregirPos: document.getElementById('btnCancelarCorregirPos'),
        btnEnviarCorregirPos: document.getElementById('btnEnviarCorregirPos'),

        // Contenedores dinámicos — Admin
        adminKpiGrid: document.getElementById('adminKpiGrid'),
        adminPosTableBody: document.getElementById('adminPosTableBody'),
        searchPosInput: document.getElementById('searchPosInput'),
        adminConsignacionForms: document.getElementById('adminConsignacionForms'),
        btnSaveConsignacionAdmin: document.getElementById('btnSaveConsignacionAdmin'),
        adminOperacionesTableBody: document.getElementById('adminOperacionesTableBody'),
        filterPosSelect: document.getElementById('filterPosSelect'),
        searchOperacionesInput: document.getElementById('searchOperacionesInput'),
        posConsignacionCards: document.getElementById('posConsignacionCards'),
        filterPosSelect: document.getElementById('filterPosSelect'),
        filterEstadoSelectAdmin: document.getElementById('filterEstadoSelectAdmin'),
        searchOperacionesInput: document.getElementById('searchOperacionesInput'),

        // Contenedores dinámicos — POS
        posConsignacionCards: document.getElementById('posConsignacionCards'),
        posComisionesTableBody: document.getElementById('posComisionesTableBody'),
        posOperacionesTableBody: document.getElementById('posOperacionesTableBody')
        posOperacionesTableBody: document.getElementById('posOperacionesTableBody'),
        filterEstadoSelectPos: document.getElementById('filterEstadoSelectPos'),

        // Tutorial minimizable en Vista C (Admin POS)
        tutorialPosBanner: document.getElementById('tutorialPosBanner'),
        btnMinimizarTutorialPos: document.getElementById('btnMinimizarTutorialPos'),
        containerRestaurarTutorialPos: document.getElementById('containerRestaurarTutorialPos'),
        btnRestaurarTutorialPos: document.getElementById('btnRestaurarTutorialPos')
    };

    /* ------------------------------------------------------------------------
     * 4. Inicialización de la Plataforma
     * --------------------------------------------------------------------- */
    /* =========================================================================
     * 4. INICIALIZACIÓN DE LA PLATAFORMA
     * ====================================================================== */
    async function init() {
        await cargarSesionInicial();
        renderServicios();
        renderTiposVehiculo();
        renderCamposParametros();
        renderTablaMaestra();
        verificarVigenciaTarifa();
        inicializarTema();
        configurarEventosGlobales();
        sincronizarVista();
        aplicarEstadoTutorial();
    }

    /**
     * Carga la sesión demo activa y configura el perfil.
     */
    async function cargarSesionInicial() {
        usuarioActual = await AUTH_SERVICE.getSesionActual();
        const puntos = await POS_SERVICE.getPuntosVenta();
        const puntos = await POS_SERVICE.getPuntosVenta();

        // Si es perfil POS, fija el posActivo de su cuenta; si es Admin, usa el seleccionado
        if (usuarioActual.rol === 'pos' && usuarioActual.posId) {
            posActivo = puntos.find(p => p.id === usuarioActual.posId) || puntos[0];
        } else {
            posActivo = puntos.find(p => p.estado === 'activo') || puntos[0];
        }

        poblarSelectorPuntosDemo(puntos);
        actualizarIndicadoresPerfil();
        construirMenuNavegacion();
        cambiarVista(usuarioActual.rol === 'admin' ? 'admin_dashboard' : 'calculadora');
    }

    function poblarSelectorPuntosDemo(puntos) {
        if (!dom.selectDemoPos) return;
        dom.selectDemoPos.innerHTML = puntos.map(p => `
            <option value="${p.id}" ${p.estado === 'inactivo' ? 'disabled' : ''}>
                ${p.nombre} ${p.estado === 'inactivo' ? '(Inactivo)' : ''}
            </option>
        `).join('');

        if (posActivo) {
            dom.selectDemoPos.value = posActivo.id;
        }
    }

    function actualizarIndicadoresPerfil() {
        if (!usuarioActual) return;

        if (dom.demoActiveProfileName) {
            dom.demoActiveProfileName.textContent = `${usuarioActual.nombre} (${usuarioActual.rolEtiqueta})`;
            dom.demoActiveProfileName.textContent =
                `${usuarioActual.nombre} (${usuarioActual.rolEtiqueta})`;
        }

        if (dom.headerRoleBadge) {
            dom.headerRoleBadge.textContent = usuarioActual.rol === 'admin' ? 'Proveedor' : 'Punto de Venta';
            dom.headerRoleBadge.textContent =
                usuarioActual.rol === 'admin' ? 'Proveedor' : 'Punto de Venta';
        }

        if (dom.summaryHeaderPos && posActivo) {
            dom.summaryHeaderPos.textContent = posActivo.nombre.replace('[DEMO] ', '');
        }

        if (dom.demoSchemeTag && posActivo) {
            const numRangos = posActivo.comisiones ? posActivo.comisiones.length : 2;
            dom.demoSchemeTag.textContent = `${numRangos} rangos configurados`;
        }

        // Si es usuario POS, deshabilita el selector de la barra para simular aislamiento
        if (dom.selectDemoPos) {
            dom.selectDemoPos.disabled = (usuarioActual.rol === 'pos');
            if (usuarioActual.rol === 'pos' && usuarioActual.posId) {
                dom.selectDemoPos.value = usuarioActual.posId;
            }
        }
    }

    /* ------------------------------------------------------------------------
     * 5. Navegación por Pestañas y Control de Vistas
     * --------------------------------------------------------------------- */
    /* =========================================================================
     * 5. NAVEGACIÓN POR PESTAÑAS Y CONTROL DE VISTAS
     * ====================================================================== */
    function construirMenuNavegacion() {
        if (!dom.mainNavTabs) return;

        let tabs = [];
        if (usuarioActual.rol === 'admin') {
            tabs = [
                { id: 'admin_dashboard', label: '📊 Resumen General', default: true },
                { id: 'admin_pos', label: '🏢 Puntos de Venta (20)' },
                { id: 'admin_dashboard', label: '📊 Resumen General', default: true },
                { id: 'admin_pos', label: '🏢 Puntos de Venta (20)' },
                { id: 'admin_consignacion', label: '💳 Cuentas del Proveedor' },
                { id: 'admin_operaciones', label: '📋 Monitoreo de Operaciones' },
                { id: 'calculadora', label: '🧮 Calculadora SOAT' }
                { id: 'admin_operaciones', label: '📋 Monitoreo de Operaciones' },
                { id: 'calculadora', label: '🧮 Calculadora SOAT' }
            ];
        } else {
            tabs = [
                { id: 'calculadora', label: '🧮 Calculadora SOAT', default: true },
                { id: 'calculadora', label: '🧮 Calculadora SOAT', default: true },
                { id: 'pos_consignacion', label: '💳 Cuentas para Consignar' },
                { id: 'pos_comisiones', label: '📈 Mis Comisiones' },
                { id: 'pos_operaciones', label: '📑 Mis Operaciones' },
                { id: 'pos_soporte', label: '💬 Soporte WhatsApp' }
                { id: 'pos_comisiones', label: '📈 Mis Comisiones' },
                { id: 'pos_operaciones', label: '📑 Mis Operaciones' },
                { id: 'pos_soporte', label: '💬 Soporte WhatsApp' }
            ];
        }

        dom.mainNavTabs.innerHTML = tabs.map(t => `
            <button type="button" class="nav-tab-btn ${t.id === vistaActiva ? 'active' : ''}" data-target-view="${t.id}">
            <button type="button"
                    class="nav-tab-btn ${t.id === vistaActiva ? 'active' : ''}"
                    data-target-view="${t.id}">
                <span>${t.label}</span>
            </button>
        `).join('');
    }

    async function cambiarVista(idVista) {
        vistaActiva = idVista;

        // Ocultar todas las vistas
        Object.keys(dom.views).forEach(key => {
            if (dom.views[key]) dom.views[key].style.display = 'none';
        });

        // Mostrar la vista seleccionada
        if (dom.views[idVista]) {
            // La calculadora usa layout block; las demás usan flex
            dom.views[idVista].style.display = (idVista === 'calculadora') ? 'block' : 'flex';
        }

        // Actualizar pestañas activas
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            const esActiva = btn.getAttribute('data-target-view') === idVista;
            btn.classList.toggle('active', esActiva);
        });

        // Cargar datos correspondientes a la vista
        if (idVista === 'admin_dashboard') await renderAdminDashboard();
        if (idVista === 'admin_pos') await renderAdminPosTable();
        if (idVista === 'admin_dashboard') await renderAdminDashboard();
        if (idVista === 'admin_pos') { await renderAdminPosTable(); aplicarEstadoTutorial(); }
        if (idVista === 'admin_consignacion') await renderAdminConsignacionForm();
        if (idVista === 'admin_operaciones') await renderAdminOperacionesTable();
        if (idVista === 'pos_consignacion') await renderPosConsignacionCards();
        if (idVista === 'pos_comisiones') await renderPosComisionesTable();
        if (idVista === 'pos_operaciones') await renderPosOperacionesTable();
        if (idVista === 'admin_operaciones') await renderAdminOperacionesTable();
        if (idVista === 'pos_consignacion') await renderPosConsignacionCards();
        if (idVista === 'pos_comisiones') await renderPosComisionesTable();
        if (idVista === 'pos_operaciones') await renderPosOperacionesTable();
    }

    /* ------------------------------------------------------------------------
     * 6. Renderizado de Módulos del Administrador
     * --------------------------------------------------------------------- */
    /* =========================================================================
     * 6. RENDERIZADO DE MÓDULOS DEL ADMINISTRADOR
     * ====================================================================== */

    async function renderAdminDashboard() {
        const metricas = await OPERACIONES_SERVICE.getMetricasResumen();
        dom.adminKpiGrid.innerHTML = `
            <div class="kpi-card">
                <span class="kpi-card-title">Puntos de Venta Conectados</span>
                <span class="kpi-card-value">${metricas.posActivos} <span style="font-size:16px;color:var(--text-muted);font-weight:600;">/ ${metricas.posTotal}</span></span>
                <span class="kpi-card-value">${metricas.posActivos}
                    <span style="font-size:16px;color:var(--text-muted);font-weight:600;">
                        / ${metricas.posTotal}
                    </span>
                </span>
                <span class="kpi-card-sub" style="color:var(--success-solid);">✓ Red operativa activa</span>
            </div>
            <div class="kpi-card">
                <span class="kpi-card-title">Total Operaciones Emitidas</span>
                <span class="kpi-card-value">${metricas.totalOperaciones}</span>
                <span class="kpi-card-sub">Transacciones registradas en demo</span>
            </div>
            <div class="kpi-card">
                <span class="kpi-card-title">Monto Oficial Consignado</span>
                <span class="kpi-card-value">${CALC.formatearMoneda(metricas.totalConsignado)}</span>
                <span class="kpi-card-sub">Transferido a cuentas de Héctor Vargas</span>
            </div>
            <div class="kpi-card">
                <span class="kpi-card-title">Comisiones de la Red</span>
                <span class="kpi-card-value" style="color:var(--accent-primary);">${CALC.formatearMoneda(metricas.totalComisiones)}</span>
                <span class="kpi-card-value" style="color:var(--accent-primary);">
                    ${CALC.formatearMoneda(metricas.totalComisiones)}
                </span>
                <span class="kpi-card-sub">Ganancia generada para puntos de venta</span>
            </div>
        `;
    }

    async function renderAdminPosTable(filtro = '') {
        const puntos = await POS_SERVICE.getPuntosVenta();
        const clean = filtro.toLowerCase().trim();
        const filtrados = puntos.filter(p => !clean || p.nombre.toLowerCase().includes(clean) || p.ciudad.toLowerCase().includes(clean));
        const clean = filtro.toLowerCase().trim();
        const filtrados = puntos.filter(p =>
            !clean ||
            p.nombre.toLowerCase().includes(clean) ||
            p.ciudad.toLowerCase().includes(clean)
        );

        dom.adminPosTableBody.innerHTML = filtrados.map(p => {
            const numRangos = p.comisiones ? p.comisiones.length : 2;
            const comisionMuestra = p.comisiones ? `${CALC.formatearMoneda(p.comisiones[0].comision)} / ${CALC.formatearMoneda(p.comisiones[p.comisiones.length - 1].comision)}` : '$25.000 / $30.000';
            const numRangos = p.comisiones ? p.comisiones.length : 2;
            const comisionMuestra = p.comisiones
                ? `${CALC.formatearMoneda(p.comisiones[0].comision)} / ${CALC.formatearMoneda(p.comisiones[p.comisiones.length - 1].comision)}`
                : '$25.000 / $30.000';
            return `
                <tr>
                    <td><span class="code-pill">${p.codigo}</span></td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${p.ciudad} (${p.departamento})</td>
                    <td>${p.responsable}</td>
                    <td>
                        <span class="status-badge ${p.estado}">
                            <span class="dot"></span> ${p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            <span class="dot"></span>
                            ${p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td><span style="font-size:12.5px;color:var(--text-secondary);">${numRangos} rangos (${comisionMuestra})</span></td>
                    <td>
                        <span style="font-size:12.5px;color:var(--text-secondary);">
                            ${numRangos} rangos (${comisionMuestra})
                        </span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                        <button type="button" class="btn-action-sm btn-toggle-status" data-action="toggle-pos" data-pos-id="${p.id}">
                        <button type="button" class="btn-action-sm btn-toggle-status"
                                data-action="toggle-pos" data-pos-id="${p.id}">
                            ${p.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button type="button" class="btn-action-sm" data-action="edit-comision" data-pos-id="${p.id}" style="margin-left:4px;">
                        <button type="button" class="btn-action-sm"
                                data-action="edit-comision" data-pos-id="${p.id}"
                                style="margin-left:4px;">
                            ⚙️ Comisiones
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function renderAdminConsignacionForm() {
        const consignacion = await CONSIGNACION_SERVICE.getDatosConsignacion();
        const titular = consignacion.titular || {};
        const cuentas = consignacion.cuentas || [];
        const titular = consignacion.titular || {};
        const cuentas = consignacion.cuentas || [];

        dom.adminConsignacionForms.innerHTML = `
            <div class="account-edit-card" style="grid-column: 1 / -1;">
                <h4 class="account-card-title">Información del Titular Principal</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
                    <div class="form-group">
                        <label class="form-label">Nombre del Titular:</label>
                        <input type="text" id="inputTitularNombre" class="form-input" value="${titular.nombre || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Número de Identificación (Cédula):</label>
                        <input type="text" id="inputTitularCedula" class="form-input" value="${titular.documentoNumero || ''}">
                    </div>
                </div>
            </div>
            ${cuentas.map(c => `
                <div class="account-edit-card">
                <div class="account-edit-card" data-bank-id="${c.id}">
                    <div class="account-card-title">
                        <span>${c.entidad}</span>
                        <label style="font-size:12px;cursor:pointer;">
                            <input type="checkbox" data-account-toggle="${c.id}" ${c.activo ? 'checked' : ''}> Habilitada
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de cuenta / producto:</label>
                        <input type="text" data-account-tipo="${c.id}" class="form-input" value="${c.tipoCuenta}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Número de cuenta o teléfono:</label>
                        <input type="text" data-account-num="${c.id}" class="form-input" value="${c.numero}">
                    </div>
                    ${c.llave !== undefined ? `
                        <div class="form-group">
                            <label class="form-label">Llave Daviplata:</label>
                            <input type="text" data-account-llave="${c.id}" class="form-input" value="${c.llave}">
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        `;
    }

    /**
     * Renderiza la tabla de operaciones del Administrador.
     * Incluye filtros por punto de venta, estado y búsqueda de texto.
     * Columna "Detalle" abre el modal de revisión de comprobante.
     *
     * @param {Object} filtros - { posId, estado, terminoBusqueda }
     */
    async function renderAdminOperacionesTable(filtros = {}) {
        const ops = await OPERACIONES_SERVICE.getOperaciones(filtros);
        const ops = await OPERACIONES_SERVICE.getOperaciones(filtros);
        const puntos = await POS_SERVICE.getPuntosVenta();

        // Poblar selector de filtro de puntos de venta si está vacío
        // Poblar selector de filtro de puntos si está vacío
        if (dom.filterPosSelect && dom.filterPosSelect.options.length <= 1) {
            dom.filterPosSelect.innerHTML = '<option value="">Todos los puntos de venta</option>' + puntos.map(p => `
                <option value="${p.id}">${p.nombre}</option>
            `).join('');
            dom.filterPosSelect.innerHTML =
                '<option value="">Todos los puntos de venta</option>' +
                puntos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }

        dom.adminOperacionesTableBody.innerHTML = ops.length === 0 ? `
            <tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">No se encontraron operaciones con los filtros seleccionados.</td></tr>
        ` : ops.map(o => `
            <tr>
                <td><span class="code-pill">${o.id}</span></td>
                <td><strong>${o.posNombre}</strong></td>
                <td>${formatearFechaHora(o.fecha)}</td>
                <td>${o.vehiculoDescripcion} <small style="display:block;color:var(--text-muted);">${o.servicio}</small></td>
                <td class="col-amount">${CALC.formatearMoneda(o.valorConsignar)}</td>
                <td class="col-amount" style="color:var(--accent-primary);">${CALC.formatearMoneda(o.comision)}</td>
                <td class="col-amount" style="font-weight:700;">${CALC.formatearMoneda(o.valorCobrar)}</td>
                <td><span class="status-badge activo"><span class="dot"></span> ${o.estado}</span></td>
            </tr>
        `).join('');
        dom.adminOperacionesTableBody.innerHTML = ops.length === 0
            ? `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);">
                    No se encontraron operaciones con los filtros seleccionados.
               </td></tr>`
            : ops.map(o => {
                const claseEstado = obtenerClaseEstadoOp(o.estado);
                return `
                    <tr>
                        <td><span class="code-pill">${o.id}</span></td>
                        <td><strong>${o.posNombre}</strong></td>
                        <td>${formatearFechaHora(o.fecha)}</td>
                        <td>${o.placa ? `<span class="code-pill">${o.placa}</span>` : '—'}</td>
                        <td>${o.vehiculoDescripcion}
                            <small style="display:block;color:var(--text-muted);">${o.servicio}</small>
                        </td>
                        <td class="col-amount">${CALC.formatearMoneda(o.valorConsignar)}</td>
                        <td class="col-amount" style="color:var(--accent-primary);">
                            ${CALC.formatearMoneda(o.comision)}
                        </td>
                        <td>
                            <span class="status-badge ${claseEstado}">
                                <span class="dot"></span> ${o.estado}
                            </span>
                        </td>
                        <td>
                            <button type="button"
                                    class="btn-action-sm btn-detail-row"
                                    data-action="ver-detalle-op"
                                    data-op-id="${o.id}">
                                Ver Detalle
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
    }

    /* ------------------------------------------------------------------------
     * 7. Renderizado de Módulos del Punto de Venta
     * --------------------------------------------------------------------- */
    /**
     * Convierte el texto de estado a la clase CSS semántica.
     * Clases: pendiente (naranja), confirmada (verde), rechazada (rojo).
     *
     * @param {string} estado
     * @returns {string} Clase CSS
     */
    function obtenerClaseEstadoOp(estado) {
        if (!estado) return 'activo';
        const e = estado.toLowerCase();
        if (e.includes('pendiente')) return 'pendiente';
        if (e.includes('confirmada')) return 'confirmada';
        if (e.includes('rechazada')) return 'rechazada';
        return 'activo';
    }

    /* =========================================================================
     * 7. RENDERIZADO DE MÓDULOS DEL PUNTO DE VENTA
     * ====================================================================== */

    /**
     * Renderiza las tarjetas de cuentas bancarias del proveedor para el POS.
     * Incluye el banner de soporte del proveedor (Héctor, verde) al final.
     * NO modifica el bloque estático de soporte; solo inyecta las tarjetas.
     */
    async function renderPosConsignacionCards() {
        const consignacion = await CONSIGNACION_SERVICE.getDatosConsignacion();
        const titular = consignacion.titular || {};
        const cuentas = (consignacion.cuentas || []).filter(c => c.activo !== false);
        const titular = consignacion.titular || {};
        const cuentas = (consignacion.cuentas || []).filter(c => c.activo !== false);

        dom.posConsignacionCards.innerHTML = cuentas.map(c => `
            <div class="bank-card">
                <div>
                    <div class="bank-card-header">
                        <span class="bank-brand">${c.entidad}</span>
                        <span class="bank-badge">${c.tipoCuenta}</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);">Número de cuenta / Transferencia:</div>
                    <div class="bank-account-num">${c.numero}</div>
                    <div style="display:flex;gap:8px;margin-top:6px;">
                        <button type="button" class="btn-copy" data-copy-val="${c.numero}">
                            ${ICONOS.copy} <span>Copiar número</span>
                        </button>
                        ${c.llave ? `
                            <button type="button" class="btn-copy" data-copy-val="${c.llave}">
                                ${ICONOS.copy} <span>Copiar llave (${c.llave})</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="bank-card-footer">
                    <div>
                        <div class="bank-holder-label">Titular de la cuenta:</div>
                        <div class="bank-holder-name">${titular.nombre}</div>
                        <div style="font-size:11.5px;color:var(--text-muted);">CC: ${titular.documentoNumero}</div>
                    </div>
                </div>
            </div>
        `).join('');
        // Nota: el bloque support-provider-card (Héctor Vargas, verde) está estático
        // en INDEX.html bajo posConsignacionCards y no se toca aquí.
    }

    async function renderPosComisionesTable() {
        if (!posActivo) return;
        const rangos = posActivo.comisiones || [];

        dom.posComisionesTableBody.innerHTML = rangos.map((r, i) => {
            const desdeTxt = r.desde ? CALC.formatearMoneda(r.desde) : '$0';
            const hastaTxt = r.hasta ? CALC.formatearMoneda(r.hasta) : 'En adelante';
            return `
                <tr>
                    <td><strong>${desdeTxt}</strong> hasta <strong>${hastaTxt}</strong></td>
                    <td class="col-amount" style="color:var(--success-solid);font-size:15px;font-weight:700;">
                        ${CALC.formatearMoneda(r.comision)}
                    </td>
                    <td>${r.etiqueta || `Rango ${i + 1}`}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Renderiza la tabla de operaciones del Punto de Venta.
     * Incluye filtro por estado y columna de acción para corregir rechazadas.
     */
    async function renderPosOperacionesTable() {
        if (!posActivo) return;
        const ops = await OPERACIONES_SERVICE.getOperaciones({ posId: posActivo.id });

        dom.posOperacionesTableBody.innerHTML = ops.length === 0 ? `
            <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Aún no tienes operaciones registradas en este punto de venta. Realiza una cotización en la calculadora y presiona "Registrar Venta Demo".</td></tr>
        ` : ops.map(o => `
            <tr>
                <td><span class="code-pill">${o.id}</span></td>
                <td>${formatearFechaHora(o.fecha)}</td>
                <td>${o.vehiculoDescripcion} <small style="display:block;color:var(--text-muted);">${o.servicio}</small></td>
                <td class="col-amount">${CALC.formatearMoneda(o.valorConsignar)}</td>
                <td class="col-amount" style="color:var(--success-solid);">${CALC.formatearMoneda(o.comision)}</td>
                <td class="col-amount" style="font-weight:700;">${CALC.formatearMoneda(o.valorCobrar)}</td>
                <td><span class="status-badge activo"><span class="dot"></span> ${o.estado}</span></td>
            </tr>
        `).join('');
        // Leer filtro de estado si está disponible
        const filtroEstado = dom.filterEstadoSelectPos ? dom.filterEstadoSelectPos.value : '';
        const filtros = { posId: posActivo.id };
        if (filtroEstado) filtros.estado = filtroEstado;

        const ops = await OPERACIONES_SERVICE.getOperaciones(filtros);

        dom.posOperacionesTableBody.innerHTML = ops.length === 0
            ? `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">
                    Aún no tienes operaciones registradas en este punto de venta.
                    Realiza una cotización en la calculadora y presiona "Registrar Operación Demo".
               </td></tr>`
            : ops.map(o => {
                const claseEstado = obtenerClaseEstadoOp(o.estado);
                const esRechazada = o.estado === 'Rechazada';
                return `
                    <tr>
                        <td><span class="code-pill">${o.id}</span></td>
                        <td>${formatearFechaHora(o.fecha)}</td>
                        <td>${o.vehiculoDescripcion}
                            <small style="display:block;color:var(--text-muted);">${o.servicio}</small>
                        </td>
                        <td class="col-amount">${CALC.formatearMoneda(o.valorConsignar)}</td>
                        <td class="col-amount" style="color:var(--success-solid);">
                            ${CALC.formatearMoneda(o.comision)}
                        </td>
                        <td class="col-amount" style="font-weight:700;">
                            ${CALC.formatearMoneda(o.valorCobrar)}
                        </td>
                        <td>
                            <span class="status-badge ${claseEstado}">
                                <span class="dot"></span> ${o.estado}
                            </span>
                        </td>
                        <td>
                            ${esRechazada
                        ? `<button type="button"
                                           class="btn-action-sm"
                                           data-action="corregir-op"
                                           data-op-id="${o.id}">
                                       🔄 Corregir y Reenviar
                                   </button>`
                        : '—'}
                        </td>
                    </tr>
                `;
            }).join('');
    }

    /* ------------------------------------------------------------------------
     * 8. Lógica de la Calculadora SOAT y Liquidación
     * --------------------------------------------------------------------- */
    /* =========================================================================
     * 8. LÓGICA DE LA CALCULADORA SOAT Y LIQUIDACIÓN
     * ====================================================================== */

    function renderServicios() {
        dom.servicesGrid.innerHTML = Object.keys(TARIFAS.SERVICIOS).map(key => {
            const s = TARIFAS.SERVICIOS[key];
            return `<button type="button" class="service-btn" data-service="${s.id}"><span class="service-btn-title">${s.nombre}</span><span class="service-btn-desc">${s.tag}</span></button>`;
            return `<button type="button" class="service-btn" data-service="${s.id}">
                        <span class="service-btn-title">${s.nombre}</span>
                        <span class="service-btn-desc">${s.tag}</span>
                    </button>`;
        }).join('');
    }

    function renderTiposVehiculo() {
        dom.typesCatalog.innerHTML = TARIFAS.GRUPOS.map(grupo => `
            <div class="types-category-group">
                <div class="category-group-title">${grupo.nombre}</div>
                <div class="types-grid">
                    ${grupo.tipos.map(id => {
            const tipo = TARIFAS.TIPOS.find(t => t.id === id);
            if (!tipo) return '';
            return `<button type="button" class="type-card" data-vehicle-type="${tipo.id}"><div class="type-card-icon">${ICONOS[tipo.icono] || ICONOS.car}</div><div class="type-card-info"><div class="type-card-name">${tipo.nombre}</div><div class="type-card-sub">${tipo.subtitulo}</div><div class="type-card-why" data-why-type="${tipo.id}"></div></div></button>`;
            return `
                            <button type="button" class="type-card" data-vehicle-type="${tipo.id}">
                                <div class="type-card-icon">${ICONOS[tipo.icono] || ICONOS.car}</div>
                                <div class="type-card-info">
                                    <div class="type-card-name">${tipo.nombre}</div>
                                    <div class="type-card-sub">${tipo.subtitulo}</div>
                                    <div class="type-card-why" data-why-type="${tipo.id}"></div>
                                </div>
                            </button>
                        `;
        }).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderCamposParametros() {
        const campos = ['cc', 'year', 'ton', 'pax', 'p6'];
        dom.paramsContainer.innerHTML = `
            <div id="paramEmptyNotice" class="state-message-box">Selecciona primero un tipo de vehículo en el paso anterior.</div>
            <div id="paramNoneNotice" class="state-message-box" style="display:none;">Este tipo de vehículo tiene tarifa única y no requiere parámetros adicionales.</div>
            <div id="paramEmptyNotice" class="state-message-box">
                Selecciona primero un tipo de vehículo en el paso anterior.
            </div>
            <div id="paramNoneNotice" class="state-message-box" style="display:none;">
                Este tipo de vehículo tiene tarifa única y no requiere parámetros adicionales.
            </div>
            ${campos.map(k => {
            const d = TARIFAS.PREGUNTAS[k];
            if (d.opciones) {
                return `<div class="param-field" id="field-${k}" style="display:none;"><label class="param-label">${d.etiqueta}</label><p class="param-help">${d.ayuda}</p><div class="param-options-grid">${d.opciones.map(opc => `<button type="button" class="param-option-btn" data-param-key="${k}" data-param-val="${opc[0]}"><span class="param-option-text">${opc[1]}</span>${opc[2] ? `<span class="param-option-sub">${opc[2]}</span>` : ''}</button>`).join('')}</div><div class="field-error-msg" id="error-${k}" style="display:none;"></div></div>`;
                return `
                        <div class="param-field" id="field-${k}" style="display:none;">
                            <label class="param-label">${d.etiqueta}</label>
                            <p class="param-help">${d.ayuda}</p>
                            <div class="param-options-grid">
                                ${d.opciones.map(opc => `
                                    <button type="button" class="param-option-btn"
                                            data-param-key="${k}" data-param-val="${opc[0]}">
                                        <span class="param-option-text">${opc[1]}</span>
                                        ${opc[2] ? `<span class="param-option-sub">${opc[2]}</span>` : ''}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="field-error-msg" id="error-${k}" style="display:none;"></div>
                        </div>
                    `;
            } else {
                return `<div class="param-field" id="field-${k}" style="display:none;"><label class="param-label" for="input-${k}">${d.etiqueta}</label><p class="param-help">${d.ayuda}</p><div class="param-input-wrapper"><input type="text" inputmode="numeric" id="input-${k}" class="param-input" placeholder="${d.placeholder}" autocomplete="off"></div><div class="field-error-msg" id="error-${k}" style="display:none;"></div></div>`;
                return `
                        <div class="param-field" id="field-${k}" style="display:none;">
                            <label class="param-label" for="input-${k}">${d.etiqueta}</label>
                            <p class="param-help">${d.ayuda}</p>
                            <div class="param-input-wrapper">
                                <input type="text" inputmode="numeric" id="input-${k}"
                                       class="param-input" placeholder="${d.placeholder}"
                                       autocomplete="off">
                            </div>
                            <div class="field-error-msg" id="error-${k}" style="display:none;"></div>
                        </div>
                    `;
            }
        }).join('')}
        `;
    }

    function renderTablaMaestra() {
        const codigos = Object.keys(TARIFAS.PRECIOS_BASE).map(Number).sort((a, b) => a - b);
        dom.tariffsTableBody.innerHTML = codigos.map(codigo => {
            const precioBase = TARIFAS.PRECIOS_BASE[codigo];
            const calculo = CALC.liquidar(
                { type: obtenerTipoPorCodigo(codigo), cc: obtenerCcReferencia(codigo), year: 2020, ton: 1, pax: 1, p6: 'si' },
                TARIFAS,
                posActivo
            );
            const desc = TARIFAS.DESCRIPCIONES[codigo] || '';
            const cobroRef = calculo ? calculo.totalCobrarCliente : (precioBase + 25000);
            const comisionRef = calculo ? calculo.comisionPuntoVenta : (cobroRef - precioBase);
            const desc = TARIFAS.DESCRIPCIONES[codigo] || '';
            const cobroRef = calculo ? calculo.totalCobrarCliente : (precioBase + 25000);
            const comisionRef = calculo ? calculo.comisionPuntoVenta : (cobroRef - precioBase);

            return `
                <tr data-tariff-code="${codigo}">
                    <td><span class="code-pill">${codigo}</span></td>
                    <td>${desc}</td>
                    <td class="col-amount">${CALC.formatearMoneda(precioBase)}</td>
                    <td class="col-amount">${CALC.formatearMoneda(cobroRef)}</td>
                    <td class="col-amount" style="color:var(--success-solid);">${CALC.formatearMoneda(comisionRef)}</td>
                    <td class="col-amount" style="color:var(--success-solid);">
                        ${CALC.formatearMoneda(comisionRef)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    function obtenerTipoPorCodigo(c) {
        if (c === 10) return 'ciclo';
        if (c >= 110 && c <= 130) return 'moto';
        if (c === 140) return 'mc';
        if (c >= 211 && c <= 232) return 'cam';
        if (c >= 310 && c <= 330) return 'car';
        if (c >= 410 && c <= 430) return 'ofi';
        if (c >= 511 && c <= 532) return 'fam';
        if (c >= 611 && c <= 622) return 'p6';
        if (c >= 711 && c <= 732) return 'neg';
        if (c === 810) return 'bus';
        if (c >= 910 && c <= 920) return 'int';
        if (c === 10) return 'ciclo';
        if (c >= 110 && c <= 130) return 'moto';
        if (c === 140) return 'mc';
        if (c >= 211 && c <= 232) return 'cam';
        if (c >= 310 && c <= 330) return 'car';
        if (c >= 410 && c <= 430) return 'ofi';
        if (c >= 511 && c <= 532) return 'fam';
        if (c >= 611 && c <= 622) return 'p6';
        if (c >= 711 && c <= 732) return 'neg';
        if (c === 810) return 'bus';
        if (c >= 910 && c <= 920) return 'int';
        return 'fam';
    }

    function obtenerCcReferencia(c) {
        if (c === 110) return 90;
        if (c === 120) return 150;
        if (c === 130) return 250;
        return 1600;
    }

    function sincronizarVista() {
        const tipoActual = TARIFAS.TIPOS.find(t => t.id === estadoCalc.type);

        document.querySelectorAll('[data-service]').forEach(btn => btn.classList.toggle('selected', btn.getAttribute('data-service') === estadoCalc.svc));
        document.querySelectorAll('[data-service]').forEach(btn =>
            btn.classList.toggle('selected', btn.getAttribute('data-service') === estadoCalc.svc)
        );

        document.querySelectorAll('[data-vehicle-type]').forEach(card => {
            const typeId = card.getAttribute('data-vehicle-type');
            const tipo = TARIFAS.TIPOS.find(t => t.id === typeId);
            const typeId = card.getAttribute('data-vehicle-type');
            const tipo = TARIFAS.TIPOS.find(t => t.id === typeId);
            const esSeleccionado = estadoCalc.type === typeId;
            const esDisponible = !estadoCalc.svc || (tipo && tipo.servicios.includes(estadoCalc.svc));
            const whyEl = card.querySelector(`[data-why-type="${typeId}"]`);
            const esDisponible = !estadoCalc.svc || (tipo && tipo.servicios.includes(estadoCalc.svc));
            const whyEl = card.querySelector(`[data-why-type="${typeId}"]`);

            card.classList.toggle('selected', esSeleccionado);
            card.classList.toggle('disabled', !esDisponible);

            if (whyEl) {
                if (estadoCalc.svc && !esDisponible) {
                    const permitidos = tipo.servicios.map(s => TARIFAS.SERVICIOS[s]?.nombre || s).join(' o ');
                    whyEl.textContent = `Aplica a: ${permitidos}`;
                    whyEl.style.display = 'block';
                } else {
                    whyEl.textContent = '';
                    whyEl.textContent = '';
                    whyEl.style.display = 'none';
                }
            }
        });

        const emptyNotice = document.getElementById('paramEmptyNotice');
        const noneNotice = document.getElementById('paramNoneNotice');
        const noneNotice = document.getElementById('paramNoneNotice');

        if (!tipoActual) {
            emptyNotice.style.display = 'block';
            noneNotice.style.display = 'none';
            noneNotice.style.display = 'none';
            ['cc', 'year', 'ton', 'pax', 'p6'].forEach(k => {
                const el = document.getElementById(`field-${k}`);
                if (el) el.style.display = 'none';
            });
        } else {
            emptyNotice.style.display = 'none';
            const sinPreguntas = tipoActual.preguntas.length === 0;
            noneNotice.style.display = sinPreguntas ? 'block' : 'none';
            ['cc', 'year', 'ton', 'pax', 'p6'].forEach(k => {
                const el = document.getElementById(`field-${k}`);
                const debeMostrar = tipoActual.preguntas.includes(k);
                const el = document.getElementById(`field-${k}`);
                const debeMostrar = tipoActual.preguntas.includes(k);
                if (el) el.style.display = debeMostrar ? 'flex' : 'none';
            });
        }

        document.querySelectorAll('[data-param-key]').forEach(btn => {
            btn.classList.toggle('selected', estadoCalc[btn.getAttribute('data-param-key')] === btn.getAttribute('data-param-val'));
        });
        document.querySelectorAll('[data-param-key]').forEach(btn =>
            btn.classList.toggle(
                'selected',
                estadoCalc[btn.getAttribute('data-param-key')] === btn.getAttribute('data-param-val')
            )
        );

        actualizarIndicadoresPasos(tipoActual);
        ejecutarLiquidacion();
    }

    function actualizarIndicadoresPasos(tipoActual) {
        const svcCompletado = !!estadoCalc.svc;
        dom.stepCard1.classList.toggle('completed', svcCompletado);
        dom.stepTag1.textContent = svcCompletado ? TARIFAS.SERVICIOS[estadoCalc.svc]?.nombre : 'Pendiente';
        dom.stepTag1.textContent = svcCompletado
            ? TARIFAS.SERVICIOS[estadoCalc.svc]?.nombre
            : 'Pendiente';

        const tipoCompletado = !!tipoActual;
        dom.stepCard2.classList.toggle('completed', tipoCompletado);
        dom.stepTag2.textContent = tipoCompletado ? tipoActual.nombre : (svcCompletado ? 'Selecciona tipo' : 'Esperando paso 1');
        let resumenParams = 'Pendiente';
        dom.stepTag2.textContent = tipoCompletado
            ? tipoActual.nombre
            : (svcCompletado ? 'Selecciona tipo' : 'Esperando paso 1');

        let resumenParams = 'Pendiente';
        let paramsCompletados = false;

        if (tipoActual) {
            if (tipoActual.preguntas.length === 0) {
                resumenParams = 'Sin datos adicionales';
                resumenParams = 'Sin datos adicionales';
                paramsCompletados = true;
            } else {
                const completas = tipoActual.preguntas.every(k => estadoCalc[k] != null);
                if (completas) {
                    paramsCompletados = true;
                    const partes = [];
                    if (estadoCalc.cc) partes.push(`${CALC.formatearNumero(estadoCalc.cc)} c.c.`);
                    if (estadoCalc.cc) partes.push(`${CALC.formatearNumero(estadoCalc.cc)} c.c.`);
                    if (estadoCalc.year) partes.push(`Mod. ${estadoCalc.year}`);
                    if (estadoCalc.ton) partes.push(TARIFAS.PREGUNTAS.ton.opciones.find(o => o[0] === estadoCalc.ton)?.[1] || '');
                    if (estadoCalc.pax) partes.push(TARIFAS.PREGUNTAS.pax.opciones.find(o => o[0] === estadoCalc.pax)?.[1] || '');
                    if (estadoCalc.p6) partes.push(estadoCalc.p6 === 'si' ? '6+ pas.' : '<6 pas.');
                    if (estadoCalc.ton) partes.push(TARIFAS.PREGUNTAS.ton.opciones.find(o => o[0] === estadoCalc.ton)?.[1] || '');
                    if (estadoCalc.pax) partes.push(TARIFAS.PREGUNTAS.pax.opciones.find(o => o[0] === estadoCalc.pax)?.[1] || '');
                    if (estadoCalc.p6) partes.push(estadoCalc.p6 === 'si' ? '6+ pas.' : '<6 pas.');
                    resumenParams = partes.filter(Boolean).join(' • ');
                } else {
                    resumenParams = 'Completa los datos';
                }
            }
        }

        dom.stepCard3.classList.toggle('completed', paramsCompletados);
        dom.stepTag3.textContent = resumenParams;
    }

    function ejecutarLiquidacion() {
        const resultado = CALC.liquidar(estadoCalc, TARIFAS, posActivo);
        ultimaLiquidacion = resultado;

        document.querySelectorAll('.tariffs-table tr.highlighted').forEach(tr => tr.classList.remove('highlighted'));
        document.querySelectorAll('.tariffs-table tr.highlighted').forEach(tr =>
            tr.classList.remove('highlighted')
        );

        const errorP6El = document.getElementById('error-p6');
        if (errorP6El) {
            if (resultado && resultado.errorEspecial) {
                errorP6El.textContent = resultado.errorEspecial;
                errorP6El.style.display = 'block';
            } else {
                errorP6El.style.display = 'none';
            }
        }

        if (!resultado || !resultado.exito) {
            renderResumenVacio();
            return;
        }

        renderResumenExitoso(resultado);
        const fila = document.querySelector(`tr[data-tariff-code="${resultado.codigo}"]`);
        if (fila) fila.classList.add('highlighted');
    }

    function renderResumenVacio() {
        dom.summaryContainer.innerHTML = `
            <div class="summary-empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="10" y2="8"/><line x1="6" y1="12" x2="8" y2="12"/><line x1="6" y1="16" x2="14" y2="16"/></svg>
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <line x1="6" y1="8" x2="10" y2="8"/>
                    <line x1="6" y1="12" x2="8" y2="12"/>
                    <line x1="6" y1="16" x2="14" y2="16"/>
                </svg>
                <div class="empty-state-title">Esperando datos de cotización</div>
                <p class="empty-state-desc">Selecciona el servicio y tipo de vehículo en el panel izquierdo para calcular el valor exacto del SOAT al instante.</p>
                <p class="empty-state-desc">
                    Selecciona el servicio y tipo de vehículo en el panel izquierdo
                    para calcular el valor exacto del SOAT al instante.
                </p>
            </div>
        `;
        ultimoCobro = 0;
        ultimoCobro = 0;
        ultimoConsignar = 0;
    }

    function renderResumenExitoso(res) {
        const codigo = res.codigo;
        const totalCobrar = res.totalCobrarCliente;
        const codigo = res.codigo;
        const totalCobrar = res.totalCobrarCliente;
        const montoConsignar = res.montoConsignarProveedor;
        const comision = res.comisionPuntoVenta;
        const posNombre = posActivo ? posActivo.nombre.replace('[DEMO] ', '') : 'Punto por defecto';
        const comision = res.comisionPuntoVenta;
        const posNombre = posActivo ? posActivo.nombre.replace('[DEMO] ', '') : 'Punto por defecto';

        dom.summaryContainer.innerHTML = `
            <!-- 1. Total a cobrar al cliente en ventanilla -->
            <div class="quote-highlight-card">
                <div class="quote-label-row">
                    <span class="quote-label">Total a cobrar al cliente</span>
                    <button type="button" class="btn-copy" data-copy-val="${CALC.formatearMoneda(totalCobrar)}">
                    <button type="button" class="btn-copy"
                            data-copy-val="${CALC.formatearMoneda(totalCobrar)}">
                        ${ICONOS.copy} <span>Copiar</span>
                    </button>
                </div>
                <div class="quote-value-row">
                    <div class="quote-amount" id="animCobro">${CALC.formatearMoneda(totalCobrar)}</div>
                </div>
            </div>

            <!-- 2. Monto oficial que el punto debe consignar al proveedor -->
            <div class="quote-secondary-card consignar-highlight">
                <div>
                    <div class="quote-label">
                        Tarifa Oficial SOAT
                        <span class="badge-oficial-prov">A Consignar al Proveedor</span>
                    </div>
                    <div class="quote-secondary-amount" id="animConsignar">${CALC.formatearMoneda(montoConsignar)}</div>
                    <div class="quote-secondary-amount" id="animConsignar">
                        ${CALC.formatearMoneda(montoConsignar)}
                    </div>
                </div>
                <button type="button" class="btn-copy" data-copy-val="${CALC.formatearMoneda(montoConsignar)}">
                <button type="button" class="btn-copy"
                        data-copy-val="${CALC.formatearMoneda(montoConsignar)}">
                    ${ICONOS.copy} <span>Copiar</span>
                </button>
            </div>

            <!-- 3. Comisión calculada para el punto de venta -->
            <div class="gain-banner">
                <div>
                    <div class="gain-label">Comisión del Punto de Venta:</div>
                    <small style="font-size:11.5px;opacity:0.85;">${res.reglaComisionAplicada}</small>
                </div>
                <span class="gain-amount">${CALC.formatearMoneda(comision)}</span>
            </div>

            <div class="quote-pos-notice">
                <span>Liquidado para: <strong>${posNombre}</strong></span>
                <span class="code-pill">Cód. ${codigo}</span>
            </div>

            <!-- Botón para Registrar Venta Demo -->
            <!-- Botón para abrir el modal de registro de pago -->
            <button type="button" class="btn-register-sale-demo" id="btnRegisterDemoSale">
                ✓ Registrar Operación Demo
            </button>

            <!-- 4. Ficha Técnica con Desglose y Reglas de Integridad -->
            <div class="breakdown-list">
                <div class="breakdown-item">
                    <span class="breakdown-term">Clasificación legal</span>
                    <span class="breakdown-val">${res.descripcion}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-term">Servicio asignado</span>
                    <span class="breakdown-val">${TARIFAS.SERVICIOS[estadoCalc.svc]?.nombre || 'Particular'}</span>
                    <span class="breakdown-val">
                        ${TARIFAS.SERVICIOS[estadoCalc.svc]?.nombre || 'Particular'}
                    </span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-term">Ajuste de redondeo</span>
                    <span class="breakdown-val">${res.aplicoRedondeo ? `+$${CALC.formatearNumero(res.valorRedondeo)} (a $1.000)` : 'Exacto'}</span>
                    <span class="breakdown-val">
                        ${res.aplicoRedondeo
                ? `+$${CALC.formatearNumero(res.valorRedondeo)} (a $1.000) — Redondeo comercial SOATECH`
                : 'Exacto'}
                    </span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-term">Integridad tarifaria</span>
                    <span class="breakdown-val" style="font-size:11.5px;color:var(--text-muted);">
                        La tarifa oficial es inmutable y no se altera por comisiones.
                    </span>
                </div>
            </div>
        `;

        animarValoresMonetarios(totalCobrar, montoConsignar);
    }

    function animarValoresMonetarios(cobroFinal, consignarFinal) {
        cancelAnimationFrame(animFrame);
        const elCobro = document.getElementById('animCobro');
        const elCobro = document.getElementById('animCobro');
        const elConsignar = document.getElementById('animConsignar');
        if (!elCobro || !elConsignar) return;
        if (PREFIERE_MOVIMIENTO_REDUCIDO || (ultimoCobro === cobroFinal && ultimoConsignar === consignarFinal)) {
            elCobro.textContent = CALC.formatearMoneda(cobroFinal);

            if (PREFIERE_MOVIMIENTO_REDUCIDO ||
                (ultimoCobro === cobroFinal && ultimoConsignar === consignarFinal)) {
                elCobro.textContent = CALC.formatearMoneda(cobroFinal);
                elConsignar.textContent = CALC.formatearMoneda(consignarFinal);
                ultimoCobro = cobroFinal;
                ultimoCobro = cobroFinal;
                ultimoConsignar = consignarFinal;
                return;
            }
            const inicioCobro = ultimoCobro || cobroFinal;

            const inicioCobro = ultimoCobro || cobroFinal;
            const inicioConsignar = ultimoConsignar || consignarFinal;
            ultimoCobro = cobroFinal;
            ultimoCobro = cobroFinal;
            ultimoConsignar = consignarFinal;
            const duracion = 350;

            const duracion = 350;
            const tiempoInicio = performance.now();

            function step(ahora) {
                const progreso = Math.min(1, (ahora - tiempoInicio) / duracion);
                const curva = 1 - Math.pow(1 - progreso, 3);
                const actualCobro = Math.round((inicioCobro + (cobroFinal - inicioCobro) * curva) / 100) * 100;
                const actualConsignar = Math.round((inicioConsignar + (consignarFinal - inicioConsignar) * curva) / 100) * 100;
                elCobro.textContent = CALC.formatearMoneda(actualCobro);
                elConsignar.textContent = CALC.formatearMoneda(actualConsignar);
                if (progreso < 1) animFrame = requestAnimationFrame(step);
                else {
                    elCobro.textContent = CALC.formatearMoneda(cobroFinal);
                    const progreso = Math.min(1, (ahora - tiempoInicio) / duracion);
                    const curva = 1 - Math.pow(1 - progreso, 3);
                    const actualCobro = Math.round((inicioCobro + (cobroFinal - inicioCobro) * curva) / 100) * 100;
                    const actualCons = Math.round((inicioConsignar + (consignarFinal - inicioConsignar) * curva) / 100) * 100;
                    elCobro.textContent = CALC.formatearMoneda(actualCobro);
                    elConsignar.textContent = CALC.formatearMoneda(actualCons);
                    if (progreso < 1) {
                        animFrame = requestAnimationFrame(step);
                    } else {
                        elCobro.textContent = CALC.formatearMoneda(cobroFinal);
                        elConsignar.textContent = CALC.formatearMoneda(consignarFinal);
                    }
                }
                animFrame = requestAnimationFrame(step);
            }

            /* ------------------------------------------------------------------------
             * 9. Eventos Globales y Modales
             * --------------------------------------------------------------------- */
            /* =========================================================================
             * 9. MODALES — OPERACIONES
             * ====================================================================== */

            /**
             * Abre el modal de detalle de operación para el Administrador (Héctor).
             * Muestra información de la operación, comprobante simulado, historial
             * de auditoría y botones de confirmar/rechazar (solo si está pendiente).
             *
             * @param {string} opId - ID de la operación
             */
            async function abrirModalDetalleOperacionAdmin(opId) {
                if (!dom.modalDetalleOperacionAdmin || !dom.detalleOpBody || !dom.detalleOpFooter) return;

                const op = await OPERACIONES_SERVICE.getOperacionPorId(opId);
                if (!op) {
                    alert('No se encontró la operación.');
                    return;
                }

                const claseEstado = obtenerClaseEstadoOp(op.estado);
                const esPendiente = op.estado === 'Pendiente de revisión';
                const esRechazada = op.estado === 'Rechazada';

                // --- Cuerpo del modal ---
                dom.detalleOpBody.innerHTML = `
            <!-- Encabezado con ID y estado -->
            <div style="display:flex;align-items:center;justify-content:space-between;
                        flex-wrap:wrap;gap:10px;margin-bottom:16px;">
                <div>
                    <span style="font-size:12px;color:var(--text-muted);">Operación</span>
                    <div style="font-size:18px;font-weight:800;">${op.id}</div>
                </div>
                <span class="status-badge ${claseEstado}" style="font-size:13px;padding:6px 14px;">
                    <span class="dot"></span> ${op.estado}
                </span>
            </div>

            <!-- Grid de información + comprobante simulado -->
            <div class="operation-detail-grid">

                <!-- Columna izquierda: datos de la operación -->
                <div class="operation-info-card">
                    <div class="op-detail-row">
                        <span class="op-detail-label">Punto de Venta</span>
                        <span class="op-detail-val">${op.posNombre}</span>
                    </div>
                    <div class="op-detail-row">
                        <span class="op-detail-label">Fecha</span>
                        <span class="op-detail-val">${formatearFechaHora(op.fecha)}</span>
                    </div>
                    <div class="op-detail-row">
                        <span class="op-detail-label">Vehículo</span>
                        <span class="op-detail-val">${op.vehiculoDescripcion}</span>
                    </div>
                    ${op.placa ? `
                    <div class="op-detail-row">
                        <span class="op-detail-label">Placa</span>
                        <span class="op-detail-val">
                            <span class="code-pill">${op.placa}</span>
                        </span>
                    </div>` : ''}
                    <div class="op-detail-row">
                        <span class="op-detail-label">Tarifa Oficial SOAT</span>
                        <span class="op-detail-val">${CALC.formatearMoneda(op.valorConsignar)}</span>
                    </div>
                    <div class="op-detail-row">
                        <span class="op-detail-label">Comisión POS</span>
                        <span class="op-detail-val" style="color:var(--accent-primary);">
                            ${CALC.formatearMoneda(op.comision)}
                        </span>
                    </div>
                    <div class="op-detail-row">
                        <span class="op-detail-label">Total Cobrado al Cliente</span>
                        <span class="op-detail-val" style="font-weight:800;">
                            ${CALC.formatearMoneda(op.valorCobrar)}
                        </span>
                    </div>
                    ${op.bancoOrigen ? `
                    <div class="op-detail-row">
                        <span class="op-detail-label">Banco Consignación</span>
                        <span class="op-detail-val">${op.bancoOrigen}</span>
                    </div>` : ''}
                    ${op.referenciaAprobacion ? `
                    <div class="op-detail-row">
                        <span class="op-detail-label">Ref. / N° Aprobación</span>
                        <span class="op-detail-val">
                            <span class="code-pill">${op.referenciaAprobacion}</span>
                        </span>
                    </div>` : ''}
                    ${esRechazada && op.motivoRechazo ? `
                    <div class="op-detail-row" style="background:rgba(239,68,68,0.08);
                                border-radius:var(--radius-sm);padding:10px;">
                        <span class="op-detail-label" style="color:#ef4444;">Motivo de Rechazo</span>
                        <span class="op-detail-val" style="color:#ef4444;">${op.motivoRechazo}</span>
                    </div>` : ''}
                </div>

                <!-- Columna derecha: comprobante simulado -->
                <div class="receipt-preview-container">
                    <div class="receipt-ticket">
                        <div class="receipt-bank-name">${op.bancoOrigen || 'Sin banco registrado'}</div>
                        <div style="font-size:11px;text-align:center;opacity:0.65;margin-bottom:12px;">
                            Comprobante de consignación — DEMO
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px;">
                            <div style="display:flex;justify-content:space-between;font-size:12px;">
                                <span>Valor consignado</span>
                                <strong>${CALC.formatearMoneda(op.valorConsignar)}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;">
                                <span>Referencia</span>
                                <span>${op.referenciaAprobacion || '—'}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;">
                                <span>Fecha</span>
                                <span>${formatearFechaHora(op.fecha)}</span>
                            </div>
                        </div>
                        <div class="receipt-status-seal ${claseEstado}">${op.estado}</div>
                    </div>
                </div>
            </div>

            <!-- Historial de auditoría -->
            ${(op.historial && op.historial.length > 0) ? `
            <div class="audit-timeline">
                <div style="font-size:13px;font-weight:700;margin-bottom:10px;
                            color:var(--text-secondary);">Historial de la Operación</div>
                ${op.historial.map(h => `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div>
                            <div style="font-size:12.5px;font-weight:600;">${h.accion}</div>
                            <div class="timeline-nota">${h.nota || ''}</div>
                            <div style="font-size:11px;color:var(--text-muted);">
                                ${formatearFechaHora(h.fecha)} — ${h.usuario || ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>` : ''}
        `;

                // --- Footer del modal (acciones) ---
                if (esPendiente) {
                    dom.detalleOpFooter.innerHTML = `
                <div id="motivoRechazoContainer" style="display:none;width:100%;">
                    <label class="form-label" style="margin-bottom:4px;">
                        Motivo del rechazo <span style="color:#ef4444;">*</span>
                    </label>
                    <textarea id="inputMotivoRechazo" class="form-input"
                              style="width:100%;min-height:60px;resize:vertical;"
                              placeholder="Describe la razón del rechazo..."></textarea>
                </div>
                <button type="button" class="btn-approve-op" id="btnConfirmarOp"
                        data-op-id="${op.id}">
                    ✓ Confirmar Pago
                </button>
                <button type="button" class="btn-reject-op" id="btnRechazarOpIniciar"
                        data-op-id="${op.id}">
                    ✕ Rechazar
                </button>
                <button type="button" class="btn-reject-op" id="btnEnviarRechazo"
                        data-op-id="${op.id}"
                        style="display:none;background:var(--color-red-bg,#fee2e2);
                               color:#991b1b;border-color:#fca5a5;">
                    Confirmar Rechazo
                </button>
            `;

                    // Botón Confirmar
                    document.getElementById('btnConfirmarOp').addEventListener('click', async () => {
                        await confirmarOperacionDesdeModal(op.id);
                    });

                    // Botón Rechazar — muestra textarea y botón de confirmación
                    document.getElementById('btnRechazarOpIniciar').addEventListener('click', () => {
                        document.getElementById('motivoRechazoContainer').style.display = 'block';
                        document.getElementById('btnRechazarOpIniciar').style.display = 'none';
                        document.getElementById('btnConfirmarOp').style.display = 'none';
                        document.getElementById('btnEnviarRechazo').style.display = 'inline-flex';
                    });

                    // Confirmar el rechazo con motivo
                    document.getElementById('btnEnviarRechazo').addEventListener('click', async () => {
                        const motivo = document.getElementById('inputMotivoRechazo').value.trim();
                        if (!motivo) {
                            alert('Por favor, ingresa el motivo del rechazo antes de continuar.');
                            return;
                        }
                        await rechazarOperacionDesdeModal(op.id, motivo);
                    });

                } else {
                    dom.detalleOpFooter.innerHTML = `
                <span style="font-size:12.5px;color:var(--text-muted);">
                    Esta operación ya fue ${op.estado.toLowerCase()}.
                    No se permiten cambios adicionales.
                </span>
            `;
                }

                dom.modalDetalleOperacionAdmin.classList.add('open');
            }

            /**
             * Confirma una operación pendiente desde el modal de detalle.
             * @param {string} opId
             */
            async function confirmarOperacionDesdeModal(opId) {
                try {
                    await OPERACIONES_SERVICE.confirmarOperacion(opId, usuarioActual.nombre);
                    cerrarModalDetalleOperacion();
                    await renderAdminOperacionesTable(obtenerFiltrosAdminActuales());
                } catch (err) {
                    alert('Error al confirmar la operación: ' + err.message);
                }
            }

            /**
             * Rechaza una operación pendiente con un motivo desde el modal de detalle.
             * @param {string} opId
             * @param {string} motivo
             */
            async function rechazarOperacionDesdeModal(opId, motivo) {
                try {
                    await OPERACIONES_SERVICE.rechazarOperacion(opId, motivo, usuarioActual.nombre);
                    cerrarModalDetalleOperacion();
                    await renderAdminOperacionesTable(obtenerFiltrosAdminActuales());
                } catch (err) {
                    alert('Error al rechazar la operación: ' + err.message);
                }
            }

            function cerrarModalDetalleOperacion() {
                if (dom.modalDetalleOperacionAdmin) {
                    dom.modalDetalleOperacionAdmin.classList.remove('open');
                }
            }

            /** Lee los filtros actuales del panel de operaciones del admin */
            function obtenerFiltrosAdminActuales() {
                return {
                    posId: dom.filterPosSelect ? dom.filterPosSelect.value : '',
                    estado: dom.filterEstadoSelectAdmin ? dom.filterEstadoSelectAdmin.value : '',
                    terminoBusqueda: dom.searchOperacionesInput ? dom.searchOperacionesInput.value : ''
                };
            }

            // ---- Modal 4: Registro de pago POS ----------------------------------------

            /**
             * Abre el modal para que el POS ingrese datos del pago antes de registrar.
             * Muestra el desglose de la última liquidación y pide banco, referencia y placa.
             */
            function abrirModalRegistroPagoPos() {
                if (!dom.modalRegistroPagoPos || !dom.registroPagoBody) return;
                if (!ultimaLiquidacion || !ultimaLiquidacion.exito) {
                    alert('Primero realiza una cotización válida en la calculadora.');
                    return;
                }

                const res = ultimaLiquidacion;
                const posNombre = posActivo ? posActivo.nombre.replace('[DEMO] ', '') : '—';

                dom.registroPagoBody.innerHTML = `
            <!-- Resumen de la liquidación a registrar -->
            <div style="background:var(--bg-surface-alt);border-radius:var(--radius-md);
                        padding:16px;margin-bottom:18px;">
                <div style="font-size:13px;font-weight:700;margin-bottom:10px;
                            color:var(--text-secondary);">Resumen de la operación a registrar</div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Punto de Venta</span>
                    <span class="op-detail-val">${posNombre}</span>
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Vehículo</span>
                    <span class="op-detail-val">${res.descripcion}</span>
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Tarifa Oficial (a consignar)</span>
                    <span class="op-detail-val" style="font-weight:700;">
                        ${CALC.formatearMoneda(res.montoConsignarProveedor)}
                    </span>
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Comisión del POS</span>
                    <span class="op-detail-val" style="color:var(--accent-primary);">
                        ${CALC.formatearMoneda(res.comisionPuntoVenta)}
                    </span>
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Total cobrado al cliente</span>
                    <span class="op-detail-val" style="font-weight:800;font-size:16px;">
                        ${CALC.formatearMoneda(res.totalCobrarCliente)}
                    </span>
                </div>
            </div>

            <!-- Formulario de datos del pago -->
            <div class="form-group">
                <label class="form-label" for="inputPlacaRegistro">
                    Placa del vehículo <span style="color:#ef4444;">*</span>
                </label>
                <input type="text" id="inputPlacaRegistro" class="form-input"
                       placeholder="Ej: ABC123" autocomplete="off"
                       style="text-transform:uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label" for="selectBancoRegistro">
                    Banco de consignación <span style="color:#ef4444;">*</span>
                </label>
                <select id="selectBancoRegistro" class="form-input">
                    <option value="">— Selecciona el banco —</option>
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="Daviplata">Daviplata</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="inputRefRegistro">
                    Número de referencia o aprobación <span style="color:#ef4444;">*</span>
                </label>
                <input type="text" id="inputRefRegistro" class="form-input"
                       placeholder="Número del comprobante o aprobación"
                       autocomplete="off">
            </div>
        `;

                dom.modalRegistroPagoPos.classList.add('open');
            }

            /**
             * Envía la operación con los datos del formulario de pago.
             * Llama a operacionesService.registrarOperacionDemo con los datosPago.
             */
            async function enviarPagoPos() {
                const placa = (document.getElementById('inputPlacaRegistro')?.value || '').trim().toUpperCase();
                const banco = document.getElementById('selectBancoRegistro')?.value || '';
                const referencia = (document.getElementById('inputRefRegistro')?.value || '').trim();

                if (!placa) { alert('Por favor, ingresa la placa del vehículo.'); return; }
                if (!banco) { alert('Por favor, selecciona el banco de consignación.'); return; }
                if (!referencia) { alert('Por favor, ingresa el número de referencia o aprobación.'); return; }

                try {
                    const datosPago = { bancoOrigen: banco, referenciaAprobacion: referencia, placa };
                    const op = await OPERACIONES_SERVICE.registrarOperacionDemo(
                        ultimaLiquidacion, posActivo, datosPago
                    );
                    dom.modalRegistroPagoPos.classList.remove('open');
                    alert(
                        `¡Operación ${op.id} registrada con éxito!\n\n` +
                        `Placa: ${op.placa}\n` +
                        `Vehículo: ${op.vehiculoDescripcion}\n` +
                        `Total cobrado al cliente: ${CALC.formatearMoneda(op.valorCobrar)}\n` +
                        `A consignar a Héctor Vargas: ${CALC.formatearMoneda(op.valorConsignar)}\n` +
                        `Comisión del punto: ${CALC.formatearMoneda(op.comision)}\n\n` +
                        `Estado: Pendiente de revisión\n` +
                        `Consulta esta venta en "Mis Operaciones".`
                    );
                } catch (err) {
                    alert('Error al registrar la operación: ' + err.message);
                }
            }

            // ---- Modal 5: Corregir y reenviar comprobante rechazado (POS) --------------

            /**
             * Abre el modal para que el POS corrija y reenvíe un comprobante rechazado.
             * Muestra el motivo del rechazo y un formulario para ingresar nueva información.
             *
             * @param {string} opId
             */
            async function abrirModalCorregirPagoPos(opId) {
                if (!dom.modalCorregirPagoPos || !dom.corregirPagoBody) return;

                const op = await OPERACIONES_SERVICE.getOperacionPorId(opId);
                if (!op) { alert('No se encontró la operación.'); return; }

                dom.corregirPagoBody.innerHTML = `
            <!-- Motivo del rechazo -->
            <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);
                        border-radius:var(--radius-md);padding:14px;margin-bottom:18px;">
                <div style="font-size:12px;font-weight:700;color:#991b1b;margin-bottom:4px;">
                    ✕ Motivo del Rechazo
                </div>
                <div style="font-size:13.5px;color:#ef4444;">
                    ${op.motivoRechazo || 'No se especificó un motivo.'}
                </div>
            </div>

            <!-- Resumen de la operación -->
            <div style="background:var(--bg-surface-alt);border-radius:var(--radius-md);
                        padding:14px;margin-bottom:16px;">
                <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">
                    Operación a corregir
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">ID</span>
                    <span class="op-detail-val"><span class="code-pill">${op.id}</span></span>
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Vehículo</span>
                    <span class="op-detail-val">${op.vehiculoDescripcion}</span>
                </div>
                <div class="op-detail-row">
                    <span class="op-detail-label">Tarifa a consignar</span>
                    <span class="op-detail-val">${CALC.formatearMoneda(op.valorConsignar)}</span>
                </div>
            </div>

            <!-- Formulario de corrección -->
            <div class="form-group">
                <label class="form-label" for="selectBancoCorregir">
                    Nuevo banco de consignación <span style="color:#ef4444;">*</span>
                </label>
                <select id="selectBancoCorregir" class="form-input">
                    <option value="">— Selecciona el banco —</option>
                    <option value="Bancolombia" ${op.bancoOrigen === 'Bancolombia' ? 'selected' : ''}>Bancolombia</option>
                    <option value="Nequi"       ${op.bancoOrigen === 'Nequi' ? 'selected' : ''}>Nequi</option>
                    <option value="Davivienda"  ${op.bancoOrigen === 'Davivienda' ? 'selected' : ''}>Davivienda</option>
                    <option value="Daviplata"   ${op.bancoOrigen === 'Daviplata' ? 'selected' : ''}>Daviplata</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="inputRefCorregir">
                    Nuevo número de referencia o aprobación <span style="color:#ef4444;">*</span>
                </label>
                <input type="text" id="inputRefCorregir" class="form-input"
                       placeholder="Número del nuevo comprobante"
                       value="${op.referenciaAprobacion || ''}" autocomplete="off">
            </div>
        `;

                // Guardamos el ID para usarlo al enviar
                dom.modalCorregirPagoPos.dataset.opId = opId;
                dom.modalCorregirPagoPos.classList.add('open');
            }

            /**
             * Reenvía el comprobante corregido al proveedor.
             */
            async function reenviarComprobanteCorregido() {
                const opId = dom.modalCorregirPagoPos.dataset.opId;
                const banco = document.getElementById('selectBancoCorregir')?.value || '';
                const referencia = (document.getElementById('inputRefCorregir')?.value || '').trim();

                if (!banco) { alert('Por favor, selecciona el nuevo banco de consignación.'); return; }
                if (!referencia) { alert('Por favor, ingresa el nuevo número de referencia o aprobación.'); return; }

                try {
                    const datosPago = { bancoOrigen: banco, referenciaAprobacion: referencia };
                    const posNombre = posActivo ? posActivo.nombre : 'Punto de Venta';
                    await OPERACIONES_SERVICE.reenviarComprobante(opId, datosPago, posNombre);
                    dom.modalCorregirPagoPos.classList.remove('open');
                    alert(
                        '¡Comprobante corregido y reenviado con éxito!\n\n' +
                        'La operación queda en estado "Pendiente de revisión" nuevamente.\n' +
                        'Héctor Vargas recibirá la corrección para su revisión.'
                    );
                    await renderPosOperacionesTable();
                } catch (err) {
                    alert('Error al reenviar el comprobante: ' + err.message);
                }
            }

            /* =========================================================================
             * 10. TUTORIAL MINIMIZABLE — VISTA ADMIN POS
             * ====================================================================== */

            /**
             * Aplica el estado persistido del tutorial (minimizado o visible).
             * Se llama al inicializar la app y cada vez que se carga la vista admin_pos.
             */
            function aplicarEstadoTutorial() {
                if (!dom.tutorialPosBanner || !dom.containerRestaurarTutorialPos) return;
                const estaMinimizado = localStorage.getItem('soatech_tutorial_pos_minimized') === 'true';
                dom.tutorialPosBanner.style.display = estaMinimizado ? 'none' : 'flex';
                dom.containerRestaurarTutorialPos.style.display = estaMinimizado ? 'flex' : 'none';
            }

            /* =========================================================================
             * 11. EVENTOS GLOBALES Y MODALES
             * ====================================================================== */
            function configurarEventosGlobales() {
                // Navegación de pestañas

                // ---- Navegación de pestañas ----
                if (dom.mainNavTabs) {
                    dom.mainNavTabs.addEventListener('click', e => {
                        const btn = e.target.closest('[data-target-view]');
                        if (btn) cambiarVista(btn.getAttribute('data-target-view'));
                    });
                }

                // Selector de Punto de Venta en la barra Demo
                // ---- Selector de Punto de Venta en la barra Demo ----
                if (dom.selectDemoPos) {
                    dom.selectDemoPos.addEventListener('change', async function (e) {
                        const nuevoPosId = e.target.value;
                        posActivo = await POS_SERVICE.getPuntoVentaPorId(nuevoPosId);
                        actualizarIndicadoresPerfil();
                        sincronizarVista();
                    });
                }

                // Modal de perfiles Demo
                // ---- Modal de perfiles Demo ----
                if (dom.btnOpenProfileModal) {
                    dom.btnOpenProfileModal.addEventListener('click', () => dom.modalDemoAuth.classList.add('open'));
                    dom.btnOpenProfileModal.addEventListener('click', () =>
                        dom.modalDemoAuth.classList.add('open')
                    );
                }
                if (dom.btnCloseAuthModal) {
                    dom.btnCloseAuthModal.addEventListener('click', () => dom.modalDemoAuth.classList.remove('open'));
                    dom.btnCloseAuthModal.addEventListener('click', () =>
                        dom.modalDemoAuth.classList.remove('open')
                    );
                }
                if (dom.btnCancelAuthModal) {
                    dom.btnCancelAuthModal.addEventListener('click', () => dom.modalDemoAuth.classList.remove('open'));
                    dom.btnCancelAuthModal.addEventListener('click', () =>
                        dom.modalDemoAuth.classList.remove('open')
                    );
                }

                // Botones de cambio de perfil demo
                if (dom.btnSelectAdminProfile) {
                    dom.btnSelectAdminProfile.addEventListener('click', async () => {
                        await AUTH_SERVICE.cambiarPerfilDemo('usr-admin-demo');
                        dom.modalDemoAuth.classList.remove('open');
                        await cargarSesionInicial();
                    });
                }
                if (dom.btnSelectPos1Profile) {
                    dom.btnSelectPos1Profile.addEventListener('click', async () => {
                        await AUTH_SERVICE.cambiarPerfilDemo('usr-pos-01-demo');
                        dom.modalDemoAuth.classList.remove('open');
                        await cargarSesionInicial();
                    });
                }
                if (dom.btnSelectPos2Profile) {
                    dom.btnSelectPos2Profile.addEventListener('click', async () => {
                        await AUTH_SERVICE.cambiarPerfilDemo('usr-pos-02-demo');
                        dom.modalDemoAuth.classList.remove('open');
                        await cargarSesionInicial();
                    });
                }

                // Restablecer Demo de fábrica
                // ---- Restablecer Demo de fábrica ----
                if (dom.btnDemoResetFactory) {
                    dom.btnDemoResetFactory.addEventListener('click', async function () {
                        if (confirm('¿Deseas restablecer todos los datos demo a los valores originales de fábrica?')) {
                            STORAGE.resetearDatosDeFabrica();
                            await cargarSesionInicial();
                            limpiarFormulario();
                            renderTablaMaestra();
                            alert('Datos demo restablecidos a los valores originales.');
                        }
                    });
                }

                // Eventos de la calculadora
                // ---- Calculadora ----
                dom.servicesGrid.addEventListener('click', e => {
                    const btn = e.target.closest('[data-service]');
                    if (btn) seleccionarServicio(btn.getAttribute('data-service'));
                });

                dom.typesCatalog.addEventListener('click', e => {
                    const card = e.target.closest('[data-vehicle-type]');
                    if (card && !card.classList.contains('disabled')) seleccionarTipoVehiculo(card.getAttribute('data-vehicle-type'));
                    if (card && !card.classList.contains('disabled'))
                        seleccionarTipoVehiculo(card.getAttribute('data-vehicle-type'));
                });

                dom.paramsContainer.addEventListener('click', e => {
                    const btn = e.target.closest('[data-param-key]');
                    if (btn) {
                        estadoCalc[btn.getAttribute('data-param-key')] = btn.getAttribute('data-param-val');
                        sincronizarVista();
                    }
                });

                dom.paramsContainer.addEventListener('input', e => {
                    if (e.target.id === 'input-cc') procesarCilindraje(e.target.value, false);
                    if (e.target.id === 'input-cc') procesarCilindraje(e.target.value, false);
                    if (e.target.id === 'input-year') procesarAnioModelo(e.target.value, false);
                });

                dom.paramsContainer.addEventListener('focusout', e => {
                    if (e.target.id === 'input-cc') procesarCilindraje(e.target.value, true);
                    if (e.target.id === 'input-cc') procesarCilindraje(e.target.value, true);
                    if (e.target.id === 'input-year') procesarAnioModelo(e.target.value, true);
                });

                // Registrar venta demo desde la calculadora
                dom.summaryContainer.addEventListener('click', async e => {
                    // ---- Botón "Registrar Operación Demo" — ahora abre el modal 4 ----
                    dom.summaryContainer.addEventListener('click', e => {
                        if (e.target.closest('#btnRegisterDemoSale')) {
                            if (!ultimaLiquidacion || !ultimaLiquidacion.exito) return;
                            try {
                                const op = await OPERACIONES_SERVICE.registrarOperacionDemo(ultimaLiquidacion, posActivo);
                                alert(`¡Operación ${op.id} registrada exitosamente!\n\nVehículo: ${op.vehiculoDescripcion}\nValor a cobrar: ${CALC.formatearMoneda(op.valorCobrar)}\nA consignar a Héctor Vargas: ${CALC.formatearMoneda(op.valorConsignar)}\nComisión del punto: ${CALC.formatearMoneda(op.comision)}\n\nPuedes consultar esta venta en el módulo de operaciones.`);
                            } catch (err) {
                                alert('Error al registrar operación: ' + err.message);
                            }
                            abrirModalRegistroPagoPos();
                        }
                    });

                    // Copiado de valores al portapapeles en cualquier vista
                    // ---- Copiado de valores al portapapeles en cualquier vista ----
                    document.addEventListener('click', function (e) {
                        const btn = e.target.closest('[data-copy-val]');
                        if (!btn) return;
                        const valor = btn.getAttribute('data-copy-val');
                        copiarAlPortapapeles(valor, btn);
                        copiarAlPortapapeles(btn.getAttribute('data-copy-val'), btn);
                    });

                    // Botón limpiar formulario
                    // ---- Botón limpiar formulario ----
                    dom.btnReset.addEventListener('click', limpiarFormulario);

                    // Búsqueda en tabla maestra
                    // ---- Búsqueda en tabla maestra ----
                    dom.tableSearch.addEventListener('input', e => filtrarTablaMaestra(e.target.value));

                    // Acciones en la tabla de administración de Puntos de Venta
                    // ---- Acciones en la tabla de administración de Puntos de Venta ----
                    if (dom.adminPosTableBody) {
                        dom.adminPosTableBody.addEventListener('click', async e => {
                            const btnToggle = e.target.closest('[data-action="toggle-pos"]');
                            const btnEdit = e.target.closest('[data-action="edit-comision"]');
                            const btnEdit = e.target.closest('[data-action="edit-comision"]');

                            if (btnToggle) {
                                const posId = btnToggle.getAttribute('data-pos-id');
                                await POS_SERVICE.toggleEstadoPuntoVenta(posId);
                                await renderAdminPosTable(dom.searchPosInput?.value || '');
                                const puntos = await POS_SERVICE.getPuntosVenta();
                                poblarSelectorPuntosDemo(puntos);
                            }
                            if (btnEdit) {
                                const posId = btnEdit.getAttribute('data-pos-id');
                                await abrirModalEditorComisiones(posId);
                                await abrirModalEditorComisiones(btnEdit.getAttribute('data-pos-id'));
                            }
                        });
                    }

                    // Búsqueda en administración de puntos
                    // ---- Búsqueda en administración de puntos ----
                    if (dom.searchPosInput) {
                        dom.searchPosInput.addEventListener('input', e => renderAdminPosTable(e.target.value));
                        dom.searchPosInput.addEventListener('input', e =>
                            renderAdminPosTable(e.target.value)
                        );
                    }

                    // Guardar cambios en datos de consignación (Admin)
                    // ---- Guardar cambios en datos de consignación (Admin) ----
                    if (dom.btnSaveConsignacionAdmin) {
                        dom.btnSaveConsignacionAdmin.addEventListener('click', async () => {
                            const nombre = document.getElementById('inputTitularNombre')?.value;
                            const cedula = document.getElementById('inputTitularCedula')?.value;
                            const consignacion = await CONSIGNACION_SERVICE.getDatosConsignacion();

                            consignacion.titular = {
                                nombre: nombre,
                                nombre: nombre,
                                documentoTipo: 'Cédula de Ciudadanía',
                                documentoNumero: cedula
                            };

                            // Guardar números de cuentas actualizados
                            (consignacion.cuentas || []).forEach(c => {
                                const toggle = document.querySelector(`[data-account-toggle="${c.id}"]`);
                                const tipo = document.querySelector(`[data-account-tipo="${c.id}"]`);
                                const num = document.querySelector(`[data-account-num="${c.id}"]`);
                                const llave = document.querySelector(`[data-account-llave="${c.id}"]`);
                                const tipo = document.querySelector(`[data-account-tipo="${c.id}"]`);
                                const num = document.querySelector(`[data-account-num="${c.id}"]`);
                                const llave = document.querySelector(`[data-account-llave="${c.id}"]`);

                                if (toggle) c.activo = toggle.checked;
                                if (tipo) c.tipoCuenta = tipo.value;
                                if (num) c.numero = num.value;
                                if (llave) c.llave = llave.value;
                                if (toggle) c.activo = toggle.checked;
                                if (tipo) c.tipoCuenta = tipo.value;
                                if (num) c.numero = num.value;
                                if (llave) c.llave = llave.value;
                            });

                            await CONSIGNACION_SERVICE.actualizarDatosConsignacion(consignacion);
                            alert('¡Datos de consignación del proveedor actualizados con éxito!\nTodos los puntos de venta verán la nueva información inmediatamente.');
                            alert(
                                '¡Datos de consignación del proveedor actualizados con éxito!\n' +
                                'Todos los puntos de venta verán la nueva información inmediatamente.'
                            );
                        });
                    }

                    // Filtros en tabla de operaciones admin
                    // ---- Filtros tabla de operaciones Admin ----
                    if (dom.filterPosSelect) {
                        dom.filterPosSelect.addEventListener('change', e => {
                            renderAdminOperacionesTable({ posId: e.target.value, terminoBusqueda: dom.searchOperacionesInput?.value });
                        });
                        dom.filterPosSelect.addEventListener('change', () =>
                            renderAdminOperacionesTable(obtenerFiltrosAdminActuales())
                        );
                    }
                    if (dom.filterEstadoSelectAdmin) {
                        dom.filterEstadoSelectAdmin.addEventListener('change', () =>
                            renderAdminOperacionesTable(obtenerFiltrosAdminActuales())
                        );
                    }
                    if (dom.searchOperacionesInput) {
                        dom.searchOperacionesInput.addEventListener('input', e => {
                            renderAdminOperacionesTable({ posId: dom.filterPosSelect?.value, terminoBusqueda: e.target.value });
                            dom.searchOperacionesInput.addEventListener('input', () =>
                                renderAdminOperacionesTable(obtenerFiltrosAdminActuales())
                            );
                        }

        // Delegación de click en tabla Admin — botón "Ver Detalle"
        if (dom.adminOperacionesTableBody) {
                            dom.adminOperacionesTableBody.addEventListener('click', async e => {
                                const btn = e.target.closest('[data-action="ver-detalle-op"]');
                                if (btn) {
                                    await abrirModalDetalleOperacionAdmin(btn.getAttribute('data-op-id'));
                                }
                            });
                        }

                        // Modal de edición de comisiones
                        if (dom.btnCloseComisionesModal) dom.btnCloseComisionesModal.addEventListener('click', cerrarModalComisiones);
                        // ---- Filtro tabla de operaciones POS ----
                        if (dom.filterEstadoSelectPos) {
                            dom.filterEstadoSelectPos.addEventListener('change', () =>
                                renderPosOperacionesTable()
                            );
                        }

                        // Delegación de click en tabla POS — botón "Corregir y Reenviar"
                        if (dom.posOperacionesTableBody) {
                            dom.posOperacionesTableBody.addEventListener('click', async e => {
                                const btn = e.target.closest('[data-action="corregir-op"]');
                                if (btn) {
                                    await abrirModalCorregirPagoPos(btn.getAttribute('data-op-id'));
                                }
                            });
                        }

                        // ---- Modal 2: Comisiones ----
                        if (dom.btnCloseComisionesModal) dom.btnCloseComisionesModal.addEventListener('click', cerrarModalComisiones);
                        if (dom.btnCancelComisionesModal) dom.btnCancelComisionesModal.addEventListener('click', cerrarModalComisiones);
                        if (dom.btnSaveComisionesModal) dom.btnSaveComisionesModal.addEventListener('click', guardarComisionesDesdeModal);
                        if (dom.btnSaveComisionesModal) dom.btnSaveComisionesModal.addEventListener('click', guardarComisionesDesdeModal);

                        // ---- Modal 3: Detalle operación Admin ----
                        if (dom.btnCerrarDetalleOpModal) {
                            dom.btnCerrarDetalleOpModal.addEventListener('click', cerrarModalDetalleOperacion);
                        }
                        // Cerrar al hacer click en el backdrop del modal
                        if (dom.modalDetalleOperacionAdmin) {
                            dom.modalDetalleOperacionAdmin.addEventListener('click', e => {
                                if (e.target === dom.modalDetalleOperacionAdmin) cerrarModalDetalleOperacion();
                            });
                        }

                        // ---- Modal 4: Registro de pago POS ----
                        if (dom.btnCerrarRegistroPagoPos) {
                            dom.btnCerrarRegistroPagoPos.addEventListener('click', () =>
                                dom.modalRegistroPagoPos.classList.remove('open')
                            );
                        }
                        if (dom.btnCancelarPagoPos) {
                            dom.btnCancelarPagoPos.addEventListener('click', () =>
                                dom.modalRegistroPagoPos.classList.remove('open')
                            );
                        }
                        if (dom.btnEnviarPagoPos) {
                            dom.btnEnviarPagoPos.addEventListener('click', enviarPagoPos);
                        }
                        if (dom.modalRegistroPagoPos) {
                            dom.modalRegistroPagoPos.addEventListener('click', e => {
                                if (e.target === dom.modalRegistroPagoPos)
                                    dom.modalRegistroPagoPos.classList.remove('open');
                            });
                        }

                        // ---- Modal 5: Corregir y reenviar comprobante POS ----
                        if (dom.btnCerrarCorregirPagoPos) {
                            dom.btnCerrarCorregirPagoPos.addEventListener('click', () =>
                                dom.modalCorregirPagoPos.classList.remove('open')
                            );
                        }
                        if (dom.btnCancelarCorregirPos) {
                            dom.btnCancelarCorregirPos.addEventListener('click', () =>
                                dom.modalCorregirPagoPos.classList.remove('open')
                            );
                        }
                        if (dom.btnEnviarCorregirPos) {
                            dom.btnEnviarCorregirPos.addEventListener('click', reenviarComprobanteCorregido);
                        }
                        if (dom.modalCorregirPagoPos) {
                            dom.modalCorregirPagoPos.addEventListener('click', e => {
                                if (e.target === dom.modalCorregirPagoPos)
                                    dom.modalCorregirPagoPos.classList.remove('open');
                            });
                        }

                        // ---- Tutorial minimizable (Vista C — Admin POS) ----
                        if (dom.btnMinimizarTutorialPos) {
                            dom.btnMinimizarTutorialPos.addEventListener('click', () => {
                                dom.tutorialPosBanner.style.display = 'none';
                                dom.containerRestaurarTutorialPos.style.display = 'flex';
                                localStorage.setItem('soatech_tutorial_pos_minimized', 'true');
                            });
                        }
                        if (dom.btnRestaurarTutorialPos) {
                            dom.btnRestaurarTutorialPos.addEventListener('click', () => {
                                dom.tutorialPosBanner.style.display = 'flex';
                                dom.containerRestaurarTutorialPos.style.display = 'none';
                                localStorage.removeItem('soatech_tutorial_pos_minimized');
                            });
                        }
                    }

                    /* =========================================================================
                     * 12. MODAL EDITOR DE COMISIONES (ADMIN)
                     * ====================================================================== */

                    async function abrirModalEditorComisiones(posId) {
                        posParaEditarComisiones = await POS_SERVICE.getPuntoVentaPorId(posId);
                        if (!posParaEditarComisiones) return;

                        dom.editComisionesTitle.textContent = `Comisiones: ${posParaEditarComisiones.nombre}`;
                        dom.editComisionesTitle.textContent =
                            `Comisiones: ${posParaEditarComisiones.nombre}`;
                        const rangos = posParaEditarComisiones.comisiones || [];

                        dom.comisionesFormContainer.innerHTML = `
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;">
                Define los valores de comisión correspondientes al establecimiento <strong>${posParaEditarComisiones.nombre}</strong>.
                Define los valores de comisión para
                <strong>${posParaEditarComisiones.nombre}</strong>.
                Los rangos de tarifas no pueden modificarse; solo el valor de comisión.
            </p>
            ${rangos.map((r, i) => `
                <div style="background:var(--bg-surface-alt);padding:14px;border-radius:var(--radius-md);margin-bottom:10px;">
                <div style="background:var(--bg-surface-alt);padding:14px;
                            border-radius:var(--radius-md);margin-bottom:10px;">
                    <strong style="font-size:13px;">Rango ${i + 1}: ${r.etiqueta || ''}</strong>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px;">
                        <div>
                            <label class="form-label">Desde:</label>
                            <input type="text" disabled class="form-input" value="${CALC.formatearMoneda(r.desde || 0)}">
                            <input type="text" disabled class="form-input"
                                   value="${CALC.formatearMoneda(r.desde || 0)}">
                        </div>
                        <div>
                            <label class="form-label">Comisión a ganar ($):</label>
                            <input type="number" id="inputComisionRango_${i}" class="form-input" value="${r.comision}">
                            <input type="number" id="inputComisionRango_${i}"
                                   class="form-input" value="${r.comision}">
                        </div>
                    </div>
                </div>
            `).join('')}
        `;

                        dom.modalEditComisiones.classList.add('open');
                    }

                    function cerrarModalComisiones() {
                        dom.modalEditComisiones.classList.remove('open');
                        posParaEditarComisiones = null;
                    }

                    async function guardarComisionesDesdeModal() {
                        if (!posParaEditarComisiones) return;
                        const rangos = posParaEditarComisiones.comisiones || [];

                        for (let i = 0; i < rangos.length; i++) {
                            const input = document.getElementById(`inputComisionRango_${i}`);
                            if (input) {
                                const val = Number(input.value);
                                if (isNaN(val) || val < 0) {
                                    alert('La comisión no puede ser negativa.');
                                    alert('La comisión no puede ser negativa ni un valor inválido.');
                                    return;
                                }
                                rangos[i].comision = val;
                            }
                        }

                        try {
                            await POS_SERVICE.actualizarComisionesPuntoVenta(posParaEditarComisiones.id, rangos);
                            cerrarModalComisiones();
                            await renderAdminPosTable(dom.searchPosInput?.value || '');

                            // Si el POS editado es el activo, actualizar la liquidación
                            if (posActivo && posActivo.id === posParaEditarComisiones.id) {
                                posActivo = await POS_SERVICE.getPuntoVentaPorId(posActivo.id);
                                sincronizarVista();
                            }
                            alert('¡Comisiones actualizadas con éxito!');
                        } catch (err) {
                            alert('Error al guardar comisiones: ' + err.message);
                        }
                    }

                    /* =========================================================================
                     * 13. LÓGICA DE LA CALCULADORA — SELECCIÓN Y VALIDACIÓN
                     * ====================================================================== */

                    function seleccionarServicio(svcId) {
                        if (estadoCalc.svc === svcId) return;
                        estadoCalc.svc = svcId;
                        const tipoActual = TARIFAS.TIPOS.find(t => t.id === estadoCalc.type);
                        if (tipoActual && !tipoActual.servicios.includes(svcId)) reiniciarTipoYParametros();
                        const disponibles = TARIFAS.TIPOS.filter(t => t.servicios.includes(svcId));
                        if (!estadoCalc.type && disponibles.length === 1) {
                            seleccionarTipoVehiculo(disponibles[0].id);
                            return;
                        }
                        sincronizarVista();
                    }

                    function seleccionarTipoVehiculo(tipoId) {
                        if (estadoCalc.type === tipoId) return;
                        estadoCalc.type = tipoId;
                        limpiarInputsParametros();
                        sincronizarVista();
                    }

                    function reiniciarTipoYParametros() {
                        estadoCalc.type = null;
                        limpiarInputsParametros();
                    }

                    function limpiarInputsParametros() {
                        estadoCalc.cc = null; estadoCalc.year = null; estadoCalc.ton = null; estadoCalc.pax = null; estadoCalc.p6 = null;
                        const inputCc = document.getElementById('input-cc');
                        estadoCalc.cc = null;
                        estadoCalc.year = null;
                        estadoCalc.ton = null;
                        estadoCalc.pax = null;
                        estadoCalc.p6 = null;
                        const inputCc = document.getElementById('input-cc');
                        const inputYear = document.getElementById('input-year');
                        if (inputCc) inputCc.value = '';
                        if (inputCc) inputCc.value = '';
                        if (inputYear) inputYear.value = '';
                        mostrarErrorCampo('cc', null); mostrarErrorCampo('year', null); mostrarErrorCampo('p6', null);
                        mostrarErrorCampo('cc', null);
                        mostrarErrorCampo('year', null);
                        mostrarErrorCampo('p6', null);
                    }

                    function limpiarFormulario() {
                        estadoCalc.svc = null; reiniciarTipoYParametros(); sincronizarVista();
                        estadoCalc.svc = null;
                        reiniciarTipoYParametros();
                        sincronizarVista();
                    }

                    function procesarCilindraje(valor, finalizado) {
                        clearTimeout(timerValidacion.cc);
                        const res = CALC.validarCilindraje(valor, estadoCalc.type);
                        estadoCalc.cc = res.valor;
                        if (finalizado) mostrarErrorCampo('cc', res.mensajeError);
                        else timerValidacion.cc = setTimeout(() => mostrarErrorCampo('cc', res.mensajeError), 600);
                        if (finalizado) {
                            mostrarErrorCampo('cc', res.mensajeError);
                        } else {
                            timerValidacion.cc = setTimeout(() =>
                                mostrarErrorCampo('cc', res.mensajeError), 600
                            );
                        }
                        sincronizarVista();
                    }

                    function procesarAnioModelo(valor, finalizado) {
                        clearTimeout(timerValidacion.year);
                        const res = CALC.validarAnioModelo(valor, TARIFAS.CONFIG.ANIO_TARIFA, finalizado);
                        estadoCalc.year = res.valor;
                        if (finalizado) mostrarErrorCampo('year', res.mensajeError);
                        else timerValidacion.year = setTimeout(() => mostrarErrorCampo('year', res.mensajeError), 600);
                        if (finalizado) {
                            mostrarErrorCampo('year', res.mensajeError);
                        } else {
                            timerValidacion.year = setTimeout(() =>
                                mostrarErrorCampo('year', res.mensajeError), 600
                            );
                        }
                        sincronizarVista();
                    }

                    function mostrarErrorCampo(campo, mensaje) {
                        const errorEl = document.getElementById(`error-${campo}`);
                        if (!errorEl) return;
                        if (mensaje) {
                            errorEl.textContent = mensaje;
                            errorEl.textContent = mensaje;
                            errorEl.style.display = 'block';
                        } else {
                            errorEl.textContent = '';
                            errorEl.textContent = '';
                            errorEl.style.display = 'none';
                        }
                    }

                    /* =========================================================================
                     * 14. UTILIDADES
                     * ====================================================================== */

                    function copiarAlPortapapeles(texto, boton) {
                        function feedbackVisual() {
                            const contenidoOriginal = boton.innerHTML;
                            boton.innerHTML = `${ICONOS.check} <span>Copiado</span>`;
                            boton.classList.add('copied');
                            setTimeout(() => {
                                boton.innerHTML = contenidoOriginal;
                                boton.classList.remove('copied');
                            }, 1400);
                        }
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(texto).then(feedbackVisual).catch(() => fallbackCopiar(texto, feedbackVisual));
                        } else fallbackCopiar(texto, feedbackVisual);
                        navigator.clipboard.writeText(texto).then(feedbackVisual).catch(() =>
                            fallbackCopiar(texto, feedbackVisual)
                        );
                    } else {
                        fallbackCopiar(texto, feedbackVisual);
                    }
                }

    function fallbackCopiar(texto, callback) {
                        try {
                            const temp = document.createElement('textarea');
                            temp.value = texto; temp.style.position = 'fixed'; temp.style.opacity = '0';
                            document.body.appendChild(temp); temp.select(); document.execCommand('copy');
                            document.body.removeChild(temp); if (callback) callback();
                        } catch (e) { console.warn('Error al copiar:', e); }
                        const temp = document.createElement('textarea');
                        temp.value = texto;
                        temp.style.position = 'fixed';
                        temp.style.opacity = '0';
                        document.body.appendChild(temp);
                        temp.select();
                        document.execCommand('copy');
                        document.body.removeChild(temp);
                        if (callback) callback();
                    } catch (e) {
                        console.warn('Error al copiar:', e);
                    }
            }

            function filtrarTablaMaestra(termino) {
                const clean = termino.toLowerCase().trim();
                const filas = dom.tariffsTableBody.querySelectorAll('tr');
                filas.forEach(fila => {
                    const textoFila = fila.textContent.toLowerCase();
                    fila.style.display = (!clean || textoFila.includes(clean)) ? '' : 'none';
                    dom.tariffsTableBody.querySelectorAll('tr').forEach(fila => {
                        fila.style.display = (!clean || fila.textContent.toLowerCase().includes(clean))
                            ? ''
                            : 'none';
                    });
                }

    function verificarVigenciaTarifa() {
                        const anioActual = new Date().getFullYear();
                        if (anioActual !== TARIFAS.CONFIG.ANIO_TARIFA && dom.avisoVigencia) {
                            dom.avisoVigencia.style.display = 'block';
                            dom.avisoVigencia.textContent = `Atención: Esta calculadora opera con el tarifario oficial del año ${TARIFAS.CONFIG.ANIO_TARIFA}. El año del sistema es ${anioActual}.`;
                            dom.avisoVigencia.textContent =
                                `Atención: Esta calculadora opera con el tarifario oficial del año ` +
                                `${TARIFAS.CONFIG.ANIO_TARIFA}. El año del sistema es ${anioActual}.`;
                        }
                    }

    function inicializarTema() {
                        const guardado = localStorage.getItem('soat_theme');
                        const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                        const temaInicial = guardado || (prefiereOscuro ? 'dark' : 'light');
                        const guardado = localStorage.getItem('soat_theme');
                        const prefiereOscuro = window.matchMedia &&
                            window.matchMedia('(prefers-color-scheme: dark)').matches;
                        const temaInicial = guardado || (prefiereOscuro ? 'dark' : 'light');
                        aplicarTema(temaInicial);
                        dom.themeToggle.addEventListener('click', () => {
                            const temaActual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
                            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
                            const temaActual = document.documentElement.getAttribute('data-theme') === 'dark'
                                ? 'dark' : 'light';
                            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
                            aplicarTema(nuevoTema);
                            localStorage.setItem('soat_theme', nuevoTema);
                        });
                    }

    function aplicarTema(tema) {
                        document.documentElement.setAttribute('data-theme', tema);
                        dom.themeToggle.innerHTML = tema === 'dark' ? ICONOS.sun : ICONOS.moon;
                        dom.themeToggle.setAttribute('title', tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
                        dom.themeToggle.setAttribute(
                            'title',
                            tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
                        );
                    }

    /**
     * Formatea una fecha ISO a formato legible en español (Colombia).
     * @param {string} isoStr
     * @returns {string}
     */
    function formatearFechaHora(isoStr) {
                        if (!isoStr) return '';
                        const d = new Date(isoStr);
                        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' }) + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                        return d.toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit'
                        }) + ' ' + d.toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }

    /* =========================================================================
     * INICIO
     * ====================================================================== */
    if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', init);
                } else {
                    init();
                }

            }) ();
