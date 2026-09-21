<template>
  <div class="container-fluid mt-4">
    <!-- Header -->
    <div class="mb-4 d-flex justify-content-between align-items-end">
      <div>
        <h3 class="mb-1"><i class="bi bi-calendar-week text-primary me-2"></i>Programación de Guardias</h3>
        <p class="text-muted small mb-0">Horario nocturno: 19:00 a 23:00 | Arrastra las unidades para reasignar turnos</p>
      </div>
      <button class="btn btn-primary fw-bold" @click="rotarTurnos">
        <i class="bi bi-arrow-repeat me-1"></i> Rotar Siguiente Semana
      </button>
    </div>

    <!-- Contenedor de los 7 días de la semana -->
    <div class="row g-3 mb-4 flex-nowrap overflow-auto pb-2">
      <div v-for="(dia, index) in diasSemana" :key="dia.key" class="col" style="min-width: 150px;">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 text-center pt-3 pb-1">
            <h6 class="fw-bold mb-0">{{ dia.nombre }}</h6>
            <small class="text-muted" style="font-size: 0.7rem;">{{ fechasSemana[index] }}</small>
          </div>
          <!-- Zona donde se sueltan los elementos (Dropzone) -->
          <div 
            class="card-body p-2 d-flex flex-column gap-2 zona-drop"
            @dragover.prevent
            @dragenter.prevent
            @drop="onDrop($event, dia.key)"
          >
            <div 
              v-for="unidad in unidadesPorDia(dia.key)" :key="unidad.id"
              class="unidad-pill bg-dark text-white rounded-pill shadow-sm cursor-grab"
              draggable="true"
              @dragstart="onDragStart($event, unidad.id, dia.key)"
            >
              <span class="text-warning me-1">🚕</span>
              <span class="fw-bold">#{{ String(unidad.numero).padStart(2, '0') }}</span>
            </div>
            
            <div v-if="unidadesPorDia(dia.key).length === 0" class="text-center text-muted py-3 zona-vacia rounded">
              <small style="font-size: 0.7rem;">Arrastra aquí</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenedor de Unidades Disponibles -->
    <div class="card shadow-sm border-0 mt-2">
      <div class="card-header bg-white border-0 pt-3 pb-2 d-flex align-items-center">
        <i class="bi bi-truck-front-fill text-primary me-2"></i>
        <h6 class="fw-bold mb-0 me-3">Unidades Disponibles (Descanso / Sin guardia esta semana)</h6>
        <span class="badge bg-primary rounded-pill bg-opacity-10 text-primary">{{ unidadesLibres.length }} unidades</span>
      </div>
      <!-- Zona Drop para regresar unidades a "Descanso" -->
      <div 
        class="card-body pt-1 pb-3 d-flex flex-wrap gap-2 zona-drop"
        style="min-height: 100px;"
        @dragover.prevent
        @dragenter.prevent
        @drop="onDrop($event, 'descanso')"
      >
        <div 
          v-for="unidad in unidadesLibres" :key="unidad.id"
          class="unidad-pill bg-white border border-light-subtle text-dark rounded-pill shadow-sm cursor-grab"
          draggable="true"
          @dragstart="onDragStart($event, unidad.id, 'descanso')"
        >
          <span class="text-warning me-1">🚕</span>
          <span class="fw-bold">#{{ String(unidad.numero).padStart(2, '0') }}</span>
        </div>
        
        <div v-if="unidadesLibres.length === 0 && unidades.length > 0" class="w-100 text-center text-muted py-3">
          <small>Todas las unidades tienen turno asignado.</small>
        </div>
        <div v-if="unidades.length === 0" class="w-100 text-center text-danger py-3">
          <small>No hay unidades registradas en la Flota. Ve a "Flota y Unidades" para agregar conductores.</small>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'

