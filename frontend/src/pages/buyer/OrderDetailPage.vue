<template>
  <q-page class="q-pa-xl" v-if="order">
    <q-btn flat icon="mdi-arrow-left" label="Mis pedidos" to="/dashboard" class="q-mb-lg" />

    <div class="row q-col-gutter-xl">
      <!-- Info principal -->
      <div class="col-xs-12 col-md-8">
        <div class="card-glass q-pa-xl q-mb-lg">
          <div class="row items-center q-mb-lg">
            <div class="col">
              <div class="text-display text-h5 text-white">
                Pedido #{{ order.id.slice(-8).toUpperCase() }}
              </div>
              <div class="text-grey-5 text-caption">{{ formatDate(order.createdAt) }}</div>
            </div>
            <div class="col-auto">
              <q-chip :color="statusColor(order.status)" text-color="white" :label="statusLabel(order.status)" size="lg" />
            </div>
          </div>

          <q-separator color="purple-9" class="q-mb-lg" />

          <div v-for="item in order.items" :key="item.id" class="row items-center q-mb-md">
            <div class="col">
              <div class="text-white">{{ item.service?.name }}</div>
              <div class="text-grey-5 text-caption">{{ item.service?.category?.name }}</div>
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

        <!-- Mensajes -->
        <div class="card-glass q-pa-xl">
          <div class="text-display text-h6 text-white q-mb-lg">Mensajes</div>
          <div v-for="msg in messages" :key="msg.id" class="q-mb-md">
            <div class="row items-baseline q-gutter-xs q-mb-xs">
              <span class="text-weight-medium" :class="msg.sender?.role === 'ADMIN' ? 'text-purple-3' : 'text-teal-3'">
                {{ msg.sender?.name }}
              </span>
              <span class="text-grey-6 text-caption">{{ formatDate(msg.createdAt) }}</span>
            </div>
            <div class="card-glass q-pa-md text-grey-3">{{ msg.body }}</div>
          </div>
          <div class="row q-mt-lg q-gutter-sm">
            <q-input v-model="newMsg" placeholder="Escribe un mensaje..." dark filled color="purple"
              class="col" @keyup.enter="sendMsg" />
            <q-btn unelevated color="purple" icon="mdi-send" @click="sendMsg" :disable="!newMsg.trim()" />
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-xs-12 col-md-4">
        <div class="card-glass q-pa-xl">
          <div class="text-display text-h6 text-white q-mb-md">Pago</div>
          <div v-if="order.payments?.[0]">
            <q-item-label caption class="text-grey-5">Estado</q-item-label>
            <q-chip :color="payColor(order.payments[0].status)" text-color="white" :label="payLabel(order.payments[0].status)" />
            <q-item-label caption class="text-grey-5 q-mt-md">Proveedor</q-item-label>
            <div class="text-white">{{ order.payments[0].provider }}</div>
          </div>
          <div v-else class="text-grey-6">Sin información de pago</div>
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
const newMsg = ref('');

async function loadOrder() {
  const { data } = await api.get(`/orders/${route.params.id}`);
  order.value = data;
}
async function loadMessages() {
  const { data } = await api.get(`/orders/${route.params.id}/messages`);
  messages.value = data;
}
async function sendMsg() {
  if (!newMsg.value.trim()) return;
  await api.post(`/orders/${route.params.id}/messages`, { body: newMsg.value });
  newMsg.value = '';
  await loadMessages();
}

function statusColor(s: string) {
  return { PENDING: 'orange', PAID: 'positive', CANCELLED: 'negative', REFUNDED: 'grey' }[s] || 'grey';
}
function statusLabel(s: string) {
  return { PENDING: 'Pendiente', PAID: 'Pagado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado' }[s] || s;
}
function payColor(s: string) {
  return { PENDING: 'orange', APPROVED: 'positive', REJECTED: 'negative', REFUNDED: 'grey' }[s] || 'grey';
}
function payLabel(s: string) {
  return { PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado', REFUNDED: 'Reembolsado' }[s] || s;
}
function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cents / 100);
}
function formatDate(d: string) {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
}

onMounted(async () => {
  await Promise.all([loadOrder(), loadMessages()]);
});
</script>
