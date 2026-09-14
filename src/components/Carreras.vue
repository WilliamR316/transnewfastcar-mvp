<template>
  <div class="carreras-section">
    <div class="header-section">
      <div>
        <h2>Despacho y Carreras</h2>
        <p class="subtitle">Control en tiempo real de servicios</p>
      </div>
      <!-- Botón de pánico o acción rápida (Opcional) -->
      <button class="btn btn-whatsapp">📻 Transmitir a todos</button>
    </div>

    <div class="despacho-grid">
      <!-- COLUMNA IZQUIERDA: PENDIENTES -->
      <div class="panel pendientes-panel">
        <div class="panel-header">
          <h3>🕒 Solicitudes Pendientes ({{ pendientes.length }})</h3>
        </div>

        <!-- Formulario Rápido -->
        <div class="quick-form card">
          <form @submit.prevent="crearSolicitud">
            <input type="text" v-model="nuevaCarrera.cliente" placeholder="Nombre del Cliente o Teléfono" required />
            <input type="text" v-model="nuevaCarrera.origen" placeholder="📍 Dirección de Origen" required />
            <input type="text" v-model="nuevaCarrera.destino" placeholder="🏁 Destino (Opcional)" />
            <button type="submit" class="btn btn-primary w-100">➕ Agregar a la fila</button>
          </form>
        </div>

        <!-- Lista de Pendientes -->
        <div class="lista-tarjetas">
          <div class="tarjeta-carrera card-pendiente" v-for="solicitud in pendientes" :key="solicitud.id">
            <div class="tarjeta-info">
              <h4>{{ solicitud.cliente }}</h4>
              <p><strong>De:</strong> {{ solicitud.origen }}</p>
              <p v-if="solicitud.destino"><strong>A:</strong> {{ solicitud.destino }}</p>
              <span class="tiempo-espera">Esperando hace {{ calcularTiempo(solicitud.hora) }} min</span>
            </div>
            <div class="tarjeta-acciones">
              <button class="btn btn-primary btn-sm" @click="abrirAsignacion(solicitud)">Asignar Móvil</button>
              <button class="btn btn-outline btn-sm" @click="cancelarSolicitud(solicitud.id)" title="Cancelar">❌</button>
            </div>
          </div>
          <div v-if="pendientes.length === 0" class="empty-state">
            No hay clientes esperando. ¡Todo despejado! 🚕
          </div>
        </div>
      </div>

      <!-- COLUMNA DERECHA: EN CURSO -->
      <div class="panel en-curso-panel">
        <div class="panel-header">
          <h3>🚕 Carreras en Curso ({{ enCurso.length }})</h3>
        </div>

        <div class="lista-tarjetas">
          <div class="tarjeta-carrera card-en-curso" v-for="carrera in enCurso" :key="carrera.id">
            <div class="tarjeta-header">
              <span class="badge badge-warning">Unidad #{{ carrera.unidad }}</span>
              <span class="conductor-name">{{ carrera.conductor }}</span>
            </div>
            <div class="tarjeta-info">
              <h4>{{ carrera.cliente }}</h4>
              <p>📍 {{ carrera.origen }} ➡️ {{ carrera.destino || 'No especificado' }}</p>
            </div>
            <div class="tarjeta-acciones-curso">
              <button class="btn btn-success btn-sm w-100" @click="finalizarCarrera(carrera)">✅ Completar Carrera</button>
            </div>
          </div>
          <div v-if="enCurso.length === 0" class="empty-state">
            No hay unidades en servicio en este momento.
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE ASIGNACIÓN DE UNIDAD -->
    <div class="modal-overlay" v-if="mostrarModal" @click.self="cerrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Seleccionar Unidad Disponible</h3>
          <button class="close-btn" @click="cerrarModal">✖</button>
        </div>
        
        <div class="info-cliente-modal">
          <p><strong>Cliente:</strong> {{ solicitudActiva?.cliente }}</p>
          <p><strong>Recoger en:</strong> {{ solicitudActiva?.origen }}</p>
        </div>

        <div class="lista-unidades-disponibles">
          <div class="unidad-item" v-for="unidad in unidadesDisponibles" :key="unidad.id">
            <div class="unidad-datos">
              <span class="unidad-numero">#{{ unidad.id }}</span>
              <span class="unidad-conductor">{{ unidad.conductor }}</span>
            </div>
            <button class="btn btn-primary btn-sm" @click="confirmarAsignacion(unidad)">Despachar</button>
          </div>
          <div v-if="unidadesDisponibles.length === 0" class="empty-state-modal">
            ⚠️ No hay unidades disponibles en este momento.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Carreras',
  data() {
    return {
      mostrarModal: false,
      solicitudActiva: null,
      
      nuevaCarrera: { cliente: '', origen: '', destino: '' },
      
      // Simulamos la lista de carreras
      pendientes: [
        { id: 1, cliente: 'María González', origen: 'Av. 25 de Junio y Ayacucho', destino: 'Paseo Shopping', hora: new Date(Date.now() - 300000) } // Hace 5 min
      ],
      enCurso: [
        { id: 2, cliente: 'Juan Pérez', origen: 'Terminal Terrestre', destino: 'Centro', unidad: 102, conductor: 'Luis Paredes' }
      ],

      // Simulamos la flota para este módulo (luego vendrá todo de Firebase centralizado)
      flota: [
        { id: 101, conductor: 'Carlos Mendoza', estado: 'Disponible' },
        { id: 102, conductor: 'Luis Paredes', estado: 'En carrera' },
        { id: 103, conductor: 'Ana Salazar', estado: 'Disponible' },
        { id: 104, conductor: 'Jorge Loor', estado: 'Mantenimiento' },
        { id: 105, conductor: 'William Rojas', estado: 'Disponible' }
      ]
    };
  },
  computed: {
    unidadesDisponibles() {
      // Filtramos solo los taxis que están listos para trabajar
      return this.flota.filter(u => u.estado === 'Disponible');
    }
  },
  methods: {
    calcularTiempo(horaRegistro) {
      const ahora = new Date();
      const diferencia = Math.floor((ahora - horaRegistro) / 60000);
      return diferencia;
    },
    crearSolicitud() {
      const nuevoId = Date.now();
      this.pendientes.push({
        id: nuevoId,
        cliente: this.nuevaCarrera.cliente,
        origen: this.nuevaCarrera.origen,
        destino: this.nuevaCarrera.destino,
        hora: new Date()
      });
      // Limpiar formulario
      this.nuevaCarrera = { cliente: '', origen: '', destino: '' };
    },
    cancelarSolicitud(id) {
      if(confirm('¿Cancelar esta solicitud?')) {
        this.pendientes = this.pendientes.filter(p => p.id !== id);
      }
    },
    abrirAsignacion(solicitud) {
      this.solicitudActiva = solicitud;
      this.mostrarModal = true;
    },
    cerrarModal() {
      this.mostrarModal = false;
      this.solicitudActiva = null;
    },
    confirmarAsignacion(unidad) {
      // 1. Crear la carrera en curso
      this.enCurso.push({
        id: this.solicitudActiva.id,
        cliente: this.solicitudActiva.cliente,
        origen: this.solicitudActiva.origen,
        destino: this.solicitudActiva.destino,
        unidad: unidad.id,
        conductor: unidad.conductor
      });

      // 2. Quitar de pendientes
      this.pendientes = this.pendientes.filter(p => p.id !== this.solicitudActiva.id);

      // 3. Cambiar estado del taxi (Simulado para demostración)
      const taxiIndex = this.flota.findIndex(u => u.id === unidad.id);
      if (taxiIndex !== -1) this.flota[taxiIndex].estado = 'En carrera';

      this.cerrarModal();
    },
    finalizarCarrera(carrera) {
      if(confirm(`¿Confirmar que la unidad #${carrera.unidad} finalizó el servicio?`)) {
        // Quitar de en curso
        this.enCurso = this.enCurso.filter(c => c.id !== carrera.id);
        
        // Liberar el taxi
        const taxiIndex = this.flota.findIndex(u => u.id === carrera.unidad);
        if (taxiIndex !== -1) this.flota[taxiIndex].estado = 'Disponible';
      }
    }
  }
};
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header-section h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 4px; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.despacho-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  align-items: start;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  min-height: 600px;
}

