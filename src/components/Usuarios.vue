<template>
  <div class="usuarios-section">
    <div class="header-section">
      <h2>Gestión de Usuarios y Roles</h2>
      <button class="btn btn-primary" @click="abrirModalNuevo">➕ Nuevo Usuario</button>
    </div>

    <!-- TARJETAS DE MÉTRICAS -->
    <section class="metrics-grid">
      <div class="card metric">
        <div class="metric-icon purple">👥</div>
        <div class="metric-info">
          <h3>Total Usuarios</h3>
          <span class="metric-number">{{ usuarios.length }}</span>
        </div>
      </div>
      <div class="card metric">
        <div class="metric-icon blue">🛡️</div>
        <div class="metric-info">
          <h3>Administradores</h3>
          <span class="metric-number text-primary">{{ contarPorRol('admin') }}</span>
        </div>
      </div>
      <div class="card metric">
        <div class="metric-icon green">🎧</div>
        <div class="metric-info">
          <h3>Operadores</h3>
          <span class="metric-number text-success">{{ contarPorRol('operador') }}</span>
        </div>
      </div>
    </section>

    <!-- TABLA DE USUARIOS -->
    <section class="card table-container">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Usuario de Acceso</th>
              <th>Rol en el Sistema</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuarios" :key="user.id">
              <td><strong>#{{ user.id }}</strong></td>
              <td class="fw-500">{{ user.nombre }}</td>
              <td><span class="username-tag">@{{ user.usuario }}</span></td>
              <td>
                <span :class="['badge', user.rol === 'admin' ? 'badge-purple' : 'badge-blue']">
                  {{ user.rol === 'admin' ? 'Administrador' : 'Operador' }}
                </span>
              </td>
              <td>
                <span :class="['badge', user.activo ? 'badge-success' : 'badge-danger']">
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="actions-group">
                  <button class="btn btn-outline btn-edit" @click="editarUsuario(user)" title="Editar Usuario">
                    ✏️
                  </button>
                  <button class="btn btn-outline btn-delete" @click="eliminarUsuario(user.id)" title="Eliminar Usuario">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="6" class="text-center" style="padding: 30px; color: #64748b;">
                No hay usuarios registrados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- VENTANA MODAL (Crear y Editar) -->
    <div class="modal-overlay" v-if="mostrarModal" @click.self="cerrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modoEdicion ? '✏️ Editar Usuario' : '➕ Registrar Nuevo Usuario' }}</h3>
          <button class="close-btn" @click="cerrarModal">✖</button>
        </div>
        
        <form @submit.prevent="guardarUsuario">
          <div class="form-group">
            <label for="nombre">Nombre Completo *</label>
            <input type="text" id="nombre" v-model="formUsuario.nombre" required placeholder="Ej. Ana Salazar" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="usuario">Usuario de Acceso *</label>
              <input type="text" id="usuario" v-model="formUsuario.usuario" required placeholder="Ej. ana.operador" />
            </div>
            
            <div class="form-group">
              <label for="password">Contraseña {{ modoEdicion ? '(Opcional)' : '*' }}</label>
              <input type="password" id="password" v-model="formUsuario.password" :required="!modoEdicion" placeholder="******" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="rol">Nivel de Acceso (Rol) *</label>
              <select id="rol" v-model="formUsuario.rol" required>
                <option value="operador">🎧 Operador (Limitado)</option>
                <option value="admin">🛡️ Administrador (Control Total)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="estado">Estado de la Cuenta *</label>
              <select id="estado" v-model="formUsuario.activo" required>
                <option :value="true">✅ Activa</option>
                <option :value="false">❌ Suspendida</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              {{ modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Usuarios',
  data() {
    return {
      rolUsuarioActual: 'admin', // Simula quién está usando el sistema ahora
      mostrarModal: false,
      modoEdicion: false,
      usuarioIdAEditar: null,
      
      formUsuario: { 
        nombre: '', usuario: '', password: '', rol: 'operador', activo: true 
      },
      
      usuarios: [
        { id: 1, nombre: 'William Rojas', usuario: 'admin', rol: 'admin', activo: true },
        { id: 2, nombre: 'Ana Salazar', usuario: 'ana.operador', rol: 'operador', activo: true },
        { id: 3, nombre: 'Pedro Ramírez', usuario: 'pedro.noche', rol: 'operador', activo: false }
      ]
    };
  },
  methods: {
    contarPorRol(rol) {
      return this.usuarios.filter(u => u.rol === rol).length;
    },
    abrirModalNuevo() {
      this.modoEdicion = false;
      this.usuarioIdAEditar = null;
      this.formUsuario = { nombre: '', usuario: '', password: '', rol: 'operador', activo: true };
      this.mostrarModal = true;
    },
    editarUsuario(user) {
      this.modoEdicion = true;
      this.usuarioIdAEditar = user.id;
      // Clonamos sin la contraseña por seguridad
      this.formUsuario = { ...user, password: '' };
      this.mostrarModal = true;
    },
    eliminarUsuario(id) {
      if (this.rolUsuarioActual !== 'admin') {
        alert('Acceso Denegado: Solo otro Administrador puede eliminar usuarios.');
        return;
      }
      if (id === 1) {
        alert('Acción Denegada: No puedes eliminar al administrador principal del sistema.');
        return;
      }
      if (confirm(`¿Estás seguro de que deseas eliminar este usuario? Perderá el acceso al panel.`)) {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
    },
    guardarUsuario() {
      if (this.modoEdicion) {
        const index = this.usuarios.findIndex(u => u.id === this.usuarioIdAEditar);
        if (index !== -1) {
          // Si el usuario escribió una nueva contraseña, en el futuro aquí se encriptaría antes de enviar a Firebase
          this.usuarios[index] = { 
            ...this.usuarios[index], 
            nombre: this.formUsuario.nombre,
            usuario: this.formUsuario.usuario,
            rol: this.formUsuario.rol,
            activo: this.formUsuario.activo
          };
        }
      } else {
        // Validar usuario repetido
        const repetido = this.usuarios.find(u => u.usuario === this.formUsuario.usuario);
        if (repetido) {
          alert('Este nombre de usuario de acceso ya está en uso. Por favor, elige otro.');
          return;
        }

        const nuevoId = this.usuarios.length > 0 ? Math.max(...this.usuarios.map(u => u.id)) + 1 : 1;
        this.usuarios.push({
          id: nuevoId,
          nombre: this.formUsuario.nombre,
          usuario: this.formUsuario.usuario,
          rol: this.formUsuario.rol,
          activo: this.formUsuario.activo
        });
      }
      this.cerrarModal();
    }
  }
};
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-section h2 { font-size: 1.25rem; color: #0f172a; }

.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
.card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; }
.metric { display: flex; align-items: center; gap: 20px; }
.metric-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.metric-icon.purple { background: #f3e8ff; }
.metric-icon.blue { background: #eff6ff; }
.metric-icon.green { background: #f0fdf4; }
.metric-info h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 4px; font-weight: 500; }
.metric-number { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
.text-primary { color: #1d4ed8; }
.text-success { color: #166534; }

.table-container { padding: 0; overflow: hidden; }
.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { background-color: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; }
td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; vertical-align: middle; }
.text-center { text-align: center; }
.fw-500 { font-weight: 500; }

.username-tag { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; display: inline-block; color: #475569;}

.badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-purple { background: #f3e8ff; color: #6b21a8; }
.badge-blue { background: #dbeafe; color: #1e40af; }

.actions-group { display: flex; gap: 6px; align-items: center; }
.btn { padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-primary { background-color: #3b82f6; color: white; padding: 8px 16px; }
.btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }
.btn-outline { background-color: transparent; border: 1px solid #cbd5e1; color: #475569; font-size: 1rem; }
.btn-edit:hover { border-color: #3b82f6; color: #3b82f6; background-color: #eff6ff; }
.btn-delete:hover { border-color: #ef4444; color: #ef4444; background-color: #fef2f2; }

/* MODAL CON ANCHOS CORREGIDOS */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background: white; width: 100%; max-width: 550px; border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
.modal-header h3 { color: #0f172a; font-size: 1.25rem; margin: 0; }
.close-btn { background: transparent; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
.close-btn:hover { color: #ef4444; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: #1e293b; outline: none; transition: border-color 0.2s; font-family: inherit; background-color: white;}
.form-group input:focus, .form-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
</style>