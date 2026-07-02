<template>
  <q-page class="q-pa-xl" v-if="order">
    <q-btn flat icon="mdi-arrow-left" label="Pedidos" to="/admin/orders" class="q-mb-lg" />

    <div class="row q-col-gutter-xl">
      <div class="col-xs-12 col-md-8">
        <div class="card-glass q-pa-xl q-mb-lg">
          <div class="row items-center q-mb-lg">
            <div class="col">
              <div class="text-display text-h5 text-white">Pedido #{{ order.id.slice(-8).toUpperCase() }}</div>
              <div class="text-grey-5">{{ order.user?.name }} · {{ order.user?.email }}</div>
              <div class="text-grey-6 text-caption">{{ formatDate(order.createdAt) }}</div>
            </div>
            <div class="col-auto">
              <q-select v-model="newStatus" :options="statusOptions" dark filled color="purple"
                label-color="purple-3" label="Cambiar estado" emit-value map-options style="min-width:180px"
                @update:model-value="changeStatus" />
            </div>
          </div>

          <q-separator color="purple-9" class="q-mb-lg" />

          <div v-for="item in order.items" :key="item.id" class="row items-center q-mb-md">
            <div class="col">
              <div class="text-white">{{ item.service?.name }}</div>
              <div class="text-grey-5 text-caption">{{ formatPrice(item.price) }} c/u</div>
            </div>
            <div class="col-auto text-grey-4">x{{ item.quantity }}</div>
            <div class="col-auto text-purple-3 q-ml-md">{{ formatPrice(item.price * item.quantity) }}</div>
          </div>

          <q-separator color="purple-9" class="q-my-lg" />
          <div class="row justify-between">
            <span class="text-grey-5 text-h6">Total</span>
            <span class="text-display text-white text-h5">{{ formatPrice(order.total) }}</span>
          </div>
        </div>

        <!-- Mensajes admin -->
        <div class="card-glass q-pa-xl">
          <div class="text-display text-h6 text-white q-mb-lg">Mensajes con el cliente</div>
          <div v-for="msg in messages" :key="msg.id" class="q-mb-md">
            <div class="row items-baseline q-gutter-xs q-mb-xs">
              <span class="text-weight-medium" :class="msg.sender?.role === 'ADMIN' ? 'text-purple-3' : 'text-teal-3'">
                {{ msg.sender?.name }}
                <q-badge v-if="msg.sender?.role === 'ADMIN'" label="Admin" color="purple-9" class="q-ml-xs" />
              </span>
              <span class="text-grey-6 text-caption">{{ formatDate(msg.createdAt) }}</span>
            </div>
            <div class="card-glass q-pa-md text-grey-3">{{ msg.body }}</div>
          </div>
          <div class="row q-mt-lg q-gutter-sm">
            <q-input v-model="newMsg" placeholder="Responder al cliente..." dark filled color="purple"
              class="col" @keyup.enter="sendMsg" />
            <q-btn unelevated color="purple" icon="mdi-send" @click="sendMsg" :disable="!newMsg.trim()" />
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-4">
        <div class="card-glass q-pa-xl q-mb-lg">
          <div class="text-display text-h6 text-white q-mb-md">Pago</div>
          <div v-if="order.payments?.[0]">
            <div class="text-grey-5 text-caption">Estado</div>
            <q-chip :color="payColor(order.payments[0].status)" text-color="white" :label="payLabel(order.payments[0].status)" />
            <div class="text-grey-5 text-caption q-mt-md">Proveedor</div>
            <div class="text-white">{{ order.payments[0].provider }}</div>
          </div>
          <div v-else class="text-grey-6">Sin pago registrado</div>
        </div>

        <div class="card-glass q-pa-xl">
          <div class="text-display text-h6 text-white q-mb-md">Boleta</div>
          <div v-if="invoice">
            <q-chip :color="invoiceColor(invoice.status)" text-color="white" :label="invoice.status" />
            <div v-if="invoice.folio" class="text-grey-5 text-caption q-mt-md">Folio: {{ invoice.folio }}</div>
          </div>
          <div v-else class="text-grey-6">Sin boleta aún</div>
          <q-btn v-if="invoice?.status === 'FAILED'" unelevated color="orange" label="Reintentar boleta"
            class="q-mt-md full-width" @click="retryInvoice" :loading="retrying" />
        </div>
      </div>
    </div>
  </q-page>

  <q-page v-else class="flex flex-center">
    <q-spinner-orbit color="purple" size="3rem" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import api from '../../composables/useApi';

const route = useRoute();
const $q = useQuasar();
const order = ref<any>(null);
const messages = ref<any[]>([]);
const invoice = ref<any>(null);
const newMsg = ref('');
const newStatus = ref('');
const retrying = ref(false);

const statusOptions = [
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Pagado', value: 'PAID' },
  { label: 'Cancelado', value: 'CANCELLED' },
  { label: 'Reembolsado', value: 'REFUNDED' },
];

async function load() {
  const [o, m, inv] = await Promise.all([
    api.get(`/orders/${route.params.id}`),
    api.get(`/orders/${route.params.id}/messages`),
    api.get(`/invoices/order/${route.params.id}`).catch(() => ({ data: null })),
  ]);
  order.value = o.data;
  messages.value = m.data;
  invoice.value = inv.data;
  newStatus.value = o.data.status;
}

async function changeStatus(val: string) {
  await api.patch(`/orders/${route.params.id}/status`, { status: val });
  $q.notify({ type: 'positive', message: 'Estado actualizado' });
}

async function sendMsg() {
  if (!newMsg.value.trim()) return;
  await api.post(`/orders/${route.params.id}/messages`, { body: newMsg.value });
  newMsg.value = '';
  const { data } = await api.get(`/orders/${route.params.id}/messages`);
  messages.value = data;
}

async function retryInvoice() {
  retrying.value = true;
  try {
    await api.post(`/invoices/order/${route.params.id}/retry`);
    $q.notify({ type: 'positive', message: 'Reintento de boleta iniciado' });
    await load();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al reintentar' });
  } finally {
    retrying.value = false;
  }
}

function payColor(s: string) { return { PENDING: 'orange', APPROVED: 'positive', REJECTED: 'negative', REFUNDED: 'grey' }[s] || 'grey'; }
function payLabel(s: string) { return { PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado', REFUNDED: 'Reembolsado' }[s] || s; }
function invoiceColor(s: string) { return { PENDING: 'orange', ISSUED: 'positive', FAILED: 'negative' }[s] || 'grey'; }
function formatPrice(cents: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cents / 100); }
function formatDate(d: string) { return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d)); }

onMounted(load);
</script>
