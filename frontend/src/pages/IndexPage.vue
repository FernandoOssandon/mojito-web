<template>
  <!-- Hero -->
  <section class="mojito-hero flex flex-center text-center q-pa-xl" style="min-height:100vh">
    <div class="col-xs-12 col-md-8">
      <div class="text-display text-white q-mb-md" style="font-size:clamp(2.5rem,6vw,5rem); letter-spacing:0.08em">
        MOJITO
      </div>
      <p class="text-purple-3 text-h6 q-mb-xl" style="font-family:var(--mojito-font-body)">
        Guía espiritual para tu camino — Tarot, Sanaciones y Rituales
      </p>
      <q-btn unelevated color="purple" label="Ver Catálogo" to="/catalog" size="lg"
        class="text-display q-mr-md" icon-right="mdi-arrow-right" />
      <q-btn outline color="white" label="Conoce más" @click="scrollTo('categories')" size="lg" />
    </div>
  </section>

  <!-- Categorías -->
  <section id="categories" class="q-pa-xl bg-dark">
    <div class="text-center q-mb-xl">
      <div class="text-display text-white text-h4 q-mb-sm">Nuestros Servicios</div>
      <q-separator color="purple" style="width:60px; margin:0 auto" />
    </div>
    <div class="row q-col-gutter-lg justify-center">
      <div v-for="cat in categories" :key="cat.id" class="col-xs-12 col-sm-6 col-md-4">
        <q-card class="card-glass cursor-pointer" @click="$router.push(`/catalog/${cat.slug}`)">
          <q-card-section class="text-center q-pa-xl">
            <q-icon :name="catIcon(cat.slug)" size="3rem" class="text-purple-3 q-mb-md" />
            <div class="text-display text-white text-h6 q-mb-sm">{{ cat.name }}</div>
            <p class="text-grey-5 text-body2">{{ cat.description }}</p>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="purple" label="Explorar" :to="`/catalog/${cat.slug}`" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../composables/useApi';

const categories = ref<any[]>([]);

onMounted(async () => {
  const { data } = await api.get('/categories');
  categories.value = data;
});

function catIcon(slug: string) {
  return { tarot: 'mdi-cards', 'servicios-espirituales': 'mdi-star-four-points', brujeria: 'mdi-moon-waxing-crescent' }[slug] || 'mdi-sparkles';
}
function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
</script>
