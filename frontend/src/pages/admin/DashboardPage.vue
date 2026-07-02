<template>
  <q-page class="q-pa-xl">
    <div class="text-display text-h4 text-white q-mb-xl">Panel Administrador</div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-xs-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card class="card-glass text-center q-pa-lg">
          <q-icon :name="stat.icon" size="2.5rem" :class="stat.color" />
          <div class="text-display text-white text-h4 q-mt-sm">{{ stat.value }}</div>
          <div class="text-grey-5 text-caption">{{ stat.label }}</div>
        </q-card>
      </div>
    </div>

    <div class="text-display text-h6 text-white q-mb-md">Últimos pedidos</div>
    <div v-if="loadingOrders" class="flex flex-center q-pa-xl">
      <q-spinner-orbit color="purple" size="2rem" />
    </div>
    <div v-else class="q-gutter-sm">
      <q-card v-for="order in recentOrders" :key="order.id" class="card-glass cursor-pointer"
        @click="$router.push(`/admin/orders/${order.id}`)">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col">
            <div class="text-white">#{{ order.id.slice(-8).toUpperCase() }}</div>
            <div class="text-grey-5 text-caption">{{ order.user?.name }} — {{ formatDate(order.createdAt) }}</div>
          </div>
          <q-chip :color="statusColor(order.status)" text-color="white" :label="statusLabel(order.status)" />
          <div class="text-purple-3 text-display">{{ formatPrice(order.total) }}</div>
          <q-btn flat round icon="mdi-chevron-right" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../composables/useApi';

const recentOrders = ref<any[]>([]);
const loadingOrders = ref(false);

const stats = computed(() => [
  { label: 'Pedidos hoy', value: recentOrders.value.filter(o => isToday(o.createdAt)).length, icon: 'mdi-calendar-today', color: 'text-purple-3' },
  { label: 'Pendientes', value: recentOrders.value.filter(o => o.status === 'PENDING').length, icon: 'mdi-clock-outline', color: 'text-orange' },
  { label: 'Pagados', value: recentOrders.value.filter(o => o.status === 'PAID').length, icon: 'mdi-check-circle', color: 'text-positive' },
  { label: 'Total pedidos', value: recentOrders.value.length, icon: 'mdi-cart', color: 'text-teal-3' },
]);

function isToday(d: string) {
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
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
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short' }).format(new Date(d));
}

onMounted(async () => {
  loadingOrders.value = true;
  try {
    const { data } = await api.get('/orders');
    recentOrders.value = data;
  } finally {
    loadingOrders.value = false;
  }
});
</script>
