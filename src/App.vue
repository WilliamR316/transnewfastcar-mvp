<template>
  <div id="app">
    <!-- Si no está logueado, muestra el Login -->
    <Login v-if="!estaAutenticado" @login="iniciarSesion" />
    
    <!-- Si ya está logueado, muestra el panel completo (ahora llamado MainLayout) -->
    <MainLayout v-else @logout="cerrarSesion" />
  </div>
</template>

<script>
// Importamos nuestras dos pantallas principales
import Login from './components/Login.vue'
import MainLayout from './components/MainLayout.vue' // <--- Actualizado aquí

export default {
  name: 'App',
  components: {
    Login,
    MainLayout // <--- Actualizado aquí
  },
  data() {
    return {
      estaAutenticado: false // Por defecto arranca en falso (bloqueado en el Login)
    }
  },
  methods: {
    iniciarSesion() {
      // Esta función se activa cuando haces clic en Ingresar
      this.estaAutenticado = true;
    },
    cerrarSesion() {
      // Esta función se activa al hacer clic en Cerrar Sesión en el panel
      this.estaAutenticado = false;
    }
  }
}
</script>

<style>
/* Estilos globales básicos para quitar bordes blancos de la ventana */
body, html {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0f172a;
}
</style>