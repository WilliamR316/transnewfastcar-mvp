<template>
  <div class="mapa-section">
    <div class="header-section">
      <div>
        <h2>Monitoreo GPS (Radar en Vivo)</h2>
        <p class="subtitle">Conexión satelital de la flota vía Traccar</p>
      </div>
      <div class="status-indicator">
        <span class="pulsing-dot"></span>
        Recibiendo telemetría
      </div>
    </div>

    <div class="mapa-grid">
      <!-- PANEL LATERAL: LISTA DE UNIDADES EN EL RADAR -->
      <div class="unidades-panel card">
        <h3>📍 Unidades Activas ({{ vehiculosRadar.length }})</h3>
        
        <div class="lista-radar">
          <div class="radar-item" v-for="vehiculo in vehiculosRadar" :key="vehiculo.id" @click="centrarEnVehiculo(vehiculo)">
            <div class="radar-info">
              <span :class="['badge-unidad', vehiculo.estado === 'T4 - En Carrera' ? 'ocupado' : 'disponible']">
                #{{ vehiculo.id }}
              </span>
              <div class="detalles">
                <strong>{{ vehiculo.conductor }}</strong>
                <span class="ubicacion-texto">{{ vehiculo.estado }}</span>
              </div>
            </div>
            <div class="radar-velocidad">
              <span class="numero">{{ vehiculo.velocidad }}</span>
              <span class="unidad">km/h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAPA PRINCIPAL INTERACTIVO -->
      <div class="mapa-contenedor card">
        <!-- Contenedor real del mapa interactivo -->
        <div id="map" style="width: 100%; height: 100%; border-radius: 12px; z-index: 1;"></div>
        
        <!-- Etiqueta flotante simulando la conexión -->
        <div class="mapa-overlay-aviso">
          📡 Simulador Traccar Activo
        </div>

        <button class="btn-centrar" @click="centrarMapaGlobal" title="Centrar mapa">
          🎯 Centrar Radar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Mapa',
  data() {
    return {
      mapInstance: null,
      marcadores: {},
      // Coordenadas base en Machala
      vehiculosRadar: [
        { id: 101, conductor: 'Carlos Mendoza', estado: 'T1 - Disponible', lat: -3.2612, lng: -79.9605, velocidad: 0 }, // Cerca del Paseo
        { id: 102, conductor: 'Luis Paredes', estado: 'T4 - En Carrera', lat: -3.2720, lng: -79.9980, velocidad: 45 }, // Hacia Puerto Bolívar
        { id: 103, conductor: 'Ana Salazar', estado: 'T4 - En Carrera', lat: -3.2450, lng: -79.9550, velocidad: 35 }, // Vía Terminal
        { id: 106, conductor: 'Jorge Loor', estado: 'T1 - Disponible', lat: -3.2650, lng: -79.9750, velocidad: 0 }  // Centro
      ],
      simuladorInterval: null
    };
  },
  mounted() {
    // Inyectamos el motor de mapas dinámicamente sin necesidad de instalar nada extra
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => this.iniciarMapa();
      document.head.appendChild(script);
    } else {
      this.iniciarMapa();
    }
  },
  beforeUnmount() {
    // Limpiamos el simulador al cambiar de pantalla
    if (this.simuladorInterval) clearInterval(this.simuladorInterval);
    if (this.mapInstance) this.mapInstance.remove();
  },
  methods: {
    iniciarMapa() {
      // Centramos el mapa en Machala con un zoom adecuado
      this.mapInstance = window.L.map('map').setView([-3.2581, -79.9554], 14);

      // Usamos los mapas gratuitos de OpenStreetMap
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.mapInstance);

      // Creamos un ícono de taxi personalizado para evitar errores de imágenes
      const taxiIcon = window.L.divIcon({
        html: '<div style="font-size: 20px; background: white; border-radius: 50%; border: 3px solid #3b82f6; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">🚕</div>',
        className: 'custom-taxi-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      // Dibujamos los taxis en el mapa
      this.vehiculosRadar.forEach(v => {
        const marker = window.L.marker([v.lat, v.lng], { icon: taxiIcon })
          .addTo(this.mapInstance)
          .bindPopup(`<b>Unidad #${v.id}</b><br>${v.conductor}`);
        
        this.marcadores[v.id] = marker;
      });

      // Iniciamos la simulación del GPS de Traccar
      this.iniciarSimuladorTraccar();
    },
    iniciarSimuladorTraccar() {
      // Cada 3 segundos, los taxis que están en carrera se moverán ligeramente
      this.simuladorInterval = setInterval(() => {
        this.vehiculosRadar.forEach(v => {
          if (v.estado === 'T4 - En Carrera') {
            // Alteramos ligeramente las coordenadas para simular movimiento real
            v.lat += (Math.random() - 0.5) * 0.0015;
            v.lng += (Math.random() - 0.5) * 0.0015;
            // Variamos la velocidad entre 30 y 60 km/h
            v.velocidad = Math.floor(Math.random() * 30) + 30; 
            
            // Movemos el ícono en el mapa interactivo
            if (this.marcadores[v.id]) {
              this.marcadores[v.id].setLatLng([v.lat, v.lng]);
            }
          }
        });
      }, 3000);
    },
    centrarEnVehiculo(vehiculo) {
      if (this.mapInstance) {
        this.mapInstance.flyTo([vehiculo.lat, vehiculo.lng], 16, { animate: true, duration: 1.5 });
      }
    },
    centrarMapaGlobal() {
      if (this.mapInstance) {
        this.mapInstance.flyTo([-3.2581, -79.9554], 14, { animate: true, duration: 1.5 });
      }
    }
  }
};
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header-section h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 4px; }
.subtitle { color: #64748b; font-size: 0.95rem; }

/* ESTADO DE CONEXIÓN CON PUNTO PARPADEANTE */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0fdf4;
  color: #166534;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid #bbf7d0;
}
.pulsing-dot {
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.mapa-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 25px;
  height: 65vh; 
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

/* PANEL LATERAL DE VEHÍCULOS */
.unidades-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.unidades-panel h3 { font-size: 1.1rem; color: #1e293b; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }

.lista-radar {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 5px;
}
.lista-radar::-webkit-scrollbar { width: 6px; }
.lista-radar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.radar-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
}
.radar-item:hover { transform: translateX(5px); border-color: #3b82f6; background: #eff6ff; }

.radar-info { display: flex; gap: 12px; align-items: center; }
.badge-unidad {
  font-weight: 800;
  font-size: 0.9rem;
  padding: 8px;
  border-radius: 8px;
  color: white;
  min-width: 45px;
  text-align: center;
}
.badge-unidad.disponible { background: #10b981; }
.badge-unidad.ocupado { background: #f59e0b; }

.detalles { display: flex; flex-direction: column; gap: 2px; }
.detalles strong { font-size: 0.95rem; color: #0f172a; }
.ubicacion-texto { font-size: 0.8rem; color: #64748b; }

.radar-velocidad {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.radar-velocidad .numero { font-weight: 700; font-size: 1.1rem; color: #0f172a; line-height: 1; }
.radar-velocidad .unidad { font-size: 0.65rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

/* MAPA PRINCIPAL */
.mapa-contenedor {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.mapa-overlay-aviso {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.85);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  z-index: 1000;
  pointer-events: none;
}

.btn-centrar {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: white;
  border: 2px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 30px;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1000;
}
.btn-centrar:hover { background: #f8fafc; transform: scale(1.05); border-color: #3b82f6; color: #3b82f6;}

@media (max-width: 1100px) {
  .mapa-grid { grid-template-columns: 1fr; height: auto; }
  .mapa-contenedor { height: 500px; }
}
</style>