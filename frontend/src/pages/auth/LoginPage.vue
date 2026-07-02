<template>
  <q-page class="flex flex-center">
    <q-card class="card-glass q-pa-xl" style="width:100%;max-width:420px">
      <div class="text-center q-mb-xl">
        <div class="text-display text-h4 text-purple-3">✦ Mojito</div>
        <p class="text-grey-5 q-mt-sm">Ingresa a tu cuenta</p>
      </div>

      <q-form @submit.prevent="submit" class="q-gutter-md">
        <q-input v-model="form.email" label="Correo electrónico" type="email"
          dark filled color="purple" label-color="purple-3"
          :rules="[v => !!v || 'Requerido', v => /.+@.+/.test(v) || 'Email inválido']" />

        <q-input v-model="form.password" label="Contraseña"
          :type="showPass ? 'text' : 'password'" dark filled color="purple" label-color="purple-3"
          :rules="[v => !!v || 'Requerido']">
          <template #append>
            <q-btn flat round :icon="showPass ? 'mdi-eye-off' : 'mdi-eye'" @click="showPass = !showPass" />
          </template>
        </q-input>

        <q-btn type="submit" unelevated color="purple" class="full-width text-display" size="lg"
          label="Ingresar" icon-right="mdi-login" :loading="loading" />

        <p class="text-center text-grey-5 q-mt-md">
          ¿No tienes cuenta?
          <router-link to="/auth/register" class="text-purple-3">Regístrate</router-link>
        </p>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const form = ref({ email: '', password: '' });
const showPass = ref(false);
const loading = ref(false);

async function submit() {
  loading.value = true;
  try {
    const data = await auth.login(form.value.email, form.value.password);
    const redirect = (route.query.redirect as string) || (data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    router.push(redirect);
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Credenciales incorrectas' });
  } finally {
    loading.value = false;
  }
}
</script>
