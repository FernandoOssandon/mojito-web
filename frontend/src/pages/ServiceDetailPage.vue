<template>
  <q-page class="bg-dark" v-if="service">
    <!-- Hero del servicio -->
    <div class="relative-position" style="height:320px; background: var(--mojito-gradient)">
      <div class="absolute-bottom q-pa-xl">
        <q-chip :label="service.category?.name" color="purple" text-color="white" icon="mdi-tag" />
        <div class="text-display text-white text-h3 q-mt-sm">{{ service.name }}</div>
      </div>
    </div>

    <div class="row q-pa-xl q-col-gutter-xl">
      <!-- Descripción -->
      <div class="col-xs-12 col-md-8">
        <div class="card-glass q-pa-xl">
          <div class="text-display text-purple-3 text-h6 q-mb-md">Descripción</div>
          <p class="text-grey-3 text-body1">{{ service.longDesc || service.description }}</p>
          <div v-if="service.duration" class="q-mt-md">
            <q-icon name="mdi-clock-outline" color="purple-3" class="q-mr-sm" />
            <span class="text-grey-4">{{ service.duration }}</span>
          </div>
        </div>
      </div>

      <!-- Acción de compra -->
      <div class="col-xs-12 col-md-4">
        <q-card class="card-glass q-pa-xl text-center sticky" style="top: 80px">
          <div class="price-tag q-mb-lg">{{ formatPrice(service.price) }}</div>
          <q-btn unelevated color="purple" label="Agregar al carrito" icon="mdi-cart-plus"
            class="full-width text-display q-mb-md" @click="addToCart" size="lg" />
          <p class="text-grey-6 text-caption q-mb-none">
            Después de la compra, la terapeuta se pondrá en contacto contigo para coordinar la sesión.
          </p>
        </q-card>
      </div>
    </div>
  </q-page>

  <q-page v-else class="flex flex-center bg-dark">
    <q-spinner-orbit color="purple" size="3rem" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import api from '../composables/useApi';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const $q = useQuasar();
const cart = useCartStore();
const service = ref<any>(null);

onMounted(async () => {
  const { data } = await api.get(`/services/${route.params.slug}`);
  service.value = data;
});

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cents / 100);
}

function addToCart() {
  cart.add({
    serviceId: service.value.id,
    name: service.value.name,
    price: service.value.price,
    imageUrl: service.value.imageUrl,
    categoryName: service.value.category?.name,
  });
  cart.isOpen = true;
  $q.notify({ message: `${service.value.name} agregado al carrito`, color: 'purple', icon: 'mdi-cart-check' });
}
</script>
