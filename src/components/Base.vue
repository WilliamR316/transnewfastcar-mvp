<template>
  <div class="base-section">
    <div class="header-section">
      <div>
        <h2>Control de Base (Punteros)</h2>
        <p class="subtitle">Arrastra las tarjetas para ordenar la fila de salida</p>
      </div>
      <div class="stats-badge">
        🚕 Unidades en Base: <strong>{{ unidadesEnBase.length }}</strong>
      </div>
    </div>

    <!-- ZONA DE ARRASTRE (DRAG & DROP NATIVO) -->
    <div class="malla-base">
      <div 
        v-for="(unidad, index) in unidadesEnBase" 
        :key="unidad.id"
        class="tarjeta-puntero"
        draggable="true"
        @dragstart="iniciarArrastre(index)"
        @dragover.prevent
        @dragenter.prevent
        @drop="soltarArrastre(index)"
      >
        <!-- Indicador de Posición (1º, 2º, 3º...) -->
        <div :class="['posicion-badge', index === 0 ? 'primero' : index === 1 ? 'segundo' : index === 2 ? 'tercero' : '']">
          {{ index + 1 }}º
        </div>
        
        <div class="info-unidad">
          <!-- NUEVO ÍCONO DE TAXI -->
          <div class="taxi-icon">🚕</div>
          
          <div class="numero-unidad">#{{ unidad.id }}</div>
          <div class="conductor-nombre">{{ unidad.conductor }}</div>
          <div class="placa-texto">{{ unidad.placa }}</div>
        </div>

        <!-- Botón para simular que sale a una carrera y deja la base -->
        <button class="btn-despachar" @click="despacharUnidad(unidad)" title="Asignar Carrera y sacar de Base">
          🚀 Despachar
        </button>
      </div>

      <!-- Estado vacío cuando no hay nadie en base -->
      <div v-if="unidadesEnBase.length === 0" class="empty-base">
        <span class="icon">🏜️</span>
        <h3>La base está vacía</h3>
        <p>Todos los vehículos están en carrera o fuera de servicio.</p>
        <button class="btn btn-outline mt-3" @click="simularLlegada">Simular llegada de taxis</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Base',
  data() {
    return {
      indiceArrastrado: null,
      unidadesEnBase: [
        { id: 101, conductor: 'Carlos Mendoza', placa: 'ABC-1234' },
        { id: 106, conductor: 'Jorge Loor', placa: 'XYZ-9876' },
        { id: 103, conductor: 'Ana Salazar', placa: 'PBA-9012' },
        { id: 108, conductor: 'Miguel Castro', placa: 'LMN-4567' }
      ]
    };
  },
  methods: {
    iniciarArrastre(index) {
      this.indiceArrastrado = index;
    },
    soltarArrastre(indexDestino) {
      if (this.indiceArrastrado === null) return;
      
      const elementoArrastrado = this.unidadesEnBase.splice(this.indiceArrastrado, 1)[0];
      this.unidadesEnBase.splice(indexDestino, 0, elementoArrastrado);
      
      this.indiceArrastrado = null;
    },
    despacharUnidad(unidad) {
      this.unidadesEnBase = this.unidadesEnBase.filter(u => u.id !== unidad.id);
    },
    simularLlegada() {
      this.unidadesEnBase = [
        { id: 101, conductor: 'Carlos Mendoza', placa: 'ABC-1234' },
        { id: 106, conductor: 'Jorge Loor', placa: 'XYZ-9876' },
        { id: 103, conductor: 'Ana Salazar', placa: 'PBA-9012' }
      ];
    }
  }
};
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-section h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 4px; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.stats-badge {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 1rem;
  border: 1px solid #bfdbfe;
}
.stats-badge strong { font-size: 1.2rem; margin-left: 5px; }

/* MALLA DE VEHÍCULOS (GRID) */
.malla-base {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  align-items: start;
}

.tarjeta-puntero {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  position: relative;
  cursor: grab;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tarjeta-puntero:active { cursor: grabbing; transform: scale(0.98); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #3b82f6;}
.tarjeta-puntero:hover { border-color: #cbd5e1; transform: translateY(-3px); }

/* Efecto del ícono de taxi al pasar el mouse por la tarjeta */
.tarjeta-puntero:hover .taxi-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* MEDALLAS DE POSICIÓN */
.posicion-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  width: 35px;
  height: 35px;
  background: #94a3b8;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 3px solid white;
}
.posicion-badge.primero { background: #eab308; transform: scale(1.15); }
.posicion-badge.segundo { background: #94a3b8; transform: scale(1.05); }
.posicion-badge.tercero { background: #b45309; }

/* CONTENIDO DE LA TARJETA */
.info-unidad { margin-top: 10px; margin-bottom: 20px; width: 100%; }

/* Estilos para el nuevo ícono de taxi */
.taxi-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.numero-unidad { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; line-height: 1; }
.conductor-nombre { font-size: 1.05rem; font-weight: 600; color: #475569; margin-bottom: 5px; }
.placa-texto { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #64748b; display: inline-block; font-size: 0.9rem;}

.btn-despachar {
  width: 100%;
  padding: 10px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-despachar:hover { background: #3b82f6; color: white; border-color: #3b82f6; }

/* ESTADO VACÍO */
.empty-base {
  grid-column: 1 / -1;
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  border: 2px dashed #cbd5e1;
}
.empty-base .icon { font-size: 3rem; margin-bottom: 15px; display: inline-block; }
.empty-base h3 { font-size: 1.3rem; color: #0f172a; margin-bottom: 10px; }
.empty-base p { color: #64748b; }
.btn-outline { background-color: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;}
.btn-outline:hover { background: #f1f5f9; }
.mt-3 { margin-top: 15px; }
</style>