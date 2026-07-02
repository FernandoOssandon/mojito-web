<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();

// Restaurar sesión al cargar la app
onMounted(() => auth.restore());
</script>
