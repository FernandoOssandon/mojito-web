<template>
  <q-page class="q-pa-xl">
    <div class="row items-center q-mb-xl">
      <div class="text-display text-h4 text-white col">Servicios</div>
      <q-btn unelevated color="purple" icon="mdi-plus" label="Nuevo Servicio" class="text-display"
        @click="openDialog()" />
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-orbit color="purple" size="3rem" />
    </div>

    <q-table v-else :rows="services" :columns="columns" row-key="id" dark flat
      table-header-class="text-purple-3" card-class="card-glass">
      <template #body-cell-price="{ value }">
        <q-td>{{ formatPrice(value) }}</q-td>
      </template>
      <template #body-cell-isActive="{ value }">
        <q-td><q-chip :color="value ? 'positive' : 'negative'" :label="value ? 'Activo' : 'Inactivo'" dense /></q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td>
          <q-btn flat round icon="mdi-pencil" size="sm" @click="openDialog(props.row)" />
          <q-btn flat round :icon="props.row.isActive ? 'mdi-archive' : 'mdi-restore'" size="sm"
            @click="toggleActive(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog crear/editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="card-glass q-pa-xl" style="min-width:500px">
        <div class="text-display text-h6 text-white q-mb-lg">
          {{ editTarget?.id ? 'Editar' : 'Nuevo' }} Servicio
        </div>
        <q-form @submit.prevent="saveService" class="q-gutter-md">
          <q-input v-model="form.name" label="Nombre" dark filled color="purple" label-color="purple-3"
            :rules="[v => !!v || 'Requerido']" />
          <q-input v-model="form.description" label="Descripción" type="textarea" dark filled
            color="purple" label-color="purple-3" />
          <q-input v-model.number="form.priceCLP" label="Precio (CLP)" type="number" dark filled
            color="purple" label-color="purple-3" hint="Ingresa el monto en pesos chilenos"
            :rules="[v => v > 0 || 'Debe ser mayor a 0']" />
          <q-select v-model="form.categoryId" :options="categoryOptions" label="Categoría"
            dark filled color="purple" label-color="purple-3" emit-value map-options
            :rules="[v => !!v || 'Requerido']" />
          <q-input v-model="form.imageUrl" label="URL de imagen (opcional)" dark filled
            color="purple" label-color="purple-3" />
          <div class="row q-gutter-sm justify-end q-mt-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn unelevated color="purple" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../composables/useApi';

const $q = useQuasar();
const services = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const dialog = ref(false);
const saving = ref(false);
const editTarget = ref<any>(null);

const form = ref({ name: '', description: '', priceCLP: 0, categoryId: '', imageUrl: '' });

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const, sortable: true },
  { name: 'price', label: 'Precio', field: 'price', align: 'right' as const, sortable: true },
  { name: 'isActive', label: 'Estado', field: 'isActive', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'center' as const },
];

const categoryOptions = ref<{ label: string; value: string }[]>([]);

async function load() {
  loading.value = true;
  const [svcs, cats] = await Promise.all([api.get('/services?all=true'), api.get('/categories?all=true')]);
  services.value = svcs.data;
  categories.value = cats.data;
  categoryOptions.value = cats.data.map((c: any) => ({ label: c.name, value: c.id }));
  loading.value = false;
}

function openDialog(svc?: any) {
  editTarget.value = svc || null;
  form.value = svc
    ? { name: svc.name, description: svc.description || '', priceCLP: svc.price / 100, categoryId: svc.categoryId, imageUrl: svc.imageUrl || '' }
    : { name: '', description: '', priceCLP: 0, categoryId: '', imageUrl: '' };
  dialog.value = true;
}

async function saveService() {
  saving.value = true;
  try {
    const payload = { ...form.value, price: Math.round(form.value.priceCLP * 100) };
    if (editTarget.value?.id) {
      await api.patch(`/services/${editTarget.value.id}`, payload);
    } else {
      await api.post('/services', payload);
    }
    $q.notify({ type: 'positive', message: 'Servicio guardado' });
    dialog.value = false;
    await load();
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error' });
  } finally {
    saving.value = false;
  }
}

async function toggleActive(svc: any) {
  await api.patch(`/services/${svc.id}`, { isActive: !svc.isActive });
  await load();
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cents / 100);
}

onMounted(load);
</script>
