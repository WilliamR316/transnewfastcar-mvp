<template>
  <div class="guardias-section">
    <div class="header-section">
      <div>
        <h2>Programación de Guardias</h2>
        <p class="subtitle">Horario nocturno: 19:00 a 23:00 | Arrastra las unidades para reasignar turnos</p>
      </div>
      <button class="btn btn-primary" @click="resetearSemana">🔄 Rotar Siguiente Semana</button>
    </div>

    <!-- CALENDARIO DE LA SEMANA (ZONAS DE DROP) -->
    <div class="calendario-grid">
      <div 
        v-for="(dia, index) in semana" 
        :key="dia.nombre"
        class="dia-card card"
        @dragover.prevent
        @dragenter.prevent="zonaActiva = index"
        @dragleave="zonaActiva = null"
        @drop="soltarUnidad(index)"
        :class="{ 'drop-active': zonaActiva === index }"
      >
        <div class="dia-header">
          <h3>{{ dia.nombre }}</h3>
          <span class="fecha">{{ dia.fecha }}</span>
        </div>
        
        <div class="dia-body">
          <div v-if="dia.unidades.length === 0" class="empty-slot">Sin guardia</div>
          
          <!-- CARRITOS ASIGNADOS A ESTE DÍA -->
          <div 
            v-for="unidad in dia.unidades" 
            :key="unidad.id"
            class="taxi-token asignado"
            draggable="true"
            @dragstart="iniciarArrastre(unidad, index)"
          >
            <span class="taxi-icon">🚕</span>
            <span class="taxi-numero">#{{ unidad.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- BANCA DE UNIDADES DISPONIBLES (ZONA DE DROP) -->
    <div 
      class="banca-container card mt-4"
      @dragover.prevent
      @dragenter.prevent="zonaActiva = 'banca'"
      @dragleave="zonaActiva = null"
      @drop="soltarUnidad('banca')"
      :class="{ 'drop-active': zonaActiva === 'banca' }"
    >
      <div class="banca-header">
        <h3>🚙 Unidades Disponibles (Descanso / Sin guardia esta semana)</h3>
        <span class="badge">{{ unidadesBanca.length }} unidades</span>
      </div>
      
      <div class="banca-grid">
        <!-- CARRITOS EN LA BANCA -->
        <div 
          v-for="unidad in unidadesBanca" 
          :key="unidad.id"
          class="taxi-token libre"
          draggable="true"
          @dragstart="iniciarArrastre(unidad, 'banca')"
        >
          <span class="taxi-icon">🚖</span>
          <span class="taxi-numero">#{{ unidad.id }}</span>
        </div>
        <div v-if="unidadesBanca.length === 0" class="empty-slot w-100 text-center">
          Todas las unidades tienen guardia asignada.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Guardias',
  data() {
    return {
      unidadArrastrada: null,
      origenArrastre: null, // 'banca' o el índice del día (0 al 6)
      zonaActiva: null, // Para iluminar la caja cuando pasas el mouse por encima
      
      semana: [
        { nombre: 'Lunes', fecha: '14 Sept', unidades: [] },
        { nombre: 'Martes', fecha: '15 Sept', unidades: [] },
        { nombre: 'Miércoles', fecha: '16 Sept', unidades: [] },
        { nombre: 'Jueves', fecha: '17 Sept', unidades: [] },
        { nombre: 'Viernes', fecha: '18 Sept', unidades: [] },
        { nombre: 'Sábado', fecha: '19 Sept', unidades: [] },
        { nombre: 'Domingo', fecha: '20 Sept', unidades: [] }
      ],
      unidadesBanca: []
    };
  },
  created() {
    this.generarFlota();
  },
  methods: {
    generarFlota() {
      // Creamos automáticamente las 31 unidades
      let flotaCompleta = [];
      for (let i = 1; i <= 31; i++) {
        let idFormateado = i < 10 ? '0' + i : i.toString();
        flotaCompleta.push({ id: idFormateado });
      }

      // Asignamos 2 unidades por día (14 en total para la semana)
      let unidadActual = 0;
      this.semana.forEach(dia => {
        dia.unidades = []; // Limpiamos
        if (unidadActual < flotaCompleta.length) dia.unidades.push(flotaCompleta[unidadActual++]);
        if (unidadActual < flotaCompleta.length) dia.unidades.push(flotaCompleta[unidadActual++]);
      });

      // El resto de los carros (del 15 al 31) se van a la banca
      this.unidadesBanca = flotaCompleta.slice(14);
    },
    
    // --- LÓGICA DE DRAG & DROP ---
    iniciarArrastre(unidad, origen) {
      this.unidadArrastrada = unidad;
      this.origenArrastre = origen;
    },
    
    soltarUnidad(destino) {
      this.zonaActiva = null; // Apagamos el brillo
      if (!this.unidadArrastrada) return;
      if (this.origenArrastre === destino) return; // Si lo soltó en el mismo lugar, no hacer nada

      // 1. SACAR AL CARRITO DE DONDE ESTABA
      if (this.origenArrastre === 'banca') {
        this.unidadesBanca = this.unidadesBanca.filter(u => u.id !== this.unidadArrastrada.id);
      } else {
        this.semana[this.origenArrastre].unidades = this.semana[this.origenArrastre].unidades.filter(u => u.id !== this.unidadArrastrada.id);
      }

      // 2. METER AL CARRITO DONDE LO SOLTARON
      if (destino === 'banca') {
        this.unidadesBanca.push(this.unidadArrastrada);
        // Ordenamos la banca numéricamente para que no se desordene
        this.unidadesBanca.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      } else {
        this.semana[destino].unidades.push(this.unidadArrastrada);
      }

      // Limpiamos la memoria del arrastre
      this.unidadArrastrada = null;
      this.origenArrastre = null;
    },
    
    resetearSemana() {
      if(confirm('¿Deseas generar la rotación para la siguiente semana automáticamente?')) {
        // Aquí iría la lógica matemática para continuar del 15 en adelante, 
        // pero por ahora reiniciamos a la vista por defecto de prueba.
        this.generarFlota();
      }
    }
  }
};
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header-section h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 4px; }
.subtitle { color: #64748b; font-size: 0.95rem; }
.mt-4 { margin-top: 25px; }
.w-100 { width: 100%; }
.text-center { text-align: center; }

.btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }

