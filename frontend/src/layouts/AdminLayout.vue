<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-purple-9">
      <q-toolbar>
        <q-btn flat round icon="mdi-menu" @click="drawer = !drawer" />
        <q-toolbar-title class="text-display">Panel de Administración</q-toolbar-title>
        <q-btn flat round icon="mdi-home" to="/" />
        <q-btn flat round icon="mdi-logout" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered class="bg-dark">
      <q-list padding>
        <q-item-label header class="text-purple-3">MOJITO ADMIN</q-item-label>
        <q-item clickable v-ripple to="/admin" exact>
          <q-item-section avatar><q-icon name="mdi-view-dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/orders">
          <q-item-section avatar><q-icon name="mdi-clipboard-list" /></q-item-section>
          <q-item-section>Pedidos</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/services">
          <q-item-section avatar><q-icon name="mdi-cards" /></q-item-section>
          <q-item-section>Servicios</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/settings">
          <q-item-section avatar><q-icon name="mdi-cog" /></q-item-section>
          <q-item-section>Configuración</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const drawer = ref(false);
const auth = useAuthStore();
const router = useRouter();
function handleLogout() { auth.logout(); router.push('/'); }
</script>