export default {
  name: 'TurnosView',
  data() {
    return {
      unidades: [],
      turnosId: 'semanaActual', 
      diasSemana: [
        { key: 'lunes', nombre: 'Lunes' },
        { key: 'martes', nombre: 'Martes' },
        { key: 'miercoles', nombre: 'Miércoles' },
        { key: 'jueves', nombre: 'Jueves' },
        { key: 'viernes', nombre: 'Viernes' },
        { key: 'sabado', nombre: 'Sábado' },
        { key: 'domingo', nombre: 'Domingo' }
      ],
      turnos: {
        lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], domingo: []
      }
    }
  },
  computed: {
    fechasSemana() {
      const fechas = [];
      const hoy = new Date();
      const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay(); 
      
      for (let i = 1; i <= 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - diaSemana + i);
        fechas.push(fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }));
      }
      return fechas;
    },
    unidadesLibres() {
      const idsAsignados = new Set([
        ...this.turnos.lunes, ...this.turnos.martes, ...this.turnos.miercoles, 
        ...this.turnos.jueves, ...this.turnos.viernes, ...this.turnos.sabado, ...this.turnos.domingo
      ]);
      
      return this.unidades
        .filter(u => !idsAsignados.has(u.id))
        .sort((a, b) => Number(a.numero) - Number(b.numero));
    }
  },
  mounted() {
    this.obtenerUnidades();
    this.obtenerTurnos();
  },
  methods: {
    obtenerUnidades() {
      onSnapshot(collection(db, "unidades"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => { data.push({ id: doc.id, ...doc.data() }); });
        this.unidades = data;
      });
    },
    async obtenerTurnos() {
      const docRef = doc(db, "turnos", this.turnosId);
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          this.turnos = docSnap.data();
        } else {
          this.guardarTurnosEnFirebase();
        }
      });
    },
    unidadesPorDia(diaKey) {
      if (!this.turnos[diaKey]) return [];
      return this.turnos[diaKey]
        .map(id => this.unidades.find(u => u.id === id))
        .filter(u => u !== undefined); 
    },
    onDragStart(event, unidadId, origenKey) {
      event.dataTransfer.setData('unidadId', unidadId);
      event.dataTransfer.setData('origenKey', origenKey);
      event.dataTransfer.effectAllowed = 'move';
    },
    onDrop(event, destinoKey) {
      const unidadId = event.dataTransfer.getData('unidadId');
      const origenKey = event.dataTransfer.getData('origenKey');
      if (!unidadId || origenKey === destinoKey) return;
      if (origenKey !== 'descanso') {
        this.turnos[origenKey] = this.turnos[origenKey].filter(id => id !== unidadId);
      }
      if (destinoKey !== 'descanso') {
        if (!this.turnos[destinoKey].includes(unidadId)) {
          this.turnos[destinoKey].push(unidadId);
        }
      }
      this.guardarTurnosEnFirebase();
    },
    async guardarTurnosEnFirebase() {
      try {
        await setDoc(doc(db, "turnos", this.turnosId), this.turnos);
      } catch (e) {
        console.error("Error al guardar turnos: ", e);
      }
    },
    async rotarTurnos() {
      if(confirm("¿Deseas rotar todos los turnos asignados hacia el día siguiente?")) {
        const nuevosTurnos = {
          lunes: [...this.turnos.domingo],
          martes: [...this.turnos.lunes],
          miercoles: [...this.turnos.martes],
          jueves: [...this.turnos.miercoles],
          viernes: [...this.turnos.jueves],
          sabado: [...this.turnos.viernes],
          domingo: [...this.turnos.sabado]
        };
        this.turnos = nuevosTurnos;
        await this.guardarTurnosEnFirebase();
      }
    }
  }
}
</script>

<style scoped>
.cursor-grab {
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}
.cursor-grab:active {
  cursor: grabbing;
  transform: scale(0.95);
}
.zona-drop {
  border-radius: 8px;
  transition: background-color 0.2s;
}
.zona-drop:hover {
  background-color: rgba(99, 102, 241, 0.05); 
}
.zona-vacia {
  border: 1px dashed #ccc;
  background-color: #f8f9fa;
}

/* AQUÍ ESTÁ LA MAGIA PARA LAS PASTILLAS */
.unidad-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;      /* Garantiza que siempre sea rectangular */
  height: 40px;         /* Altura fija para que todas se vean idénticas */
  white-space: nowrap;  /* Evita que el texto se rompa en dos líneas */
}
</style>