.panel-header {
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.panel-header h3 { font-size: 1.1rem; color: #1e293b; }

.quick-form {
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.quick-form input {
  width: 100%; box-sizing: border-box; padding: 10px 14px; margin-bottom: 10px;
  border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;
}
.quick-form input:focus { border-color: #3b82f6; }
.w-100 { width: 100%; }

.lista-tarjetas { display: flex; flex-direction: column; gap: 15px; }

.tarjeta-carrera {
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
}
.card-pendiente { border-left-color: #3b82f6; }
.card-en-curso { border-left-color: #f59e0b; background: #fffbeb;}

.tarjeta-info h4 { font-size: 1.05rem; color: #0f172a; margin-bottom: 8px; }
.tarjeta-info p { font-size: 0.9rem; color: #475569; margin-bottom: 4px; }
.tiempo-espera { display: inline-block; margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 6px; }

.tarjeta-acciones { display: flex; gap: 10px; margin-top: 15px; }
.tarjeta-acciones-curso { margin-top: 15px; }

.tarjeta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #fde68a; }
.conductor-name { font-weight: 600; color: #92400e; font-size: 0.95rem; }

.empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 0.95rem; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; }

/* Botones y Badges */
.btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.btn-sm { padding: 6px 12px; font-size: 0.85rem; }
.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:hover { background-color: #2563eb; }
.btn-success { background-color: #10b981; color: white; }
.btn-success:hover { background-color: #059669; }
.btn-outline { background-color: transparent; border: 1px solid #cbd5e1; color: #475569; }
.btn-outline:hover { background-color: #f1f5f9; }
.btn-whatsapp { background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 0.9rem; }

.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.badge-warning { background: #fef3c7; color: #92400e; }

/* MODAL DE ASIGNACIÓN */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background: white; width: 100%; max-width: 450px; border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.modal-header h3 { color: #0f172a; font-size: 1.25rem; margin: 0; }
.close-btn { background: transparent; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
.close-btn:hover { color: #ef4444; }

.info-cliente-modal { background: #eff6ff; padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
.info-cliente-modal p { margin: 4px 0; font-size: 0.95rem; color: #1e293b; }

.lista-unidades-disponibles { max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.unidad-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; transition: background 0.2s; }
.unidad-item:hover { background: #f8fafc; border-color: #cbd5e1; }
.unidad-numero { font-weight: 700; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 6px; margin-right: 10px; }
.unidad-conductor { font-weight: 500; color: #1e293b; }
.empty-state-modal { text-align: center; padding: 20px; color: #b45309; background: #fffbeb; border-radius: 8px; font-weight: 500; }

@media (max-width: 900px) {
  .despacho-grid { grid-template-columns: 1fr; }
}
</style>