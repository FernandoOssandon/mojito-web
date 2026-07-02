<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn flat round icon="mdi-cards" to="/" class="text-purple-3" />
        <q-toolbar-title>
          <router-link to="/" class="text-display text-white text-no-decoration" style="font-size:1.2rem; letter-spacing:0.06em">
            MOJITO
          </router-link>
        </q-toolbar-title>

        <!-- Nav links -->
        <q-btn flat label="Catálogo" to="/catalog" class="text-white q-mr-sm" />

        <!-- Cart btn -->
        <q-btn flat round icon="mdi-cart" class="text-white q-mr-sm" @click="cart.isOpen = true">
          <q-badge v-if="cart.count" color="purple" floating>{{ cart.count }}</q-badge>
        </q-btn>

        <!-- Auth -->
        <template v-if="!auth.isAuthenticated">
          <q-btn flat label="Ingresar" to="/auth/login" class="text-white" />
        </template>
        <template v-else>
          <q-btn-dropdown flat :label="auth.user?.name" class="text-white">
            <q-list>
              <q-item v-if="auth.isAdmin" clickable v-close-popup to="/admin">
                <q-item-section avatar><q-icon name="mdi-shield-crown" /></q-item-section>
                <q-item-section>Administración</q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/dashboard">
                <q-item-section avatar><q-icon name="mdi-account" /></q-item-section>
                <q-item-section>Mis compras</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar><q-icon name="mdi-logout" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Cart Drawer -->
    <CartDrawer v-model="cart.isOpen" />

    <q-footer class="bg-dark q-pa-md text-center text-grey-6">
      <small>© 2026 Mojito — Servicios Holísticos. Todos los derechos reservados.</small>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import CartDrawer from '../components/cart/CartDrawer.vue';

const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>
