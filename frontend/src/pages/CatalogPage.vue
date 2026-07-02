<template>
  <q-page class="bg-dark q-pa-xl">
    <div class="text-display text-white text-h4 q-mb-md">
      {{ activeCategory?.name || 'Todos los Servicios' }}
    </div>

    <!-- Filtro de categorías -->
    <div class="q-mb-xl">
      <q-btn-toggle v-model="selectedCat" spread no-caps :options="catOptions"
        color="purple-9" text-color="white" toggle-color="purple" class="q-mb-md" />
    </div>

    <!-- Grid de servicios -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-orbit color="purple" size="3rem" />
    </div>
    <div v-else class="row q-col-gutter-lg">
      <div v-for="svc in services" :key="svc.id" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <ServiceCard :service="svc" />
      </div>
      <div v-if="!services.length" class="col-12 text-center text-grey-6 q-pa-xl">
        No hay servicios disponibles en esta categoría.
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../composables/useApi';
import ServiceCard from '../components/catalog/ServiceCard.vue';

const route = useRoute();
const services = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const selectedCat = ref<string | null>(null);

const catOptions = computed(() => [
  { label: 'Todos', value: null },
  ...categories.value.map((c) => ({ label: c.name, value: c.slug })),
]);

const activeCategory = computed(() => categories.value.find((c) => c.slug === selectedCat.value));

async function load() {
  loading.value = true;
  try {
    const params = selectedCat.value ? { category: selectedCat.value } : {};
    const { data } = await api.get('/services', { params });
    services.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const { data } = await api.get('/categories');
  categories.value = data;
  selectedCat.value = (route.params.category as string) || null;
  await load();
});

watch(selectedCat, load);
</script>
