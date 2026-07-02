<template>
  <q-page class="flex flex-center">
    <div class="card-glass q-pa-xl text-center" style="max-width:480px">
      <q-icon name="mdi-check-circle" size="5rem" color="positive" class="q-mb-lg" />
      <div class="text-display text-h4 text-white q-mb-md">¡Pago exitoso!</div>
      <p class="text-grey-4 q-mb-xl">
        Tu pedido ha sido recibido. Recibirás tu boleta electrónica por correo y
        la terapeuta se pondrá en contacto contigo pronto.
      </p>
      <q-btn unelevated color="purple" label="Ver mis pedidos" to="/dashboard" class="text-display q-mr-md" />
      <q-btn outline color="purple-3" label="Volver al catálogo" to="/catalog" class="text-display" />
    </div>
  </q-page>
</template>
