<template>
  <q-page class="flex flex-center">
    <q-card class="card-glass q-pa-xl" style="width:100%;max-width:460px">
      <div class="text-center q-mb-xl">
        <div class="text-display text-h4 text-purple-3">✦ Mojito</div>
        <p class="text-grey-5 q-mt-sm">Crea tu cuenta</p>
      </div>

      <q-form @submit.prevent="submit" class="q-gutter-md">
        <q-input v-model="form.name" label="Nombre completo" dark filled color="purple" label-color="purple-3"
          :rules="[v => !!v || 'Requerido']" />

        <q-input v-model="form.email" label="Correo electrónico" type="email"
          dark filled color="purple" label-color="purple-3"
          :rules="[v => !!v || 'Requerido', v => /.+@.+/.test(v) || 'Email inválido']" />

        <q-input v-model="form.phone" label="Teléfono (opcional)" dark filled color="purple" label-color="purple-3"
          hint="+56 9 XXXX XXXX" />

        <q-input v-model="form.password" label="Contraseña"
          :type="showPass ? 'text' : 'password'" dark filled color="purple" label-color="purple-3"
          :rules="[v => !!v || 'Requerido', v => v.length >= 8 || 'Mínimo 8 caracteres']">
          <template #append>
            <q-btn flat round :icon="showPass ? 'mdi-eye-off' : 'mdi-eye'" @click="showPass = !showPass" />
          </template>
        </q-input>

        <q-btn type="submit" unelevated color="purple" class="full-width text-display" size="lg"
          label="Crear cuenta" icon-right="mdi-account-plus" :loading="loading" />

        <p class="text-center text-grey-5 q-mt-md">
          ¿Ya tienes cuenta?
          <router-link to="/auth/login" class="text-purple-3">Inicia sesión</router-link>
        </p>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const form = ref({ name: '', email: '', password: '', phone: '' });
const showPass = ref(false);
const loading = ref(false);

async function submit() {
  loading.value = true;
  try {
    await auth.register(form.value.name, form.value.email, form.value.password, form.value.phone || undefined);
    router.push('/dashboard');
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al registrarse' });
  } finally {
    loading.value = false;
  }
}
</script>
