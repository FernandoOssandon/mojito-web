<template>
  <q-page class="flex flex-center">
    <div class="card-glass q-pa-xl text-center" style="max-width:480px">
      <q-icon name="mdi-close-circle" size="5rem" color="negative" class="q-mb-lg" />
      <div class="text-display text-h4 text-white q-mb-md">Pago fallido</div>
      <p class="text-grey-4 q-mb-xl">
        No se pudo procesar tu pago. No se realizó ningún cargo.
        Puedes intentarlo de nuevo o elegir otro método de pago.
      </p>
      <q-btn unelevated color="purple" label="Volver al catálogo" to="/catalog" class="text-display" />
    </div>
  </q-page>
</template>
