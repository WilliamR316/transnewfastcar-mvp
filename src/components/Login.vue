<template>
  <div class="login-container" :style="{ backgroundImage: `url(${fondoImg})` }">
    <div class="login-overlay">
      <div class="login-card">
        <div class="text-center mb-4">
          <div class="brand-title">Transnewfast</div>
          <p class="brand-subtitle">Panel de Operador</p>
        </div>

        <form @submit.prevent="intentarLogin">
          <div class="mb-3">
            <label class="form-label text-white-50 small">Usuario</label>
            <div class="input-group custom-input-group">
              <input type="text" class="form-control custom-input" v-model="usuario" required placeholder="Usuario">
              <span class="input-group-text custom-icon">👤</span>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label text-white-50 small">Contraseña</label>
            <div class="input-group custom-input-group">
              <input type="password" class="form-control custom-input" v-model="password" required placeholder="••••••••">
              <span class="input-group-text custom-icon">🔒</span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4 text-white-50 small">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="recordar">
              <label class="form-check-label" for="recordar" style="cursor: pointer;">Recordarme</label>
            </div>
            <a href="#" @click.prevent class="text-warning text-decoration-none">¿Olvidaste tu contraseña?</a>
          </div>

          <div v-if="errorMsg" class="alert alert-danger py-2 small text-center mb-3 bg-danger text-white border-0">
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            {{ cargando ? 'Verificando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import fondoImg from '../assets/fondo.jpg'

export default {
  name: 'LoginView',
  data() {
    return {
      usuario: '',
      password: '',
      errorMsg: '',
      cargando: false,
      fondoImg
    }
  },
  methods: {
    async intentarLogin() {
      this.errorMsg = '';
      this.cargando = true;

      try {
        const usuariosRef = collection(db, "usuarios");
        const querySnapshot = await getDocs(usuariosRef);

        if (querySnapshot.empty) {
          this.errorMsg = "No hay usuarios registrados en el sistema.";
          this.cargando = false;
          return;
        }

        const usuarioInput = this.usuario.trim().toLowerCase();
        let usuarioEncontrado = null;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const usuarioDb = (data.usuario || '').trim().toLowerCase();
          
          if (usuarioDb === usuarioInput) {
            usuarioEncontrado = { id: docSnap.id, ...data };
          }
        });

        if (!usuarioEncontrado) {
          this.errorMsg = "El usuario no existe en la base de datos.";
          this.cargando = false;
          return;
        }

        if (usuarioEncontrado.activo === false) {
          this.errorMsg = "Esta cuenta se encuentra suspendida o inactiva.";
          this.cargando = false;
          return;
        }

        if (usuarioEncontrado.password === this.password) {
          this.$emit('login', usuarioEncontrado);
        } else {
          this.errorMsg = "Contraseña incorrecta.";
        }

      } catch (e) {
        console.error("Error al iniciar sesión: ", e);
        this.errorMsg = "Error de conexión con la base de datos.";
      } finally {
        this.cargando = false;
      }
    }
  }
}
</script>

<style scoped>
/* Contenedor principal: imagen centrada y sin estirarse desproporcionadamente */
.login-container {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Capa de cobertura oscura para unificar el tono con la imagen de referencia */
.login-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: rgba(11, 15, 25, 0.65);
  padding: 20px;
}

/* Tarjeta con efecto Glassmorphism oscuro idéntico al original */
.login-card {
  background: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.brand-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.brand-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* Estilos personalizados para los inputs traslúcidos estilo glass */
.custom-input-group {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.custom-input {
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: none !important;
  padding: 10px 14px;
}

.custom-input::placeholder {
  color: #64748b;
}

.custom-icon {
  background: transparent !important;
  border: none !important;
  color: #94a3b8;
}

.form-label {
  font-weight: 500;
}
</style>