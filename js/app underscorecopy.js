/**
 * ============================================================================
 * COPIA DE SEGURIDAD - CONTROLADOR ORIGINAL APP.JS
 * ============================================================================
 */

(function () {
    'use strict';

    const TARIFAS = window.SOAT_TARIFAS;
    const CALC = window.SOAT_CALCULADORA;

    if (!TARIFAS || !CALC) {
        console.error('Error: No se pudieron cargar los módulos maestros de tarifas o calculadora.');
        return;
    }

    const estado = {
        svc: null, type: null, cc: null, year: null, ton: null, pax: null, p6: null
    };

    let animFrame = null;
    let ultimoCobro = 0;
    let ultimoConsignar = 0;
    let timerValidacion = {};
    const PREFIERE_MOVIMIENTO_REDUCIDO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ICONOS = {
        car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
        moto: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="M12 17h4l4-8h-5l-3 4H8l-3-4H2"/></svg>',
        truck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
        bus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M8 3v8"/><path d="M16 3v8"/><path d="M4 15h16"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>',
        tri: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14l5-7h4l3 7"/><path d="M11 7h4v4h-5z"/></svg>',
        copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
        reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
        sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    };

    const dom = {
        themeToggle: document.getElementById('btnThemeToggle'),
        btnReset: document.getElementById('btnReset'),
        avisoVigencia: document.getElementById('avisoVigencia'),
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
        tableSearch: document.getElementById('tableSearch'),
        tariffsTableBody: document.getElementById('tariffsTableBody')
    };

    function initUI() {
        renderServicios();
        renderTiposVehiculo();
        renderCamposParametros();
        renderTablaMaestra();
        verificarVigenciaTarifa();
        inicializarTema();
        configurarEventosGlobales();
        sincronizarVista();
    }

    function renderServicios() {
        const html = Object.keys(TARIFAS.SERVICIOS).map(key => {
            const s = TARIFAS.SERVICIOS[key];
            return `<button type="button" class="service-btn" data-service="${s.id}"><span class="service-btn-title">${s.nombre}</span><span class="service-btn-desc">${s.tag}</span></button>`;
        }).join('');
        dom.servicesGrid.innerHTML = html;
    }

    function renderTiposVehiculo() {
        const html = TARIFAS.GRUPOS.map(grupo => {
            const tarjetas = grupo.tipos.map(id => {
                const tipo = TARIFAS.TIPOS.find(t => t.id === id);
                if (!tipo) return '';
                const iconoSvg = ICONOS[tipo.icono] || ICONOS.car;
                return `<button type="button" class="type-card" data-vehicle-type="${tipo.id}"><div class="type-card-icon">${iconoSvg}</div><div class="type-card-info"><div class="type-card-name">${tipo.nombre}</div><div class="type-card-sub">${tipo.subtitulo}</div><div class="type-card-why" data-why-type="${tipo.id}"></div></div></button>`;
            }).join('');
            return `<div class="types-category-group"><div class="category-group-title">${grupo.nombre}</div><div class="types-grid">${tarjetas}</div></div>`;
        }).join('');
        dom.typesCatalog.innerHTML = html;
    }

    function renderCamposParametros() {
        const campos = ['cc', 'year', 'ton', 'pax', 'p6'];
        const html = `
            <div id="paramEmptyNotice" class="state-message-box">Selecciona primero un tipo de vehículo en el paso anterior.</div>
            <div id="paramNoneNotice" class="state-message-box" style="display:none;">Este tipo de vehículo tiene tarifa única y no requiere parámetros adicionales.</div>
            ${campos.map(k => {
                const d = TARIFAS.PREGUNTAS[k];
                if (d.opciones) {
                    return `<div class="param-field" id="field-${k}" style="display:none;"><label class="param-label">${d.etiqueta}</label><p class="param-help">${d.ayuda}</p><div class="param-options-grid">${d.opciones.map(opc => `<button type="button" class="param-option-btn" data-param-key="${k}" data-param-val="${opc[0]}"><span class="param-option-text">${opc[1]}</span>${opc[2] ? `<span class="param-option-sub">${opc[2]}</span>` : ''}</button>`).join('')}</div><div class="field-error-msg" id="error-${k}" style="display:none;"></div></div>`;
                } else {
                    return `<div class="param-field" id="field-${k}" style="display:none;"><label class="param-label" for="input-${k}">${d.etiqueta}</label><p class="param-help">${d.ayuda}</p><div class="param-input-wrapper"><input type="text" inputmode="numeric" id="input-${k}" class="param-input" placeholder="${d.placeholder}" autocomplete="off"></div><div class="field-error-msg" id="error-${k}" style="display:none;"></div></div>`;
                }
            }).join('')}
        `;
        dom.paramsContainer.innerHTML = html;
    }

    function renderTablaMaestra() {
        const codigos = Object.keys(TARIFAS.PRECIOS_BASE).map(Number).sort((a, b) => a - b);
        const rows = codigos.map(codigo => {
            const precioBase = TARIFAS.PRECIOS_BASE[codigo];
            const calculo = CALC.calcularCobroFinal(codigo, precioBase, TARIFAS.CONFIG, TARIFAS.PRECIOS_FIJOS_COBRO);
            const desc = TARIFAS.DESCRIPCIONES[codigo] || '';
            return `<tr data-tariff-code="${codigo}"><td><span class="code-pill">${codigo}</span></td><td>${desc}</td><td class="col-amount">${CALC.formatearMoneda(precioBase)}</td><td class="col-amount">${CALC.formatearMoneda(calculo.cobroCliente)}</td><td class="col-amount" style="color:var(--success-solid);">${CALC.formatearMoneda(calculo.ganancia)}</td></tr>`;
        }).join('');
        dom.tariffsTableBody.innerHTML = rows;
    }

    function sincronizarVista() {
        const tipoActual = TARIFAS.TIPOS.find(t => t.id === estado.type);
        document.querySelectorAll('[data-service]').forEach(btn => btn.classList.toggle('selected', btn.getAttribute('data-service') === estado.svc));
        document.querySelectorAll('[data-vehicle-type]').forEach(card => {
            const typeId = card.getAttribute('data-vehicle-type');
            const tipo = TARIFAS.TIPOS.find(t => t.id === typeId);
            const esSeleccionado = estado.type === typeId;
            const esDisponible = !estado.svc || (tipo && tipo.servicios.includes(estado.svc));
            const whyEl = card.querySelector(`[data-why-type="${typeId}"]`);
            card.classList.toggle('selected', esSeleccionado);
            card.classList.toggle('disabled', !esDisponible);
            if (whyEl) {
                if (estado.svc && !esDisponible) {
                    const permitidos = tipo.servicios.map(s => TARIFAS.SERVICIOS[s]?.nombre || s).join(' o ');
                    whyEl.textContent = `Aplica a: ${permitidos}`;
                    whyEl.style.display = 'block';
                } else {
                    whyEl.textContent = '';
                    whyEl.style.display = 'none';
                }
            }
        });

        const emptyNotice = document.getElementById('paramEmptyNotice');
        const noneNotice = document.getElementById('paramNoneNotice');
        if (!tipoActual) {
            emptyNotice.style.display = 'block';
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
                if (el) el.style.display = debeMostrar ? 'flex' : 'none';
            });
        }

        document.querySelectorAll('[data-param-key]').forEach(btn => {
            btn.classList.toggle('selected', estado[btn.getAttribute('data-param-key')] === btn.getAttribute('data-param-val'));
        });

        actualizarIndicadoresPasos(tipoActual);
        ejecutarLiquidacion();
    }

    function actualizarIndicadoresPasos(tipoActual) {
        const svcCompletado = !!estado.svc;
        dom.stepCard1.classList.toggle('completed', svcCompletado);
        dom.stepTag1.textContent = svcCompletado ? TARIFAS.SERVICIOS[estado.svc]?.nombre : 'Pendiente';
        const tipoCompletado = !!tipoActual;
        dom.stepCard2.classList.toggle('completed', tipoCompletado);
        dom.stepTag2.textContent = tipoCompletado ? tipoActual.nombre : (svcCompletado ? 'Selecciona tipo' : 'Esperando paso 1');
        let resumenParams = 'Pendiente';
        let paramsCompletados = false;
        if (tipoActual) {
            if (tipoActual.preguntas.length === 0) {
                resumenParams = 'Sin datos adicionales';
                paramsCompletados = true;
            } else {
                const completas = tipoActual.preguntas.every(k => estado[k] != null);
                if (completas) {
                    paramsCompletados = true;
                    const partes = [];
                    if (estado.cc) partes.push(`${CALC.formatearNumero(estado.cc)} c.c.`);
                    if (estado.year) partes.push(`Mod. ${estado.year}`);
                    if (estado.ton) partes.push(TARIFAS.PREGUNTAS.ton.opciones.find(o => o[0] === estado.ton)?.[1] || '');
                    if (estado.pax) partes.push(TARIFAS.PREGUNTAS.pax.opciones.find(o => o[0] === estado.pax)?.[1] || '');
                    if (estado.p6) partes.push(estado.p6 === 'si' ? '6+ pas.' : '<6 pas.');
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
        const resultado = CALC.liquidar(estado, TARIFAS);
        document.querySelectorAll('.tariffs-table tr.highlighted').forEach(tr => tr.classList.remove('highlighted'));
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
                <div class="empty-state-title">Esperando datos de cotización</div>
                <p class="empty-state-desc">Selecciona el servicio y tipo de vehículo en el panel izquierdo para calcular el valor exacto del SOAT al instante.</p>
            </div>
        `;
        ultimoCobro = 0;
        ultimoConsignar = 0;
    }

    function renderResumenExitoso(res) {
        const codigo = res.codigo;
        const cobro = res.precioCobrar;
        const consignar = res.precioConsignar;
        const ganancia = res.ganancia;
        let notaMargen = res.esPrecioFijo 
            ? 'Precio fijo especial para motocicletas hasta 200 c.c.'
            : (res.aplicoRedondeo 
                ? `Margen reglamentario (${CALC.formatearMoneda(res.margenAplicado)}) redondeado al alza a $1.000.`
                : `Margen reglamentario comercial de ${CALC.formatearMoneda(res.margenAplicado)}.`);

        dom.summaryContainer.innerHTML = `
            <div class="quote-highlight-card">
                <div class="quote-label-row">
                    <span class="quote-label">Valor a cobrar al cliente</span>
                    <button type="button" class="btn-copy" data-copy-val="${CALC.formatearMoneda(cobro)}">${ICONOS.copy} <span>Copiar</span></button>
                </div>
                <div class="quote-value-row"><div class="quote-amount" id="animCobro">${CALC.formatearMoneda(cobro)}</div></div>
            </div>
            <div class="quote-secondary-card">
                <div>
                    <div class="quote-label">Valor a consignar (Punto de venta)</div>
                    <div class="quote-secondary-amount" id="animConsignar">${CALC.formatearMoneda(consignar)}</div>
                </div>
                <button type="button" class="btn-copy" data-copy-val="${CALC.formatearMoneda(consignar)}">${ICONOS.copy} <span>Copiar</span></button>
            </div>
            <div class="gain-banner"><span class="gain-label">Tu ganancia neta:</span><span class="gain-amount">${CALC.formatearMoneda(ganancia)}</span></div>
            <div class="breakdown-list">
                <div class="breakdown-item"><span class="breakdown-term">Código tarifario oficial</span><span class="breakdown-val"><span class="code-pill">${codigo}</span></span></div>
                <div class="breakdown-item"><span class="breakdown-term">Clasificación legal</span><span class="breakdown-val">${res.descripcion}</span></div>
                <div class="breakdown-item"><span class="breakdown-term">Servicio asignado</span><span class="breakdown-val">${TARIFAS.SERVICIOS[estado.svc]?.nombre || 'Particular'}</span></div>
                <div class="breakdown-item"><span class="breakdown-term">Política comercial</span><span class="breakdown-val" style="font-size:12px;color:var(--text-muted);">${notaMargen}</span></div>
            </div>
        `;
        animarValoresMonetarios(cobro, consignar);
    }

    function animarValoresMonetarios(cobroFinal, consignarFinal) {
        cancelAnimationFrame(animFrame);
        const elCobro = document.getElementById('animCobro');
        const elConsignar = document.getElementById('animConsignar');
        if (!elCobro || !elConsignar) return;
        if (PREFIERE_MOVIMIENTO_REDUCIDO || (ultimoCobro === cobroFinal && ultimoConsignar === consignarFinal)) {
            elCobro.textContent = CALC.formatearMoneda(cobroFinal);
            elConsignar.textContent = CALC.formatearMoneda(consignarFinal);
            ultimoCobro = cobroFinal;
            ultimoConsignar = consignarFinal;
            return;
        }
        const inicioCobro = ultimoCobro || cobroFinal;
        const inicioConsignar = ultimoConsignar || consignarFinal;
        ultimoCobro = cobroFinal;
        ultimoConsignar = consignarFinal;
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
                elConsignar.textContent = CALC.formatearMoneda(consignarFinal);
            }
        }
        animFrame = requestAnimationFrame(step);
    }

    function configurarEventosGlobales() {
        dom.servicesGrid.addEventListener('click', e => {
            const btn = e.target.closest('[data-service]');
            if (btn) seleccionarServicio(btn.getAttribute('data-service'));
        });
        dom.typesCatalog.addEventListener('click', e => {
            const card = e.target.closest('[data-vehicle-type]');
            if (card && !card.classList.contains('disabled')) seleccionarTipoVehiculo(card.getAttribute('data-vehicle-type'));
        });
        dom.paramsContainer.addEventListener('click', e => {
            const btn = e.target.closest('[data-param-key]');
            if (btn) {
                estado[btn.getAttribute('data-param-key')] = btn.getAttribute('data-param-val');
                sincronizarVista();
            }
        });
        dom.paramsContainer.addEventListener('input', e => {
            if (e.target.id === 'input-cc') procesarCilindraje(e.target.value, false);
            if (e.target.id === 'input-year') procesarAnioModelo(e.target.value, false);
        });
        dom.paramsContainer.addEventListener('focusout', e => {
            if (e.target.id === 'input-cc') procesarCilindraje(e.target.value, true);
            if (e.target.id === 'input-year') procesarAnioModelo(e.target.value, true);
        });
        dom.summaryContainer.addEventListener('click', e => {
            const btn = e.target.closest('[data-copy-val]');
            if (btn) copiarAlPortapapeles(btn.getAttribute('data-copy-val'), btn);
        });
        dom.btnReset.addEventListener('click', limpiarFormulario);
        dom.tableSearch.addEventListener('input', e => filtrarTablaMaestra(e.target.value));
    }

    function seleccionarServicio(svcId) {
        if (estado.svc === svcId) return;
        estado.svc = svcId;
        const tipoActual = TARIFAS.TIPOS.find(t => t.id === estado.type);
        if (tipoActual && !tipoActual.servicios.includes(svcId)) reiniciarTipoYParametros();
        const disponibles = TARIFAS.TIPOS.filter(t => t.servicios.includes(svcId));
        if (!estado.type && disponibles.length === 1) {
            seleccionarTipoVehiculo(disponibles[0].id);
            return;
        }
        sincronizarVista();
    }

    function seleccionarTipoVehiculo(tipoId) {
        if (estado.type === tipoId) return;
        estado.type = tipoId;
        limpiarInputsParametros();
        sincronizarVista();
    }

    function reiniciarTipoYParametros() {
        estado.type = null;
        limpiarInputsParametros();
    }

    function limpiarInputsParametros() {
        estado.cc = null; estado.year = null; estado.ton = null; estado.pax = null; estado.p6 = null;
        const inputCc = document.getElementById('input-cc');
        const inputYear = document.getElementById('input-year');
        if (inputCc) inputCc.value = '';
        if (inputYear) inputYear.value = '';
        mostrarErrorCampo('cc', null); mostrarErrorCampo('year', null); mostrarErrorCampo('p6', null);
    }

    function limpiarFormulario() {
        estado.svc = null; reiniciarTipoYParametros(); sincronizarVista();
    }

    function procesarCilindraje(valor, finalizado) {
        clearTimeout(timerValidacion.cc);
        const res = CALC.validarCilindraje(valor, estado.type);
        estado.cc = res.valor;
        if (finalizado) mostrarErrorCampo('cc', res.mensajeError);
        else timerValidacion.cc = setTimeout(() => mostrarErrorCampo('cc', res.mensajeError), 600);
        sincronizarVista();
    }

    function procesarAnioModelo(valor, finalizado) {
        clearTimeout(timerValidacion.year);
        const res = CALC.validarAnioModelo(valor, TARIFAS.CONFIG.ANIO_TARIFA, finalizado);
        estado.year = res.valor;
        if (finalizado) mostrarErrorCampo('year', res.mensajeError);
        else timerValidacion.year = setTimeout(() => mostrarErrorCampo('year', res.mensajeError), 600);
        sincronizarVista();
    }

    function mostrarErrorCampo(campo, mensaje) {
        const errorEl = document.getElementById(`error-${campo}`);
        if (!errorEl) return;
        if (mensaje) {
            errorEl.textContent = mensaje;
            errorEl.style.display = 'block';
        } else {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

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
    }

    function fallbackCopiar(texto, callback) {
        try {
            const temp = document.createElement('textarea');
            temp.value = texto; temp.style.position = 'fixed'; temp.style.opacity = '0';
            document.body.appendChild(temp); temp.select(); document.execCommand('copy');
            document.body.removeChild(temp); if (callback) callback();
        } catch (e) { console.warn('Error al copiar:', e); }
    }

    function filtrarTablaMaestra(termino) {
        const clean = termino.toLowerCase().trim();
        const filas = dom.tariffsTableBody.querySelectorAll('tr');
        filas.forEach(fila => {
            const textoFila = fila.textContent.toLowerCase();
            fila.style.display = (!clean || textoFila.includes(clean)) ? '' : 'none';
        });
    }

    function verificarVigenciaTarifa() {
        const anioActual = new Date().getFullYear();
        if (anioActual !== TARIFAS.CONFIG.ANIO_TARIFA && dom.avisoVigencia) {
            dom.avisoVigencia.style.display = 'block';
            dom.avisoVigencia.textContent = `Atención: Esta calculadora opera con el tarifario oficial del año ${TARIFAS.CONFIG.ANIO_TARIFA}. El año del sistema es ${anioActual}.`;
        }
    }

    function inicializarTema() {
        const guardado = localStorage.getItem('soat_theme');
        const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const temaInicial = guardado || (prefiereOscuro ? 'dark' : 'light');
        aplicarTema(temaInicial);
        dom.themeToggle.addEventListener('click', () => {
            const temaActual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
            aplicarTema(nuevoTema);
            localStorage.setItem('soat_theme', nuevoTema);
        });
    }

    function aplicarTema(tema) {
        document.documentElement.setAttribute('data-theme', tema);
        dom.themeToggle.innerHTML = tema === 'dark' ? ICONOS.sun : ICONOS.moon;
        dom.themeToggle.setAttribute('title', tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
