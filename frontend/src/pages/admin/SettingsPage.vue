<template>
  <q-page class="q-pa-xl">
    <div class="text-display text-h4 text-white q-mb-xl">Configuración del sitio</div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-orbit color="purple" size="3rem" />
    </div>

    <div v-else class="card-glass q-pa-xl" style="max-width:640px">
      <q-form @submit.prevent="save" class="q-gutter-lg">
        <div v-for="(value, key) in form" :key="key">
          <q-input v-model="form[key]" :label="labelFor(key)" dark filled color="purple" label-color="purple-3" />
        </div>
        <q-btn type="submit" unelevated color="purple" label="Guardar cambios" icon-right="mdi-content-save"
          class="text-display" :loading="saving" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../composables/useApi';

const $q = useQuasar();
const loading = ref(false);
const saving = ref(false);
const form = ref<Record<string, string>>({});

const labels: Record<string, string> = {
  site_name: 'Nombre del sitio',
  site_tagline: 'Tagline / subtítulo',
  contact_email: 'Email de contacto',
  contact_phone: 'Teléfono de contacto',
  instagram_url: 'URL de Instagram',
  facebook_url: 'URL de Facebook',
};

function labelFor(key: string) {
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get('/site-config');
    form.value = data;
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    await api.patch('/site-config', form.value);
    $q.notify({ type: 'positive', message: 'Configuración guardada' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' });
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>
