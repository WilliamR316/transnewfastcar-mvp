<template>
  <div class="login-wrapper">
    <!-- Esta capa oscurece un poco la foto de fondo para que el panel resalte -->
    <div class="overlay"></div>

    <div class="login-box">
      <div class="login-header">
        <h1>Transnewfast</h1>
        <p>Panel de Operador 🚕</p>
      </div>

      <!-- El evento @submit.prevent evita que la página se recargue, 
           y emite el evento 'login' para que App.vue te deje entrar al Dashboard -->
      <form @submit.prevent="$emit('login')">
        <div class="input-container">
          <input type="text" v-model="usuario" placeholder="Usuario" required />
          <span class="icon">👤</span>
        </div>

        <div class="input-container">
          <input type="password" v-model="password" placeholder="Contraseña" required />
          <span class="icon">🔒</span>
        </div>

        <div class="options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="recordarme" />
            <span class="text">Recordarme</span>
          </label>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" class="btn-login">Ingresar</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      usuario: '',
      password: '',
      recordarme: false
    };
  }
};
</script>

<style scoped>
/* CONTENEDOR PRINCIPAL CON TU NUEVA IMAGEN Y TAMAÑO AJUSTADO */
.login-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('../assets/fondo.jpg'); 
  
  /* ESTA ES LA MAGIA PARA LA IMAGEN */
  background-size: 100% 100%; /* Obliga a la imagen a caber en la pantalla entera */
  background-position: center center;
  background-attachment: fixed;
  
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* FILTRO OSCURO SOBRE LA IMAGEN */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.65); /* Tono azul oscuro semitransparente */
  z-index: 1;
}

/* TARJETA CENTRAL (ESTILO CRISTAL) */
.login-box {
  position: relative;
  z-index: 2; /* Para que quede por encima del filtro oscuro */
  background: rgba(255, 255, 255, 0.1); /* Blanco muy transparente */
  backdrop-filter: blur(12px); /* Efecto de desenfoque de cristal */
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #ffffff;
  font-size: 2rem;
  margin: 0 0 5px 0;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.login-header p {
  color: #e2e8f0;
  font-size: 1rem;
  margin: 0;
}

/* INPUTS (CAJAS DE TEXTO) */
.input-container {
  position: relative;
  margin-bottom: 20px;
}

.input-container input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.4); /* Fondo oscuro transparente */
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 14px 45px 14px 16px; /* Espacio extra a la derecha para el ícono */
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-container input::placeholder {
  color: #94a3b8;
}

.input-container input:focus {
  border-color: #facc15; /* Borde amarillo al hacer clic */
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2);
}

.input-container .icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
  pointer-events: none;
}

/* OPCIONES (RECORDARME Y OLVIDASTE) */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 0.85rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  color: #e2e8f0;
  cursor: pointer;
}

.checkbox-container input {
  margin-right: 8px;
  cursor: pointer;
}

.forgot-link {
  color: #facc15;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #fef08a;
  text-decoration: underline;
}

/* BOTÓN INGRESAR */
.btn-login {
  width: 100%;
  background-color: #facc15; /* Amarillo vibrante */
  color: #0f172a; /* Texto oscuro para contrastar */
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.btn-login:hover {
  background-color: #eab308;
  transform: translateY(-2px); /* Pequeño salto al pasar el mouse */
}
</style>