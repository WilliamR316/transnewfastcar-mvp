<template>
  <div class="container-fluid mt-4">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="mb-1"><i class="bi bi-taxi-front-fill text-warning me-2"></i>Módulo de Despacho y Carreras</h3>
      <p class="text-muted small">Asignación de unidades y monitoreo en tiempo real</p>
    </div>

    <div class="row g-3">
      <!-- PANEL IZQUIERDO: FORMULARIO Y UNIDADES -->
      <div class="col-md-3">
        <!-- Tarjeta Nueva Carrera / Reserva -->
        <div class="card shadow-sm mb-3 border-0">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0">
              <i class="bi" :class="esReserva ? 'bi-calendar-plus text-primary' : 'bi-journal-plus text-danger'"></i> 
              {{ esReserva ? 'Nueva Reserva' : 'Nueva Carrera' }}
            </h6>
            
            <!-- Switch Mágico para cambiar entre Inmediato y Reserva -->
            <div class="form-check form-switch m-0 d-flex align-items-center">
              <input class="form-check-input me-2 mt-0" type="checkbox" id="switchReserva" v-model="esReserva" style="cursor: pointer;">
              <label class="form-check-label small fw-bold" :class="esReserva ? 'text-primary' : 'text-muted'" for="switchReserva" style="cursor: pointer; font-size: 0.75rem;">
                Programar Carrera
              </label>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="registrarCarrera">
              
              <!-- Buscador de Cliente con Autocompletado -->
              <div class="mb-2 position-relative">
                <label class="form-label small fw-bold text-muted mb-1">Cliente (Buscar en BD):</label>
                <input 
                  type="text" 
                  class="form-control form-control-sm" 
                  v-model="busquedaCliente" 
                  @input="buscarCliente" 
                  placeholder="Escribe el nombre o teléfono..." 
                  required 
                  autocomplete="off"
                >
                
                <!-- Alerta visual Fija de Observaciones del Cliente -->
                <div v-if="clienteNotasVisibles" class="alert mt-1 mb-0 py-1 px-2 border-danger text-danger" style="font-size: 0.75rem; background-color: #fff0f0;">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i><strong>Nota:</strong> {{ clienteNotasVisibles }}
                </div>
                
                <!-- Lista de Sugerencias Flotante -->
                <ul v-if="clientesSugeridos.length > 0" class="list-group position-absolute w-100 shadow" style="z-index: 1050; max-height: 180px; overflow-y: auto; top: 100%;">
                  <li 
                    v-for="c in clientesSugeridos" 
                    :key="c.id" 
                    class="list-group-item list-group-item-action py-2 px-2" 
                    @click="seleccionarCliente(c)" 
                    style="cursor: pointer;"
                  >
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <small class="fw-bold text-primary">{{ c.nombre }}</small>
                      <small class="text-muted" style="font-size: 0.7rem;"><i class="bi bi-telephone-fill me-1"></i>{{ c.telefono }}</small>
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                      <i class="bi bi-geo-alt-fill me-1"></i>{{ c.direccion }}
                    </div>
                  </li>
                </ul>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-bold text-muted mb-1">Origen (Requerido):</label>
                <input type="text" class="form-control form-control-sm" v-model="nuevaCarrera.origen" placeholder="Dirección de recogida" required>
              </div>
              <div class="mb-2">
                <label class="form-label small fw-bold text-muted mb-1">Destino (Opcional):</label>
                <input type="text" class="form-control form-control-sm" v-model="nuevaCarrera.destino" placeholder="Por definir...">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted mb-1">Tarifa Sugerida (Opcional):</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-light text-muted fw-bold">$</span>
                  <input type="number" step="0.01" class="form-control" v-model="nuevaCarrera.tarifa" @blur="formatearTarifa" placeholder="0.00">
                </div>
              </div>

              <!-- CAMPOS EXCLUSIVOS PARA RESERVAS -->
              <div v-if="esReserva" class="p-2 mb-3 bg-light border rounded">
                <div class="mb-2">
                  <label class="form-label small fw-bold text-primary mb-1"><i class="bi bi-clock me-1"></i>Fecha y Hora de Recogida:</label>
                  <input type="datetime-local" class="form-control form-control-sm border-primary" v-model="nuevaCarrera.fechaProgramada" required>
                </div>
                <div>
                  <label class="form-label small fw-bold text-primary mb-1">Avisar al operador:</label>
                  <select class="form-select form-select-sm border-primary" v-model="nuevaCarrera.minutosAviso" required>
                    <option value="15">15 minutos antes</option>
                    <option value="30">30 minutos antes</option>
                    <option value="45">45 minutos antes</option>
                    <option value="60">1 hora antes</option>
                  </select>
                </div>
              </div>

              <button type="submit" class="btn w-100 btn-sm fw-bold" :class="esReserva ? 'btn-primary' : 'btn-success'" :disabled="!esReserva && !unidadSeleccionada">
                <i class="bi" :class="esReserva ? 'bi-calendar-check me-1' : 'bi-send-fill me-1'"></i>
                {{ esReserva ? 'Guardar Reserva' : 'Registrar y Asignar' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Tarjeta Unidades Libres (Solo visible si NO es reserva) -->
        <div v-show="!esReserva" class="card shadow-sm border-0">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <h6 class="fw-bold"><i class="bi bi-circle-fill text-success small me-2"></i>Unidades Libres ({{ unidadesLibres.length }})</h6>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush" style="max-height: 250px; overflow-y: auto;">
              <button 
                v-for="unidad in unidadesLibres" :key="unidad.id"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                :class="{'bg-light border-primary': unidadSeleccionada && unidadSeleccionada.id === unidad.id}"
                @click="seleccionarUnidad(unidad)"
              >
                <span class="fw-bold text-primary">#{{ String(unidad.numero).padStart(2, '0') }}</span>
                <small class="text-muted">{{ unidad.chofer }}</small>
              </button>
              <div v-if="unidadesLibres.length === 0" class="text-center p-3 text-muted small">
                No hay unidades disponibles.
              </div>
            </div>
            <div class="card-footer bg-white border-0 py-2">
              <small class="text-muted fst-italic" style="font-size: 0.7rem;">Haz clic en una unidad para asignarla.</small>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL DERECHO: TABLERO KANBAN Y RESERVAS -->
      <div class="col-md-9">
        
        <!-- ZONA SUPERIOR: RESERVAS PROGRAMADAS -->
        <div v-if="carrerasProgramadas.length > 0" class="mb-3 bg-white p-3 rounded shadow-sm border-start border-primary border-4">
          <h6 class="fw-bold text-primary mb-3"><i class="bi bi-calendar-event me-2"></i>Reservas Pendientes de Despacho</h6>
          <div class="row g-2">
            
            <div v-for="reserva in carrerasProgramadas" :key="reserva.id" class="col-md-4">
              <!-- Tarjeta de Reserva -->
              <div class="card h-100 border position-relative" :class="reserva.alertaActiva ? 'border-danger bg-danger text-white parpadeo' : 'border-secondary bg-light'">
                
                <!-- Botón de Anular Reserva en la esquina superior derecha -->
                <button 
                  @click.stop="anularReserva(reserva.id)" 
                  class="btn btn-sm position-absolute top-0 end-0 m-1 border-0" 
                  :class="reserva.alertaActiva ? 'text-white' : 'text-danger'" 
                  title="Anular Reserva" 
                  style="z-index: 10;"
                >
                  <i class="bi bi-x-circle-fill"></i>
                </button>

                <div class="card-body p-2 pt-3">
                  <div class="small fw-bold mb-1 pe-4"><i class="bi bi-person me-1"></i>{{ reserva.cliente }}</div>
                  <div class="small mb-1" style="font-size: 0.75rem;"><i class="bi bi-geo-alt me-1"></i>{{ reserva.origen }}</div>
                  <div class="small mb-2 fw-bold" :class="reserva.alertaActiva ? 'text-white' : 'text-primary'">
                    <i class="bi bi-clock-history me-1"></i>Para: {{ formatearFechaHora(reserva.fechaProgramada) }}
                  </div>
                  
                  <button v-if="reserva.alertaActiva" class="btn btn-warning btn-sm w-100 fw-bold shadow-sm" @click="abrirDespachoReserva(reserva)">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> ¡ASIGNAR UNIDAD AHORA!
                  </button>
                  <button v-else class="btn btn-outline-secondary btn-sm w-100" @click="abrirDespachoReserva(reserva)">
                    Despachar Anticipado
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ZONA INFERIOR: KANBAN TRADICIONAL -->
        <div class="row g-3">
          <!-- COLUMNA 1: PENDIENTES -->
          <div class="col-md-4">
            <div class="bg-light rounded p-2 h-100 border">
              <h6 class="text-center text-muted fw-bold mb-3 mt-2"><i class="bi bi-clock me-1"></i> Pendientes</h6>
              
              <div v-for="carrera in carrerasPendientes" :key="carrera.id" class="card mb-2 shadow-sm border-start border-warning border-4">
                <div class="card-body p-2">
                  <div class="small mb-1"><strong>Cliente:</strong> {{ carrera.cliente }}</div>
                  <div class="small mb-1">
                    <strong>Ruta:</strong> {{ carrera.origen }} 
                    <i class="bi bi-arrow-right text-muted"></i> 
                    <span :class="{'fst-italic text-muted': !carrera.destino}">{{ carrera.destino || 'Por definir' }}</span>
                  </div>
                  <div class="small mb-2"><strong>Unidad:</strong> <span class="badge bg-dark">#{{ String(carrera.unidadNumero).padStart(2, '0') }}</span></div>
                  <div class="d-flex justify-content-end">
                    <button class="btn btn-primary btn-sm py-0 px-2" style="font-size: 0.8rem;" @click="cambiarEstado(carrera, 'En Curso')">
                      <i class="bi bi-play-fill"></i> Iniciar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMNA 2: EN CURSO -->
          <div class="col-md-4">
            <div class="bg-light rounded p-2 h-100 border">
              <h6 class="text-center text-muted fw-bold mb-3 mt-2"><i class="bi bi-car-front me-1"></i> En Curso</h6>
              
              <div v-for="carrera in carrerasEnCurso" :key="carrera.id" class="card mb-2 shadow-sm border-start border-info border-4">
                <div class="card-body p-2">
                  <div class="small mb-1"><strong>Cliente:</strong> {{ carrera.cliente }}</div>
                  <div class="small mb-1">
                    <strong>Destino:</strong> 
                    <span :class="{'fst-italic text-muted': !carrera.destino}">{{ carrera.destino || 'Por definir' }}</span>
                  </div>
                  <div class="small mb-2"><strong>Unidad:</strong> <span class="badge bg-dark">#{{ String(carrera.unidadNumero).padStart(2, '0') }}</span></div>
                  <div class="d-flex justify-content-end">
                    <button class="btn btn-success btn-sm py-0 px-2" style="font-size: 0.8rem;" @click="finalizarCarrera(carrera)">
                      <i class="bi bi-check-lg"></i> Finalizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMNA 3: FINALIZADAS -->
          <div class="col-md-4">
            <div class="bg-light rounded p-2 h-100 border">
              <h6 class="text-center text-muted fw-bold mb-2 mt-2">
                <i class="bi bi-check2-square text-success me-1"></i> Finalizadas
                <span class="d-block text-muted fw-normal mt-1" style="font-size: 0.65rem;">(Últimas 10)</span>
              </h6>
              
              <div v-for="carrera in carrerasFinalizadas" :key="carrera.id" class="card mb-2 shadow-none border-start border-success border-4 bg-white" style="opacity: 0.7;">
                <div class="card-body p-2">
                  <div class="small mb-1 text-muted"><strong>Cliente:</strong> {{ carrera.cliente }}</div>
                  <div class="small mb-1 text-muted"><strong>Unidad:</strong> #{{ String(carrera.unidadNumero).padStart(2, '0') }}</div>
                  <div class="small fw-bold text-end" :class="carrera.tarifa ? 'text-success' : 'text-muted'">
                    {{ carrera.tarifa ? '$' + carrera.tarifa : 'Tarifa N/A' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL PARA DESPACHAR UNA RESERVA -->
    <div v-if="reservaADespachar" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog">
        <div class="modal-content border-0">
          <div class="modal-header bg-warning">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-taxi-front-fill me-2"></i>Despachar Reserva</h5>
            <button type="button" class="btn-close" @click="cerrarDespachoReserva"></button>
          </div>
          <div class="modal-body">
            <p class="mb-1"><strong>Cliente:</strong> {{ reservaADespachar.cliente }}</p>
            <p class="mb-3"><strong>Recoger en:</strong> {{ reservaADespachar.origen }}</p>
            
            <label class="form-label fw-bold">Selecciona la Unidad a enviar:</label>
            <select class="form-select border-warning" v-model="unidadParaReserva" size="5">
              <option v-for="unidad in unidadesLibres" :key="unidad.id" :value="unidad">
                Unidad #{{ String(unidad.numero).padStart(2, '0') }} - {{ unidad.chofer }}
              </option>
            </select>
            <div v-if="unidadesLibres.length === 0" class="text-danger mt-2 small">
              <i class="bi bi-exclamation-circle me-1"></i>No hay unidades libres. Deberás liberar una primero.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarDespachoReserva">Cancelar</button>
            <button type="button" class="btn btn-success fw-bold" :disabled="!unidadParaReserva" @click="confirmarDespachoReserva">
              Asignar y Enviar a Pendientes
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { db } from '../firebase'
// ¡Importante! Asegúrate de importar deleteDoc
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'

export default {
  name: 'CarrerasView',
  data() {
    return {
      carreras: [],
      unidades: [],
      clientesDB: [],
      busquedaCliente: '',
      clientesSugeridos: [],
      clienteNotasVisibles: '',
      
      esReserva: false, 
      unidadSeleccionada: null,
      nuevaCarrera: {
        cliente: '',
        origen: '',
        destino: '',
        tarifa: '',
        fechaProgramada: '',
        minutosAviso: '15'
      },

      reservaADespachar: null,
      unidadParaReserva: null,
      relojAlertas: null
    }
  },
  computed: {
    unidadesLibres() {
      return this.unidades.filter(u => u.estado === 'Disponible').sort((a, b) => Number(a.numero) - Number(b.numero));
    },
    carrerasProgramadas() {
      return this.carreras
        .filter(c => c.estado === 'Programada')
        .sort((a, b) => new Date(a.fechaProgramada) - new Date(b.fechaProgramada));
    },
    carrerasPendientes() {
      return this.carreras.filter(c => c.estado === 'Pendiente').sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },
    carrerasEnCurso() {
      return this.carreras.filter(c => c.estado === 'En Curso').sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },
    carrerasFinalizadas() {
      return this.carreras.filter(c => c.estado === 'Finalizada').sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10);
    }
  },
  mounted() {
    this.obtenerUnidades();
    this.obtenerCarreras();
    this.obtenerClientes();
    
    // Iniciar reloj que revisa alertas cada 30 segundos
    this.relojAlertas = setInterval(this.verificarAlertasReservas, 30000);
  },
  unmounted() {
    if (this.relojAlertas) clearInterval(this.relojAlertas);
  },
  methods: {
    formatearFechaHora(fechaIso) {
      if (!fechaIso) return '';
      const f = new Date(fechaIso);
      return f.toLocaleString('es-EC', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
    },
    
    formatearTarifa() {
      if (this.nuevaCarrera.tarifa) {
        this.nuevaCarrera.tarifa = parseFloat(this.nuevaCarrera.tarifa).toFixed(2);
      }
    },
    
    obtenerUnidades() {
      onSnapshot(collection(db, "unidades"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => { data.push({ id: doc.id, ...doc.data() }); });
        this.unidades = data;
      });
    },
    obtenerCarreras() {
      onSnapshot(collection(db, "carreras"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => { data.push({ id: doc.id, ...doc.data() }); });
        this.carreras = data;
        this.verificarAlertasReservas();
      });
    },
    obtenerClientes() {
      onSnapshot(collection(db, "clientes"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => { data.push({ id: doc.id, ...doc.data() }); });
        this.clientesDB = data;
      });
    },
    
    buscarCliente() {
      this.clienteNotasVisibles = '';
      if (!this.busquedaCliente) {
        this.clientesSugeridos = [];
        this.nuevaCarrera.cliente = '';
        return;
      }
      const termino = this.busquedaCliente.toLowerCase();
      this.clientesSugeridos = this.clientesDB.filter(c => 
        c.nombre.toLowerCase().includes(termino) || 
        c.telefono.includes(termino)
      );
      this.nuevaCarrera.cliente = this.busquedaCliente; 
    },
    seleccionarCliente(cliente) {
      this.busquedaCliente = cliente.nombre; 
      this.nuevaCarrera.cliente = cliente.nombre; 
      this.nuevaCarrera.origen = cliente.direccion; 
      this.clienteNotasVisibles = cliente.notas || ''; 
      this.clientesSugeridos = []; 
    },
    seleccionarUnidad(unidad) {
      if(!this.esReserva) this.unidadSeleccionada = unidad;
    },
    
    async registrarCarrera() {
      try {
        if (this.esReserva) {
          if(!this.nuevaCarrera.fechaProgramada) return alert("Falta la fecha de la reserva");
          const reservaData = {
            ...this.nuevaCarrera,
            estado: 'Programada',
            fecha: new Date().toISOString(),
            alertaNotificada: false 
          };
          await addDoc(collection(db, "carreras"), reservaData);
          
        } else {
          if (!this.unidadSeleccionada) return alert("Selecciona una unidad");
          const carreraData = {
            cliente: this.nuevaCarrera.cliente,
            origen: this.nuevaCarrera.origen,
            destino: this.nuevaCarrera.destino,
            tarifa: this.nuevaCarrera.tarifa,
            unidadId: this.unidadSeleccionada.id,
            unidadNumero: this.unidadSeleccionada.numero,
            estado: 'Pendiente',
            fecha: new Date().toISOString()
          };
          await addDoc(collection(db, "carreras"), carreraData);
          await updateDoc(doc(db, "unidades", this.unidadSeleccionada.id), { estado: 'Ocupado' });
        }

        this.busquedaCliente = '';
        this.clienteNotasVisibles = '';
        this.nuevaCarrera = { cliente: '', origen: '', destino: '', tarifa: '', fechaProgramada: '', minutosAviso: '15' };
        this.unidadSeleccionada = null;
        this.clientesSugeridos = [];
        this.esReserva = false;

      } catch (e) {
        console.error("Error al registrar:", e);
      }
    },

    async verificarAlertasReservas() {
      const ahora = new Date();
      for (const reserva of this.carrerasProgramadas) {
        if (reserva.fechaProgramada) {
          const fechaReserva = new Date(reserva.fechaProgramada);
          const difMinutos = (fechaReserva - ahora) / 60000;
          
          if (difMinutos <= Number(reserva.minutosAviso) && !reserva.alertaNotificada) {
            try {
              const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3');
              audio.play().catch(e => console.log("El navegador requiere interacción previa para reproducir audio", e));
              
              await updateDoc(doc(db, "carreras", reserva.id), { 
                alertaActiva: true,
                alertaNotificada: true 
              });
            } catch (e) { console.error(e); }
          }
        }
      }
    },

    // --- NUEVO: Función para Anular la Reserva ---
    async anularReserva(id) {
      if (confirm("¿Estás seguro de que deseas anular y borrar esta reserva?")) {
        try {
          await deleteDoc(doc(db, "carreras", id));
        } catch (error) {
          console.error("Error al cancelar la reserva: ", error);
        }
      }
    },

    abrirDespachoReserva(reserva) {
      this.reservaADespachar = reserva;
      this.unidadParaReserva = null;
    },
    cerrarDespachoReserva() {
      this.reservaADespachar = null;
      this.unidadParaReserva = null;
    },
    async confirmarDespachoReserva() {
      if(!this.unidadParaReserva) return;
      try {
        await updateDoc(doc(db, "carreras", this.reservaADespachar.id), { 
          estado: 'Pendiente',
          unidadId: this.unidadParaReserva.id,
          unidadNumero: this.unidadParaReserva.numero,
          alertaActiva: false
        });
        await updateDoc(doc(db, "unidades", this.unidadParaReserva.id), { estado: 'Ocupado' });
        this.cerrarDespachoReserva();
      } catch(e) {
        console.error(e);
      }
    },

    async cambiarEstado(carrera, nuevoEstado) {
      try { await updateDoc(doc(db, "carreras", carrera.id), { estado: nuevoEstado }); } catch (e) {}
    },
    async finalizarCarrera(carrera) {
      try {
        await updateDoc(doc(db, "carreras", carrera.id), { estado: 'Finalizada' });
        await updateDoc(doc(db, "unidades", carrera.unidadId), { estado: 'Disponible' });
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.list-group-item { transition: all 0.2s; }
.list-group-item:hover { background-color: #f8f9fa; border-left: 3px solid #6366f1; }

.parpadeo {
  animation: pulse-red 2s infinite;
}
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}
</style>