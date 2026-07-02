<template>
  <q-layout view="lHh lpr lFf" class="mojito-hero">
    <q-page-container>
      <q-page class="flex flex-center">
        <div class="col-xs-12 col-sm-8 col-md-5 col-lg-4">
          <div class="text-center q-mb-xl">
            <div class="text-display text-white" style="font-size:2rem; letter-spacing:0.1em">MOJITO</div>
            <div class="text-purple-3 text-caption">Servicios Holísticos</div>
          </div>
          <q-card class="card-glass q-pa-lg">
            <router-view />
          </q-card>
          <div class="text-center q-mt-md">
            <router-link to="/" class="text-purple-3 text-caption">← Volver al inicio</router-link>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
