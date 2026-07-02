import { createApp } from 'vue';
import { Quasar, Notify, Dialog, Loading, LocalStorage } from 'quasar';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Quasar styles
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v7/mdi-v7.css';
import 'quasar/src/css/index.sass';

// App styles
import './app.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading, LocalStorage },
  config: {
    dark: true,
    brand: {
      primary: '#6B21A8',
      secondary: '#0F766E',
      accent: '#92400E',
      dark: '#1E1B4B',
      'dark-page': '#0F0E1A',
    },
    notify: { position: 'top-right', timeout: 3000 },
  },
  lang: { noHtmlAttrs: false },
});

app.mount('#q-app');
