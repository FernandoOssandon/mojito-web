<template>
  <q-drawer v-model="model" side="right" :width="360" class="bg-dark">
    <div class="column full-height">
      <!-- Header -->
      <q-toolbar class="bg-purple-9">
        <q-icon name="mdi-cart" class="q-mr-sm" />
        <q-toolbar-title class="text-display">Mi Carrito</q-toolbar-title>
        <q-btn flat round icon="mdi-close" @click="model = false" />
      </q-toolbar>

      <!-- Items -->
      <q-scroll-area class="col q-pa-md">
        <q-list v-if="!cart.isEmpty">
          <q-item v-for="item in cart.items" :key="item.serviceId" class="card-glass q-mb-sm rounded-borders">
            <q-item-section>
              <q-item-label class="text-white text-weight-medium">{{ item.name }}</q-item-label>
              <q-item-label caption class="text-purple-3">{{ cart.formatPrice(item.price) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-xs">
                <q-btn flat round dense icon="mdi-minus" size="xs" @click="cart.decrement(item.serviceId)" />
                <span class="text-white">{{ item.quantity }}</span>
                <q-btn flat round dense icon="mdi-plus" size="xs" @click="cart.add(item)" />
                <q-btn flat round dense icon="mdi-delete" size="xs" color="negative" @click="cart.remove(item.serviceId)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="flex flex-center column q-pa-xl text-grey-6">
          <q-icon name="mdi-cart-outline" size="3rem" class="q-mb-md" />
          <p>Tu carrito está vacío</p>
        </div>
      </q-scroll-area>

      <!-- Footer -->
      <div v-if="!cart.isEmpty" class="q-pa-md">
        <q-separator color="purple-9" class="q-mb-md" />
        <div class="row justify-between q-mb-md">
          <span class="text-grey-5">Total</span>
          <span class="text-display text-white text-h6">{{ cart.formatPrice(cart.total) }}</span>
        </div>
        <q-btn unelevated color="purple" label="Proceder al pago" icon-right="mdi-lock"
          class="full-width text-display" size="lg" :disable="!auth.isAuthenticated" @click="checkout" />
        <p v-if="!auth.isAuthenticated" class="text-grey-6 text-caption text-center q-mt-sm">
          <router-link to="/auth/login" class="text-purple-3">Inicia sesión</router-link> para continuar
        </p>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';
import api from '../../composables/useApi';

const model = defineModel<boolean>();
const cart = useCartStore();
const auth = useAuthStore();
const $q = useQuasar();
const router = useRouter();

async function checkout() {
  try {
    $q.loading.show({ message: 'Procesando orden...' });
    // 1. Crear la orden
    const { data: order } = await api.post('/orders', cart.toOrderDto());
    // 2. Iniciar checkout (obtener URL de MercadoPago)
    const { data: payment } = await api.post(`/payments/checkout/${order.id}`);
    cart.clear();
    model.value = false;
    // 3. Redirigir al checkout de MercadoPago
    window.location.href = payment.checkoutUrl;
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al procesar el pago' });
  } finally {
    $q.loading.hide();
  }
}
</script>
