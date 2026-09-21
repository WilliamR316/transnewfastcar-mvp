<template>
  <div class="container-fluid mt-4">
    <!-- Header y Controles -->
    <div class="row mb-4 align-items-center">
      <div class="col-md-6">
        <h2 class="mb-0"><i class="bi bi-car-front-fill me-2"></i>Gestión de Flota</h2>
      </div>
      <div class="col-md-6 d-flex justify-content-end gap-2">
        <select v-model="filtroEstado" class="form-select w-auto">
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Ocupado">Ocupado</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Fuera de Servicio">Fuera de Servicio</option>
        </select>
        <button class="btn btn-primary" @click="abrirModalNuevo">
          <i class="bi bi-plus-circle me-1"></i> Nueva Unidad
        </button>
      </div>
    </div>

    <!-- Tabla de Unidades -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped mb-0">
            <thead class="table-dark">
              <tr>
                <th>Unidad</th>
                <th>Placa</th>
                <th>Chofer</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="unidadesFiltradas.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  No hay unidades registradas o que coincidan con el filtro.
                </td>
              </tr>
              <tr v-for="unidad in unidadesFiltradas" :key="unidad.id">
                <!-- Aquí aplicamos el padStart para asegurar siempre 2 dígitos (ej: 01, 02) -->
                <td class="fw-bold">#{{ String(unidad.numero).padStart(2, '0') }}</td>
                <td class="text-uppercase">{{ unidad.placa }}</td>
                <td>{{ unidad.chofer }}</td>
                <td>{{ unidad.telefono }}</td>
                <td>
                  <span :class="getBadgeClass(unidad.estado)">
                    {{ unidad.estado }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editarUnidad(unidad)" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="eliminarUnidad(unidad.id)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para Nueva/Editar Unidad -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editando ? 'Editar Unidad' : 'Registrar Nueva Unidad' }}</h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarUnidad">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">N° de Unidad</label>
                  <!-- Cambiado a type="text" para que no borre los ceros -->
                  <input type="text" class="form-control" v-model="nuevaUnidad.numero" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Placa</label>
                  <input type="text" class="form-control" v-model="nuevaUnidad.placa" required style="text-transform: uppercase;">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Estado</label>
                  <select class="form-select" v-model="nuevaUnidad.estado" required>
                    <option value="Disponible">Disponible</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre del Chofer</label>
                  <input type="text" class="form-control" v-model="nuevaUnidad.chofer" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono del Chofer</label>
                  <input type="tel" class="form-control" v-model="nuevaUnidad.telefono" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de Ingreso</label>
                  <input type="date" class="form-control" v-model="nuevaUnidad.fechaIngreso" required>
                </div>

                <!-- Sección de Contacto de Emergencia dividida -->
                <div class="col-12 mt-4 mb-2">
                  <h6 class="text-muted border-bottom pb-2"><i class="bi bi-heart-pulse text-danger me-2"></i>Datos de Emergencia</h6>
                </div>
                <div class="col-md-5">
                  <label class="form-label">Nombre del Contacto</label>
                  <input type="text" class="form-control" v-model="nuevaUnidad.contactoEmergenciaNombre" placeholder="Nombre completo">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Parentesco</label>
                  <input type="text" class="form-control" v-model="nuevaUnidad.contactoEmergenciaParentesco" placeholder="Ej. Esposa, Hijo">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Teléfono de Emergencia</label>
                  <input type="tel" class="form-control" v-model="nuevaUnidad.contactoEmergenciaTelefono" placeholder="099...">
                </div>

                <div class="col-12 mt-4">
                  <label class="form-label">Observaciones</label>
                  <textarea class="form-control" v-model="nuevaUnidad.observaciones" rows="2"></textarea>
                </div>
              </div>
              <div class="modal-footer mt-4 pb-0 pe-0">
                <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  {{ editando ? 'Actualizar Unidad' : 'Guardar Unidad' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'

export default {
  name: 'FlotaView',
  data() {
    return {
      unidades: [],
      filtroEstado: '',
      showModal: false,
      editando: false,
      unidadEditarId: null,
      nuevaUnidad: {
        numero: '',
        placa: '',
        chofer: '',
        telefono: '',
        contactoEmergenciaNombre: '',
        contactoEmergenciaParentesco: '',
        contactoEmergenciaTelefono: '',
        observaciones: '',
        estado: 'Disponible',
        fechaIngreso: ''
      }
    }
  },
  computed: {
    unidadesFiltradas() {
      if (!this.filtroEstado) return this.unidades;
      return this.unidades.filter(u => u.estado === this.filtroEstado);
    }
  },
  mounted() {
    this.obtenerUnidades();
  },
  methods: {
    abrirModalNuevo() {
      this.editando = false;
      this.unidadEditarId = null;
      this.nuevaUnidad = {
        numero: '', placa: '', chofer: '', telefono: '',
        contactoEmergenciaNombre: '', contactoEmergenciaParentesco: '', contactoEmergenciaTelefono: '',
        observaciones: '', estado: 'Disponible',
        fechaIngreso: new Date().toISOString().split('T')[0]
      };
      this.showModal = true;
    },
    cerrarModal() {
      this.showModal = false;
    },
    obtenerUnidades() {
      onSnapshot(collection(db, "unidades"), (querySnapshot) => {
        const unidadesDesdeFirebase = [];
        querySnapshot.forEach((doc) => {
          unidadesDesdeFirebase.push({ id: doc.id, ...doc.data() });
        });
        // Sigue ordenando numéricamente para que el 01 vaya antes que el 10
        this.unidades = unidadesDesdeFirebase.sort((a, b) => Number(a.numero) - Number(b.numero));
      });
    },
    async guardarUnidad() {
      try {
        if (this.editando) {
          const unidadRef = doc(db, "unidades", this.unidadEditarId);
          await updateDoc(unidadRef, { ...this.nuevaUnidad });
        } else {
          await addDoc(collection(db, "unidades"), { ...this.nuevaUnidad });
        }
        this.cerrarModal();
      } catch (e) {
        console.error("Error al guardar: ", e);
        alert("Hubo un error al guardar. Revisa la consola.");
      }
    },
    editarUnidad(unidad) {
      this.editando = true;
      this.unidadEditarId = unidad.id;
      this.nuevaUnidad = { 
        numero: unidad.numero,
        placa: unidad.placa,
        chofer: unidad.chofer,
        telefono: unidad.telefono,
        contactoEmergenciaNombre: unidad.contactoEmergenciaNombre || '',
        contactoEmergenciaParentesco: unidad.contactoEmergenciaParentesco || '',
        contactoEmergenciaTelefono: unidad.contactoEmergenciaTelefono || '',
        observaciones: unidad.observaciones || '',
        estado: unidad.estado,
        fechaIngreso: unidad.fechaIngreso
      };
      this.showModal = true;
    },
    async eliminarUnidad(id) {
      if(confirm("¿Estás seguro de que deseas eliminar esta unidad de la flota?")) {
        try {
          await deleteDoc(doc(db, "unidades", id));
        } catch (e) {
          console.error("Error al eliminar: ", e);
        }
      }
    },
    getBadgeClass(estado) {
      switch (estado) {
        case 'Disponible': return 'badge bg-success';
        case 'Ocupado': return 'badge bg-danger';
        case 'Mantenimiento': return 'badge bg-warning text-dark';
        case 'Fuera de Servicio': return 'badge bg-secondary';
        default: return 'badge bg-primary';
      }
    }
  }
}
</script>

<style scoped>
.table th {
  white-space: nowrap;
}
</style>