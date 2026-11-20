/**
 * ============================================================================
 * SERVICIO DE AUTENTICACIÓN Y ROLES (DEMO) — SOATECH
 * ============================================================================
 * Controla la sesión activa y el cambio ágil de perfiles durante la presentación
 * (Administrador vs. Puntos de Venta).
 *
 * En la Etapa 2 este servicio se conectará al endpoint real de autenticación
 * (/api/auth/login) mediante JWT y cookies HttpOnly.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SOATECH_AUTH = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
    'use strict';

    const storage = window.SOATECH_STORAGE;

    /**
     * Obtiene la lista de usuarios de demostración disponibles.
     */
    async function getUsuariosDemo() {
        return storage.obtener('usuarios') || [];
    }

    /**
     * Obtiene el usuario activo actualmente en la sesión de demostración.
     */
    async function getSesionActual() {
        const usuarios = storage.obtener('usuarios') || [];
        const sesionActivaId = storage.obtener('sesionActivaId');

        let usuario = usuarios.find((u) => u.id === sesionActivaId);
        if (!usuario && usuarios.length > 0) {
            usuario = usuarios[0]; // Fallback al primer usuario
            storage.guardar('sesionActivaId', usuario.id);
        }

        if (usuario && usuario.rol === 'pos' && usuario.posId) {
            const puntos = storage.obtener('puntosDeVenta') || [];
            usuario.posData = puntos.find((p) => p.id === usuario.posId) || null;
        }

        return usuario;
    }

    /**
     * Cambia de perfil en un solo clic (exclusivo para demostración).
     */
    async function cambiarPerfilDemo(usuarioId) {
        const usuarios = storage.obtener('usuarios') || [];
        const usuario = usuarios.find((u) => u.id === usuarioId);
        if (!usuario) {
            throw new Error(`Usuario demo no encontrado: ${usuarioId}`);
        }
        storage.guardar('sesionActivaId', usuario.id);
        return await getSesionActual();
    }

    /**
     * Simulación de login con usuario y contraseña para demostración.
     */
    async function loginDemo(username, password) {
        const usuarios = storage.obtener('usuarios') || [];
        // En modo demo aceptamos cualquier contraseña no vacía o validamos por username
        const usuario = usuarios.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
        if (!usuario) {
            return {
                exito: false,
                mensaje: 'Usuario no encontrado en la base de datos de demostración.'
            };
        }

        storage.guardar('sesionActivaId', usuario.id);
        const sesion = await getSesionActual();
        return {
            exito: true,
            usuario: sesion
        };
    }

    /**
     * Cierra la sesión activa.
     */
    async function logoutDemo() {
        storage.guardar('sesionActivaId', null);
        return true;
    }

    return {
        getUsuariosDemo,
        getSesionActual,
        cambiarPerfilDemo,
        loginDemo,
        logoutDemo
    };
});
