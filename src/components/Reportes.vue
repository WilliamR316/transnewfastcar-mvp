<template>
  <div class="reportes-section">
    <!-- ========================================== -->
    <!-- PANTALLA PRINCIPAL (Vista Web Interactiva) -->
    <!-- ========================================== -->
    <div v-show="!generandoPDF">
      <div class="header-section">
        <div>
          <h2>Reportes y Estadísticas</h2>
          <p class="subtitle">Rendimiento general o por conductor</p>
        </div>
        <div class="filter-actions">
          <select v-model="conductorSeleccionado" class="select-control">
            <option value="todos">🌐 Todos los conductores</option>
            <option v-for="d in topConductores" :key="d.id" :value="d.nombre">
              👤 {{ d.nombre }} (Unidad #{{ d.unidad }})
            </option>
          </select>

          <select v-model="rangoTiempo" class="select-control">
            <option>Hoy</option>
            <option selected>Últimos 7 días</option>
            <option>Este Mes</option>
          </select>

          <button class="btn btn-primary" @click="descargarPDFSimple">
            📄 Descargar Lista PDF
          </button>
        </div>
      </div>

      <!-- Tarjetas Web -->
      <div class="metricas-grid">
        <div class="card metric">
          <div class="icon-wrapper blue">📍</div>
          <div class="metric-info">
            <span class="label">Carreras Completadas</span>
            <h3 class="value">{{ metricasActuales.carreras }}</h3>
          </div>
        </div>
        <div class="card metric">
          <div class="icon-wrapper green">💵</div>
          <div class="metric-info">
            <span class="label">Ingresos Estimados</span>
            <h3 class="value">${{ metricasActuales.ingresos.toFixed(2) }}</h3>
          </div>
        </div>
        <div class="card metric">
          <div class="icon-wrapper orange">⏱️</div>
          <div class="metric-info">
            <span class="label">Tiempo Prom. Llegada</span>
            <h3 class="value">{{ metricasActuales.tiempo }} min</h3>
          </div>
        </div>
        <div class="card metric">
          <div class="icon-wrapper red">❌</div>
          <div class="metric-info">
            <span class="label">Canceladas</span>
            <h3 class="value">{{ metricasActuales.canceladas }}</h3>
          </div>
        </div>
      </div>

      <div class="dashboard-body">
        <!-- Gráfico Web -->
        <div class="card chart-container">
          <div class="card-header">
            <h3>📊 Historial de Productividad ({{ rangoTiempo }})</h3>
          </div>
          <div class="css-chart">
            <div class="chart-y-axis">
              <span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
            </div>
            <div class="chart-bars">
              <div class="bar-group" v-for="dia in estadisticasSemanales" :key="dia.dia">
                <div class="bar" :style="{ height: (dia.carreras / 200) * 100 + '%' }">
                  <span class="bar-value">{{ dia.carreras }}</span>
                </div>
                <span class="bar-label">{{ dia.dia }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ranking Web -->
        <div class="card ranking-container" v-if="conductorSeleccionado === 'todos'">
          <div class="card-header">
            <h3>🏆 Ranking de Flota</h3>
          </div>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(driver, index) in topConductores" :key="driver.id" @click="conductorSeleccionado = driver.nombre" style="cursor: pointer;">
              <div class="rank-medal" :class="index === 0 ? 'oro' : index === 1 ? 'plata' : 'bronce'">
                {{ index + 1 }}
              </div>
              <div class="driver-info">
                <h4>{{ driver.nombre }}</h4>
                <p>Unidad #{{ driver.unidad }}</p>
              </div>
              <div class="driver-stats">
                <span class="carreras-badge">{{ driver.carreras }} viajes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PLANTILLA EXCLUSIVA PARA EL PDF (Tabla Limpia) -->
    <!-- ========================================== -->
    <div v-show="generandoPDF" id="documento-pdf" class="pdf-export-layout">
      <!-- Encabezado del PDF -->
      <div class="pdf-header">
        <h2 class="pdf-title">🚕 TRANSNEWFAST</h2>
        <h3 class="pdf-subtitle">REPORTE DETALLADO DE CARRERAS</h3>
        
        <div class="pdf-meta-box">
          <div class="meta-item">
            <strong>Fecha de Emisión:</strong> {{ fechaActual }}
          </div>
          <div class="meta-item">
            <strong>Filtro / Conductor:</strong> {{ conductorSeleccionado.toUpperCase() }}
          </div>
          <div class="meta-item">
            <strong>Periodo:</strong> {{ rangoTiempo }}
          </div>
        </div>
      </div>

      <!-- Resumen en el PDF -->
      <div class="pdf-summary">
        <div class="summary-card">
          <span class="summary-label">Total Carreras</span>
          <span class="summary-value blue-text">{{ metricasActuales.carreras }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Ingresos Generados</span>
          <span class="summary-value green-text">${{ metricasActuales.ingresos.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Tabla Limpia de Resultados -->
      <div class="pdf-table-container">
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Día</th>
              <th style="text-align: center;">Carreras Realizadas</th>
              <th style="text-align: right;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dia in estadisticasSemanales" :key="dia.dia">
              <td><strong>{{ dia.dia }}</strong> (Septiembre)</td>
              <td style="text-align: center; font-size: 1.1rem; font-weight: bold; color: #1e293b;">
                {{ conductorSeleccionado === 'todos' ? dia.carreras : Math.floor(dia.carreras / 3) }}
              </td>
              <td style="text-align: right; color: #166534; font-weight: 600;">
                ✔️ Liquidado
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pie de página del PDF -->
      <div class="pdf-footer">
        <p>Documento generado automáticamente por el Sistema Operativo Transnewfast.</p>
        <p>Válido para revisión y control interno de la base.</p>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'Reportes',
  data() {
    return {
      conductorSeleccionado: 'todos',
      rangoTiempo: 'Últimos 7 días',
      fechaActual: new Date().toLocaleDateString(),
      generandoPDF: false, 
      
      estadisticasSemanales: [
        { dia: 'Lunes', carreras: 120 }, { dia: 'Martes', carreras: 95 },
        { dia: 'Miércoles', carreras: 140 }, { dia: 'Jueves', carreras: 110 },
        { dia: 'Viernes', carreras: 185 }, { dia: 'Sábado', carreras: 195 },
        { dia: 'Domingo', carreras: 160 }
      ],
      topConductores: [
        { id: 1, nombre: 'Carlos Mendoza', unidad: '101', carreras: 145, ingresos: 362.50 },
        { id: 2, nombre: 'Ana Salazar', unidad: '103', carreras: 132, ingresos: 330.00 },
        { id: 3, nombre: 'Luis Paredes', unidad: '102', carreras: 128, ingresos: 320.00 }
      ]
    };
  },
  computed: {
    metricasActuales() {
      if (this.conductorSeleccionado === 'todos') {
        return { carreras: 845, ingresos: 2112.50, tiempo: 4.2, canceladas: 18 };
      } else {
        const driver = this.topConductores.find(d => d.nombre === this.conductorSeleccionado);
        if (driver) return { carreras: driver.carreras, ingresos: driver.ingresos, tiempo: 3.8, canceladas: 2 };
      }
      return { carreras: 0, ingresos: 0, tiempo: 0, canceladas: 0 };
    }
  },
  methods: {
    descargarPDFSimple() {
      this.generandoPDF = true;

      // Usamos nextTick para esperar que Vue muestre la plantilla limpia antes de tomar la "foto"
      this.$nextTick(() => {
        setTimeout(() => {
          const elemento = document.getElementById('documento-pdf');

          const opciones = {
            margin:       0.6,
            filename:     `Listado_Carreras_${this.conductorSeleccionado.replace(/ /g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          if (!window.html2pdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
              window.html2pdf().set(opciones).from(elemento).save().then(() => {
                this.generandoPDF = false; 
              });
            };
            document.head.appendChild(script);
          } else {
            window.html2pdf().set(opciones).from(elemento).save().then(() => {
              this.generandoPDF = false;
            });
          }
        }, 150); // Un pequeño retraso para asegurar el renderizado
      });
    }
  }
};
</script>

<style scoped>
/* ================================================= */
/* ESTILOS DE LA PANTALLA WEB (Lo que ve el usuario) */
/* ================================================= */
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
.header-section h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 4px; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.filter-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.select-control { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; background: white; font-weight: 500; color: #1e293b; cursor: pointer; }
.btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }

.card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; }

.metricas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
.metric { padding: 15px; display: flex; align-items: center; gap: 15px; }
.icon-wrapper { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.icon-wrapper.blue { background: #eff6ff; color: #2563eb; }
.icon-wrapper.green { background: #f0fdf4; color: #166534; }
.icon-wrapper.orange { background: #fff7ed; color: #c2410c; }
.icon-wrapper.red { background: #fef2f2; color: #b91c1c; }
.metric-info { display: flex; flex-direction: column; gap: 2px; }
.metric-info .label { font-size: 0.8rem; color: #64748b; font-weight: 600; }
.metric-info .value { margin: 0; font-size: 1.3rem; color: #0f172a; font-weight: 800; }

.dashboard-body { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.card-header { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; }
.card-header h3 { margin: 0; font-size: 1.05rem; color: #1e293b; }

.chart-container { padding-bottom: 15px; }
.css-chart { display: flex; height: 250px; padding: 20px 20px 0 10px; gap: 15px; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; color: #94a3b8; font-size: 0.8rem; padding-bottom: 25px; font-weight: 600; width: 30px;}
.chart-bars { flex: 1; display: flex; justify-content: space-around; align-items: flex-end; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; position: relative; }
.chart-bars::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(to bottom, #f1f5f9 1px, transparent 1px); background-size: 100% 25%; z-index: 0; }
.bar-group { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 10%; z-index: 1; gap: 8px; position: relative;}
.bar { width: 100%; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px 4px 0 0; position: relative; display: flex; justify-content: center; }
.bar-value { position: absolute; top: -20px; font-size: 0.75rem; font-weight: 700; color: #1e293b; }
.bar-label { position: absolute; bottom: -25px; font-size: 0.8rem; font-weight: 600; color: #64748b; }

.ranking-list { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.ranking-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
.rank-medal { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 0.9rem; }
.rank-medal.oro { background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%); }
.rank-medal.plata { background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%); }
.rank-medal.bronce { background: linear-gradient(135deg, #f97316 0%, #c2410c 100%); }
.driver-info { flex: 1; }
.driver-info h4 { margin: 0; font-size: 0.95rem; color: #0f172a; }
.driver-info p { margin: 2px 0 0 0; font-size: 0.75rem; color: #64748b; }
.carreras-badge { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }

@media (max-width: 1024px) {
  .dashboard-body { grid-template-columns: 1fr; }
}

/* ================================================= */
/* ESTILOS EXCLUSIVOS PARA EL PDF (Plantilla Limpia) */
/* ================================================= */
.pdf-export-layout {
  background: white;
  padding: 40px;
  color: #0f172a;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.pdf-header { text-align: center; margin-bottom: 30px; }
.pdf-title { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; }
.pdf-subtitle { font-size: 1.2rem; font-weight: 600; color: #3b82f6; margin: 0 0 20px 0; letter-spacing: 1px;}

.pdf-meta-box {
  display: flex;
  justify-content: space-between;
  background: #f8fafc;
  padding: 15px 25px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
}

.pdf-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.summary-card {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary-label { font-weight: 600; color: #475569; font-size: 1.1rem;}
.summary-value { font-weight: 800; font-size: 1.5rem; }
.blue-text { color: #2563eb; }
.green-text { color: #166534; }

.pdf-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}
.pdf-table th {
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 700;
  padding: 12px 15px;
  border-bottom: 2px solid #cbd5e1;
  text-transform: uppercase;
  font-size: 0.85rem;
  text-align: left;
}
.pdf-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  font-size: 1rem;
}

.pdf-footer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
  margin-top: 40px;
}
.pdf-footer p { margin: 4px 0; }
</style>