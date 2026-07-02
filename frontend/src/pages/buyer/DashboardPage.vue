<template>
  <q-page class="q-pa-xl">
    <div class="text-display text-h4 text-white q-mb-xs">Mi Panel</div>
    <p class="text-grey-5 q-mb-xl">Hola, {{ auth.user?.name }} — aquí están tus pedidos</p>

    <q-select v-model="statusFilter" :options="statusOptions" label="Filtrar por estado"
      dark filled color="purple" label-color="purple-3" emit-value map-options clearable
      class="q-mb-xl" style="max-width:260px" @update:model-value="loadOrders" />

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-orbit color="purple" size="3rem" />
    </div>

    <div v-else-if="orders.length === 0" class="flex flex-center column q-pa-xl text-grey-6">
      <q-icon name="mdi-shopping-outline" size="4rem" class="q-mb-md" />
      <p>Aún no tienes pedidos</p>
      <q-btn unelevated color="purple" label="Ver catálogo" to="/catalog" class="text-display q-mt-sm" />
    </div>

    <div v-else class="q-gutter-md">
      <q-card v-for="order in orders" :key="order.id" class="card-glass cursor-pointer"
        @click="$router.push(`/dashboard/orders/${order.id}`)">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col">
            <div class="text-display text-white">Pedido #{{ order.id.slice(-8).toUpperCase() }}</div>
            <div class="text-grey-5 text-caption">{{ formatDate(order.createdAt) }}</div>
          </div>
          <div class="col-auto">
            <q-chip :color="statusColor(order.status)" text-color="white" :label="statusLabel(order.status)" />
          </div>
          <div class="col-auto text-display text-purple-3 text-h6">
            {{ formatPrice(order.total) }}
          </div>
          <div class="col-auto">
            <q-btn flat round icon="mdi-chevron-right" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../composables/useApi';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
const orders = ref<any[]>([]);
const loading = ref(false);
const statusFilter = ref<string | null>(null);

const statusOptions = [
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Pagado', value: 'PAID' },
  { label: 'Cancelado', value: 'CANCELLED' },
  { label: 'Reembolsado', value: 'REFUNDED' },
];

async function loadOrders() {
  loading.value = true;
  try {
    const params = statusFilter.value ? { status: statusFilter.value } : {};
    const { data } = await api.get('/orders', { params });
    orders.value = data;
  } finally {
    loading.value = false;
  }
}

function statusColor(s: string) {
  return { PENDING: 'orange', PAID: 'positive', CANCELLED: 'negative', REFUNDED: 'grey' }[s] || 'grey';
}
function statusLabel(s: string) {
  return { PENDING: 'Pendiente', PAID: 'Pagado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado' }[s] || s;
}
function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cents / 100);
}
function formatDate(d: string) {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
}

onMounted(loadOrders);
</script>
