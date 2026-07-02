import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  // ── Público ───────────────────────────────────────────────────────────────
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../pages/IndexPage.vue') },
      { path: 'catalog', name: 'catalog', component: () => import('../pages/CatalogPage.vue') },
      {
        path: 'catalog/:category',
        name: 'catalog-category',
        component: () => import('../pages/CatalogPage.vue'),
      },
      {
        path: 'services/:slug',
        name: 'service-detail',
        component: () => import('../pages/ServiceDetailPage.vue'),
      },
    ],
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('../pages/auth/LoginPage.vue') },
      {
        path: 'register',
        name: 'register',
        component: () => import('../pages/auth/RegisterPage.vue'),
      },
    ],
  },

  // ── Checkout ──────────────────────────────────────────────────────────────
  {
    path: '/checkout',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'success', name: 'checkout-success', component: () => import('../pages/checkout/CheckoutSuccessPage.vue') },
      { path: 'failure', name: 'checkout-failure', component: () => import('../pages/checkout/CheckoutFailurePage.vue') },
      { path: 'pending', name: 'checkout-pending', component: () => import('../pages/checkout/CheckoutPendingPage.vue') },
    ],
  },

  // ── Panel Comprador ───────────────────────────────────────────────────────
  {
    path: '/dashboard',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true, role: 'BUYER' },
    children: [
      { path: '', name: 'buyer-dashboard', component: () => import('../pages/buyer/DashboardPage.vue') },
      { path: 'orders/:id', name: 'buyer-order', component: () => import('../pages/buyer/OrderDetailPage.vue') },
    ],
  },

  // ── Panel Administrador ───────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../pages/admin/DashboardPage.vue') },
      { path: 'services', name: 'admin-services', component: () => import('../pages/admin/ServicesPage.vue') },
      { path: 'orders', name: 'admin-orders', component: () => import('../pages/admin/OrdersPage.vue') },
      { path: 'orders/:id', name: 'admin-order', component: () => import('../pages/admin/OrderDetailPage.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('../pages/admin/SettingsPage.vue') },
    ],
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../pages/ErrorNotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// Navigation guards
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.role === 'ADMIN' && !auth.isAdmin) {
    return next({ name: 'home' });
  }

  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return next({ name: auth.isAdmin ? 'admin-dashboard' : 'buyer-dashboard' });
  }

  next();
});

export default router;
