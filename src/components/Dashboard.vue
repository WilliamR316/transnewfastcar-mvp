<template>
  <div class="container-fluid mt-4">
    <!-- Header con Saludo y Fecha -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-1 fw-bold text-dark">{{ saludo }}, Administrador</h3>
        <p class="text-muted small mb-0"><i class="bi bi-calendar3 me-1"></i> Hoy es {{ fechaActual }}</p>
      </div>
      <button class="btn btn-outline-primary btn-sm bg-white" @click="refrescarDatos">
        <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
      </button>
    </div>

    <!-- TARJETAS DE RESUMEN (KPIs) -->
    <div class="row g-3 mb-4">
      <!-- Tarjeta 1: Flota -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100" style="border-left: 4px solid #0d6efd !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted small fw-bold mb-1">UNIDADES LIBRES</p>
                <h3 class="mb-0 fw-bold text-dark">{{ unidadesDisponibles }} <span class="fs-6 text-muted fw-normal">/ {{ totalUnidades }}</span></h3>
              </div>
              <div class="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                <i class="bi bi-car-front-fill fs-4"></i>
              </div>
            </div>
            <div class="mt-3 small">
              <span class="text-primary fw-bold"><i class="bi bi-play-circle-fill me-1"></i>{{ unidadesOcupadas }}</span> en ruta
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta 2: Carreras Hoy -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100" style="border-left: 4px solid #198754 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted small fw-bold mb-1">CARRERAS HOY</p>
                <h3 class="mb-0 fw-bold text-dark">{{ carrerasHoy.length }}</h3>
              </div>
              <div class="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                <i class="bi bi-geo-alt-fill fs-4"></i>
              </div>
            </div>
            <div class="mt-3 small">
              <span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>{{ carrerasFinalizadasHoy }}</span> completadas
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta 3: Ingresos -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100" style="border-left: 4px solid #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted small fw-bold mb-1">INGRESOS DEL DÍA</p>
                <h3 class="mb-0 fw-bold text-dark">${{ ingresosHoy.toFixed(2) }}</h3>
              </div>
              <div class="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                <i class="bi bi-currency-dollar fs-4"></i>
              </div>
            </div>
            <div class="mt-3 small text-muted">
              Suma de tarifas finalizadas hoy
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta 4: Reservas -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100" style="border-left: 4px solid #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted small fw-bold mb-1">RESERVAS PENDIENTES</p>
                <h3 class="mb-0 fw-bold text-dark">{{ reservasPendientes }}</h3>
              </div>
              <div class="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                <i class="bi bi-calendar-event fs-4"></i>
              </div>
            </div>
            <div class="mt-3 small text-danger fw-bold" v-if="reservasPendientes > 0">
              <i class="bi bi-exclamation-circle-fill me-1"></i>Requieren atención
            </div>
            <div class="mt-3 small text-muted" v-else>
              Todo al día
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEGUNDA FILA: ACTIVIDAD Y ESTADO -->
    <div class="row g-3">
      
      <!-- Actividad Reciente -->
      <div class="col-md-8">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0"><i class="bi bi-activity text-primary me-2"></i>Últimas Carreras Despachadas</h6>
            <!-- Si ya tienes la ruta de reportes, puedes enlazarla aquí después -->
            <button class="btn btn-sm btn-link text-decoration-none">Ver historial</button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="text-muted small">
                  <tr>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Origen</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="ultimasCarreras.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No hay carreras recientes.</td>
                  </tr>
                  <tr v-for="carrera in ultimasCarreras" :key="carrera.id">
                    <td class="small">{{ formatearHora(carrera.fecha) }}</td>
                    <td class="fw-bold small">{{ carrera.cliente }}</td>
                    <td class="small text-truncate" style="max-width: 150px;">{{ carrera.origen }}</td>
                    <td><span class="badge bg-dark">#{{ String(carrera.unidadNumero).padStart(2, '0') }}</span></td>
                    <td>
                      <span class="badge" :class="colorEstado(carrera.estado)">{{ carrera.estado }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de la Flota (Mini Panel) -->
      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 pt-4 pb-0">
            <h6 class="fw-bold mb-0"><i class="bi bi-pie-chart-fill text-info me-2"></i>Estado de la Flota</h6>
          </div>
          <div class="card-body d-flex flex-column justify-content-center">
            
            <div class="mb-4">
              <div class="d-flex justify-content-between small mb-1">
                <span class="fw-bold text-primary">Disponibles</span>
                <span>{{ porcentajeDisponibles }}%</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-primary" :style="{ width: porcentajeDisponibles + '%' }"></div>
              </div>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-content-between small mb-1">
                <span class="fw-bold text-warning">En Curso / Ocupados</span>
                <span>{{ porcentajeOcupados }}%</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-warning" :style="{ width: porcentajeOcupados + '%' }"></div>
              </div>
            </div>
            
            <div class="mt-auto bg-light p-3 rounded text-center border">
              <p class="small text-muted mb-1">Total de Conductores Registrados</p>
              <h4 class="mb-0 fw-bold">{{ totalUnidades }}</h4>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default {
  name: 'DashboardView',
  data() {
    return {
      carreras: [],
      unidades: [],
      fechaHoyString: new Date().toLocaleDateString('es-EC')
    }
  },
  computed: {
    // --- LÓGICA DE SALUDO Y FECHA ---
    saludo() {
      const hora = new Date().getHours();
      if (hora < 12) return 'Buenos días';
      if (hora < 19) return 'Buenas tardes';
      return 'Buenas noches';
    },
    fechaActual() {
      const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      // Capitalizar la primera letra
      let fecha = new Date().toLocaleDateString('es-EC', opciones);
      return fecha.charAt(0).toUpperCase() + fecha.slice(1);
    },

    // --- LÓGICA DE UNIDADES (FLOTA) ---
    totalUnidades() {
      return this.unidades.length;
    },
    unidadesDisponibles() {
      return this.unidades.filter(u => u.estado === 'Disponible').length;
    },
    unidadesOcupadas() {
      return this.unidades.filter(u => u.estado === 'Ocupado').length;
    },
    porcentajeDisponibles() {
      if (this.totalUnidades === 0) return 0;
      return Math.round((this.unidadesDisponibles / this.totalUnidades) * 100);
    },
    porcentajeOcupados() {
      if (this.totalUnidades === 0) return 0;
      return Math.round((this.unidadesOcupadas / this.totalUnidades) * 100);
    },

    // --- LÓGICA DE CARRERAS (HOY) ---
    carrerasHoy() {
      // Filtra las carreras creadas el día de hoy
      return this.carreras.filter(c => {
        if(!c.fecha) return false;
        return new Date(c.fecha).toLocaleDateString('es-EC') === this.fechaHoyString;
      });
    },
    carrerasFinalizadasHoy() {
      return this.carrerasHoy.filter(c => c.estado === 'Finalizada').length;
    },
    ingresosHoy() {
      // Suma la tarifa de todas las carreras FINALIZADAS de hoy
      return this.carrerasHoy
        .filter(c => c.estado === 'Finalizada' && c.tarifa)
        .reduce((total, c) => total + parseFloat(c.tarifa), 0);
    },
    reservasPendientes() {
      return this.carreras.filter(c => c.estado === 'Programada').length;
    },
    ultimasCarreras() {
      // Muestra solo las últimas 6 carreras que NO sean reservas para el historial rápido
      return this.carreras
        .filter(c => c.estado !== 'Programada')
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 6);
    }
  },
  mounted() {
    this.obtenerDatos();
  },
  methods: {
    obtenerDatos() {
      // Descarga las unidades
      onSnapshot(collection(db, "unidades"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => { data.push({ id: doc.id, ...doc.data() }); });
        this.unidades = data;
      });

      // Descarga las carreras
      onSnapshot(collection(db, "carreras"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => { data.push({ id: doc.id, ...doc.data() }); });
        this.carreras = data;
      });
    },
    refrescarDatos() {
      // Aunque Firebase es en tiempo real, este botón da tranquilidad psicológica al usuario
      this.fechaHoyString = new Date().toLocaleDateString('es-EC');
    },
    formatearHora(fechaIso) {
      if (!fechaIso) return '';
      return new Date(fechaIso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    },
    colorEstado(estado) {
      if (estado === 'Pendiente') return 'bg-warning text-dark';
      if (estado === 'En Curso') return 'bg-info text-dark';
      if (estado === 'Finalizada') return 'bg-success';
      return 'bg-secondary';
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-2px);
}
</style>