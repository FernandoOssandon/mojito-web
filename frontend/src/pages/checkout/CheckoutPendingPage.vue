<template>
  <q-page class="flex flex-center">
    <div class="card-glass q-pa-xl text-center" style="max-width:480px">
      <q-icon name="mdi-clock-outline" size="5rem" color="orange" class="q-mb-lg" />
      <div class="text-display text-h4 text-white q-mb-md">Pago pendiente</div>
      <p class="text-grey-4 q-mb-xl">
        Tu pago está siendo procesado. Esto puede tardar algunos minutos.
        Te notificaremos por correo cuando se confirme.
      </p>
      <q-btn unelevated color="purple" label="Ver mis pedidos" to="/dashboard" class="text-display q-mr-md" />
      <q-btn outline color="purple-3" label="Ir al inicio" to="/" class="text-display" />
    </div>
  </q-page>
</template>
