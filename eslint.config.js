// Configuración mínima de ESLint (sin dependencias extra).
// Uso: npx eslint@9 js
const navegador = Object.fromEntries(
    [
        'window', 'document', 'localStorage', 'navigator', 'console', 'setTimeout', 'clearTimeout',
        'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Event', 'FocusEvent',
        'globalThis', 'module', 'exports', 'define', 'structuredClone', 'Intl'
    ].map(n => [n, 'readonly'])
);

module.exports = [
    {
        files: ['js/**/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: navegador },
        rules: {
            'no-undef': 'error',
            'no-dupe-keys': 'error',
            'no-redeclare': 'error',
            'no-unreachable': 'error',
            'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
            'no-const-assign': 'error',
            'no-dupe-args': 'error',
            'no-duplicate-case': 'error'
        }
    }
];
