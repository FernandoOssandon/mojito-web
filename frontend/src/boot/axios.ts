import { boot } from 'quasar/wrappers';
import api from '../composables/useApi';

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
});

export { api };
