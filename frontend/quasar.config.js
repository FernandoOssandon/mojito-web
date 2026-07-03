const { configure } = require('quasar/wrappers');

module.exports = configure((/* ctx */) => {
  return {
    eslint: { fix: true },

    boot: ['pinia', 'axios'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons', 'mdi-v7'],

    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'history',
      typescript: { strict: false, vueShim: true },
      vitePlugins: [],
    },

    devServer: {
      open: false,
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    framework: {
      config: {
        dark: 'auto',
        brand: {
          primary: '#6B21A8',
          secondary: '#0F766E',
          accent: '#92400E',
          dark: '#1E1B4B',
          'dark-page': '#0F0E1A',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037',
        },
        notify: { position: 'top-right', timeout: 3000 },
      },
      iconSet: 'material-icons',
      lang: 'es',
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage'],
    },

    animations: ['fadeIn', 'fadeOut', 'slideInUp'],

    ssr: { pwa: false, prodPort: 3000 },
    pwa: { workboxMode: 'generateSW' },
    capacitor: { hideSplashScreenOnAppLoad: true },
    electron: { inspectPort: 5858, bundler: 'packager' },
    bex: { contentScripts: ['my-content-script'] },
  };
});
