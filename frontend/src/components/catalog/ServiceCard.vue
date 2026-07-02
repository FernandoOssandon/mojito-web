<template>
  <q-card class="card-glass cursor-pointer column full-height" @click="$router.push(`/services/${service.slug}`)">
    <q-img v-if="service.imageUrl" :src="service.imageUrl" height="180px" class="rounded-borders-top" />
    <div v-else class="flex flex-center bg-purple-9" style="height:180px">
      <q-icon name="mdi-cards" size="3rem" class="text-purple-3" />
    </div>

    <q-card-section class="col">
      <q-chip dense :label="service.category?.name" color="purple-9" text-color="purple-3" class="q-mb-sm" />
      <div class="text-display text-white text-subtitle1 q-mb-xs">{{ service.name }}</div>
      <p class="text-grey-5 text-caption ellipsis-2-lines q-mb-none">{{ service.description }}</p>
    </q-card-section>

    <q-separator color="purple-9" />

    <q-card-actions class="q-pa-md">
      <div class="price-tag" style="font-size:1.1rem">{{ formatPrice(service.price) }}</div>
      <q-space />
      <q-btn round unelevated color="purple" icon="mdi-cart-plus" size="sm"
        @click.stop="addToCart" title="Agregar al carrito" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useCartStore } from '../../stores/cart';

const props = defineProps<{ service: any }>();
const $q = useQuasar();
const cart = useCartStore();

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cents / 100);
}

function addToCart() {
  cart.add({ serviceId: props.service.id, name: props.service.name, price: props.service.price, imageUrl: props.service.imageUrl, categoryName: props.service.category?.name });
  $q.notify({ message: `${props.service.name} agregado`, color: 'purple', icon: 'mdi-cart-check', position: 'top-right' });
}
</script>
