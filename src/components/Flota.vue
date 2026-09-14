<template>
  <div class="flota-section">
    <div class="header-section">
      <h2>Gestión de Flota y Unidades</h2>
      <button class="btn btn-primary" @click="abrirModalNuevo">➕ Nueva Unidad</button>
    </div>

    <!-- TARJETAS DE MÉTRICAS -->
    <section class="metrics-grid">
      <div class="card metric">
        <div class="metric-icon blue">📊</div>
        <div class="metric-info">
          <h3>Total Flota</h3>
          <span class="metric-number">{{ vehiculos.length }}</span>
        </div>
      </div>
      <div class="card metric">
        <div class="metric-icon green">✅</div>
        <div class="metric-info">
          <h3>T1 - Disponibles</h3>
          <span class="metric-number text-success">{{ contarPorEstado('T1 - Disponible') }}</span>
        </div>
      </div>
      <div class="card metric">
        <div class="metric-icon orange">🚕</div>
        <div class="metric-info">
          <h3>T4 - En Carrera</h3>
          <span class="metric-number text-warning">{{ contarPorEstado('T4 - En Carrera') }}</span>
        </div>
      </div>
      <div class="card metric">
        <div class="metric-icon red">🔧</div>
        <div class="metric-info">
          <h3>T5 - Mantenimiento</h3>
          <span class="metric-number text-danger">{{ contarPorEstado('T5 - Mantenimiento') }}</span>
        </div>
      </div>
    </section>

    <!-- TABLA DE FLOTA -->
    <section class="card table-container">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Conductor</th>
              <th>Placa / Vehículo</th>
              <th>Estado Actual (Cambio Rápido)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="carro in vehiculos" :key="carro.id">
              <td><span class="unidad-id">#{{ carro.id }}</span></td>
              <td class="fw-500">{{ carro.conductor }}</td>
              <td>
                <div class="placa">{{ carro.placa }}</div>
                <div class="text-xs text-muted mt-1">{{ carro.marca }}</div>
              </td>
              
              <!-- NUEVA LISTA DESPLEGABLE DIRECTO EN LA TABLA -->
              <td>
                <select 
                  v-model="carro.estado" 
                  :class="['estado-select', claseEstado(carro.estado)]"
                >
                  <option value="T1 - Disponible">✅ T1 - Disponible</option>
                  <option value="T4 - En Carrera">🚕 T4 - En Carrera</option>
                  <option value="T5 - Mantenimiento">🔧 T5 - Mantenimiento</option>
                  <option value="T6 - Fuera de Serv.">💤 T6 - Fuera de Serv.</option>
                </select>
              </td>

              <td>
                <div class="actions-group">
                  <button class="btn btn-outline btn-edit" @click="editarVehiculo(carro)" title="Editar Unidad">
                    ✏️
                  </button>
                  <button class="btn btn-outline btn-delete" @click="eliminarVehiculo(carro.id)" title="Eliminar Unidad">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="vehiculos.length === 0">
              <td colspan="5" class="text-center" style="padding: 30px; color: #64748b;">
                No hay unidades registradas en la flota.
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
          <h3>{{ modoEdicion ? '✏️ Editar Unidad' : '➕ Registrar Nueva Unidad' }}</h3>
          <button class="close-btn" @click="cerrarModal">✖</button>
        </div>
        
        <form @submit.prevent="guardarVehiculo">
          <div class="form-row">
            <div class="form-group">
              <label for="id_unidad">Número de Unidad (#) *</label>
              <input type="number" id="id_unidad" v-model="formVehiculo.id" required placeholder="Ej. 106" />
            </div>
            
            <div class="form-group">
              <label for="conductor">Nombre del Conductor *</label>
              <input type="text" id="conductor" v-model="formVehiculo.conductor" required placeholder="Ej. Carlos Mendoza" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="placa">Placa *</label>
              <input type="text" id="placa" v-model="formVehiculo.placa" required placeholder="Ej. ABC-1234" style="text-transform: uppercase;" />
            </div>
            
            <div class="form-group">
              <label for="marca">Marca y Modelo</label>
              <input type="text" id="marca" v-model="formVehiculo.marca" placeholder="Ej. Kia Rio 2023" />
            </div>
          </div>

          <div class="form-group">
            <label for="estado">Estado Operativo Inicial *</label>
            <select id="estado" v-model="formVehiculo.estado" required>
              <option value="T1 - Disponible">✅ T1 - Disponible</option>
              <option value="T4 - En Carrera">🚕 T4 - En Carrera</option>
              <option value="T5 - Mantenimiento">🔧 T5 - Mantenimiento</option>
              <option value="T6 - Fuera de Serv.">💤 T6 - Fuera de Servicio</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              {{ modoEdicion ? 'Actualizar Unidad' : 'Guardar Unidad' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Flota',
  data() {
    return {
      rolUsuario: 'admin', 
      mostrarModal: false,
      modoEdicion: false,
      vehiculoIdAEditar: null,
      
      formVehiculo: { 
        id: '', conductor: '', placa: '', marca: '', estado: 'T1 - Disponible' 
      },
      
      // Actualizamos los datos de ejemplo con los nuevos códigos
      vehiculos: [
        { id: 101, conductor: 'Carlos Mendoza', placa: 'ABC-1234', marca: 'Kia Rio', estado: 'T1 - Disponible' },
        { id: 102, conductor: 'Luis Paredes', placa: 'GHE-5678', marca: 'Hyundai Accent', estado: 'T4 - En Carrera' },
        { id: 103, conductor: 'Ana Salazar', placa: 'PBA-9012', marca: 'Chevrolet Sail', estado: 'T1 - Disponible' },
        { id: 104, conductor: 'Jorge Loor', placa: 'OBA-3456', marca: 'Nissan Versa', estado: 'T5 - Mantenimiento' },
        { id: 105, conductor: 'William Rojas', placa: 'XTR-9988', marca: 'Toyota Yaris', estado: 'T6 - Fuera de Serv.' }
      ]
    };
  },
  methods: {
    contarPorEstado(estado) {
      return this.vehiculos.filter(v => v.estado === estado).length;
    },
    claseEstado(estado) {
      if (estado === 'T1 - Disponible') return 'badge-success';
      if (estado === 'T4 - En Carrera') return 'badge-warning';
      if (estado === 'T5 - Mantenimiento') return 'badge-danger';
      return 'badge-dark'; // Para T6 o cualquier otro
    },
    abrirModalNuevo() {
      this.modoEdicion = false;
      this.vehiculoIdAEditar = null;
      const proximoId = this.vehiculos.length > 0 ? Math.max(...this.vehiculos.map(v => v.id)) + 1 : 101;
      
      this.formVehiculo = { id: proximoId, conductor: '', placa: '', marca: '', estado: 'T1 - Disponible' };
      this.mostrarModal = true;
    },
    editarVehiculo(carro) {
      this.modoEdicion = true;
      this.vehiculoIdAEditar = carro.id;
      this.formVehiculo = { ...carro };
      this.mostrarModal = true;
    },
    eliminarVehiculo(id) {
      if (this.rolUsuario !== 'admin') {
        alert('Acceso Denegado: Solo el Administrador puede eliminar unidades.');
        return;
      }
      if (confirm(`¿Estás seguro de que deseas eliminar la unidad #${id} de la flota?`)) {
        this.vehiculos = this.vehiculos.filter(v => v.id !== id);
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
    },
    guardarVehiculo() {
      this.formVehiculo.placa = this.formVehiculo.placa.toUpperCase();
      const idIngresado = parseInt(this.formVehiculo.id);

      if (this.modoEdicion) {
        const repetido = this.vehiculos.find(v => v.id === idIngresado && v.id !== this.vehiculoIdAEditar);
        if (repetido) {
          alert(`El número de unidad #${idIngresado} ya pertenece al conductor ${repetido.conductor}. Usa otro número.`);
          return;
        }

        const index = this.vehiculos.findIndex(v => v.id === this.vehiculoIdAEditar);
        if (index !== -1) {
          this.vehiculos[index] = { ...this.vehiculos[index], ...this.formVehiculo, id: idIngresado };
        }
      } else {
        const repetido = this.vehiculos.find(v => v.id === idIngresado);
        if (repetido) {
          alert(`El número de unidad #${idIngresado} ya está registrado en el sistema.`);
          return;
        }

        this.vehiculos.push({
          ...this.formVehiculo,
          id: idIngresado,
          marca: this.formVehiculo.marca || 'No registrada'
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
.metric-icon.blue { background: #eff6ff; }
.metric-icon.green { background: #f0fdf4; }
.metric-icon.orange { background: #fff7ed; }
.metric-icon.red { background: #fef2f2; }
.metric-info h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 4px; font-weight: 500; }
.metric-number { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
.text-success { color: #166534; }
.text-warning { color: #92400e; }
.text-danger { color: #991b1b; }

.table-container { padding: 0; overflow: hidden; }
.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { background-color: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; }
td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; vertical-align: middle; }
.text-center { text-align: center; }
.fw-500 { font-weight: 500; }
.text-xs { font-size: 0.8rem; }
.text-muted { color: #64748b; }
.mt-1 { margin-top: 4px; }

.unidad-id { font-weight: 700; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 6px; }
.placa { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; display: inline-block; font-weight: 600;}

/* ESTILOS DE LA NUEVA LISTA DESPLEGABLE EN TABLA */
.estado-select {
  padding: 6px 28px 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  appearance: none; /* Quita la flecha por defecto fea del navegador */
  -webkit-appearance: none;
  /* Dibuja una flechita personalizada elegante */
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 10px auto;
  outline: none;
  transition: all 0.2s ease;
}

.estado-select:hover { filter: brightness(0.95); }
.estado-select:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }

/* Clases de colores para el select y los contadores */
.badge-success { background-color: #dcfce7; color: #166534; border-color: #bbf7d0; }
.badge-warning { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
.badge-danger { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }
.badge-dark { background-color: #f1f5f9; color: #475569; border-color: #cbd5e1; }

.actions-group { display: flex; gap: 6px; align-items: center; }
.btn { padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-primary { background-color: #3b82f6; color: white; padding: 8px 16px; }
.btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }
.btn-outline { background-color: transparent; border: 1px solid #cbd5e1; color: #475569; font-size: 1rem; }
.btn-edit:hover { border-color: #3b82f6; color: #3b82f6; background-color: #eff6ff; }
.btn-delete:hover { border-color: #ef4444; color: #ef4444; background-color: #fef2f2; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background: white; width: 100%; max-width: 500px; border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s ease-out; }
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