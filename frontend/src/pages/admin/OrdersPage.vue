<template>
  <q-page class="q-pa-xl">
    <div class="text-display text-h4 text-white q-mb-xl">Pedidos</div>

    <div class="row q-gutter-md q-mb-xl">
      <q-select v-model="statusFilter" :options="statusOptions" label="Estado"
        dark filled color="purple" label-color="purple-3" emit-value map-options clearable
        style="min-width:200px" @update:model-value="loadOrders" />
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-orbit color="purple" size="3rem" />
    </div>

    <q-table v-else :rows="orders" :columns="columns" row-key="id" dark flat
      table-header-class="text-purple-3" card-class="card-glass"
      @row-click="(_e, row) => $router.push(`/admin/orders/${row.id}`)">
      <template #body-cell-status="{ value }">
        <q-td><q-chip :color="statusColor(value)" text-color="white" :label="statusLabel(value)" dense /></q-td>
      </template>
      <template #body-cell-total="{ value }">
        <q-td class="text-purple-3">{{ formatPrice(value) }}</q-td>
      </template>
      <template #body-cell-createdAt="{ value }">
        <q-td>{{ formatDate(value) }}</q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../composables/useApi';

const orders = ref<any[]>([]);
const loading = ref(false);
const statusFilter = ref<string | null>(null);

const statusOptions = [
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Pagado', value: 'PAID' },
  { label: 'Cancelado', value: 'CANCELLED' },
  { label: 'Reembolsado', value: 'REFUNDED' },
];

const columns = [
  { name: 'id', label: 'ID', field: (r: any) => r.id.slice(-8).toUpperCase(), align: 'left' as const },
  { name: 'user', label: 'Cliente', field: (r: any) => r.user?.name || r.userId, align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const },
  { name: 'createdAt', label: 'Fecha', field: 'createdAt', align: 'left' as const },
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
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));
}

onMounted(loadOrders);
</script>