.card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 2px solid #f1f5f9; transition: border-color 0.2s; }
.drop-active { border-color: #3b82f6 !important; background-color: #f8fafc; }

/* CALENDARIO DE 7 DÍAS */
.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
}

.dia-card {
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.dia-header {
  background: #f8fafc;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
  border-radius: 14px 14px 0 0;
}
.dia-header h3 { margin: 0; font-size: 1.05rem; color: #1e293b; }
.dia-header .fecha { font-size: 0.8rem; color: #64748b; }

.dia-body {
  padding: 15px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.empty-slot {
  color: #94a3b8;
  font-size: 0.85rem;
  border: 1px dashed #cbd5e1;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

/* FICHAS DE LOS TAXIS (TOKENS) */
.taxi-token {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 700;
  cursor: grab;
  width: 90%;
  box-sizing: border-box;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.taxi-token:active { cursor: grabbing; transform: scale(0.95); }
.taxi-token:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

.taxi-icon { font-size: 1.2rem; }
.taxi-numero { font-size: 1.1rem; }

/* Colores según dónde esté el taxi */
.taxi-token.asignado {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #facc15;
  border: 1px solid #334155;
}
.taxi-token.libre {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
}

/* ZONA DE BANCA */
.banca-container { padding: 20px; min-height: 150px; }
.banca-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.banca-header h3 { margin: 0; font-size: 1.2rem; color: #1e293b; }
.badge { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }

.banca-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.banca-grid .taxi-token { width: auto; padding: 8px 15px; }

@media (max-width: 1200px) {
  .calendario-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 768px) {
  .calendario-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>