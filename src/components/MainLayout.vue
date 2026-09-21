<template>
  <div class="layout-container">
    <aside :class="['sidebar', { 'collapsed': menuPlegado }]">
      <div class="sidebar-header">
        <div class="brand" v-if="!menuPlegado">
          <span class="brand-icon">🚕</span>
          <span class="brand-name">Transnewfastcar</span>
        </div>
        <button class="toggle-btn" @click="menuPlegado = !menuPlegado">
          {{ menuPlegado ? '☰' : '◀' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- BOTÓN: DASHBOARD -->
        <button :class="['nav-item', vistaActual === 'dashboard' ? 'active' : '']" @click="vistaActual = 'dashboard'">
          <span class="nav-icon">🏠</span>
          <span class="nav-label" v-if="!menuPlegado">Dashboard</span>
        </button>

        <button :class="['nav-item', vistaActual === 'mapa' ? 'active' : '']" @click="vistaActual = 'mapa'">
          <span class="nav-icon">🗺️</span>
          <span class="nav-label" v-if="!menuPlegado">Monitoreo GPS</span>
        </button>

        <button :class="['nav-item', vistaActual === 'base' ? 'active' : '']" @click="vistaActual = 'base'">
          <span class="nav-icon">🏢</span>
          <span class="nav-label" v-if="!menuPlegado">Base / Punteros</span>
        </button>

        <!-- GRUPO FLOTA CON DESPLEGABLE -->
        <div class="nav-group">
          <button 
            :class="['nav-item', (vistaActual === 'flota' || vistaActual === 'guardias') ? 'active-parent' : '']" 
            @click="toggleMenuFlota"
          >
            <span class="nav-icon">🚖</span>
            <span class="nav-label" v-if="!menuPlegado">Flota y Unidades</span>
            <span class="chevron" v-if="!menuPlegado">{{ menuFlotaExpandido ? '▼' : '▶' }}</span>
          </button>
          
          <div class="sub-menu" v-if="menuFlotaExpandido && !menuPlegado">
            <button :class="['sub-nav-item', vistaActual === 'flota' ? 'active-sub' : '']" @click="vistaActual = 'flota'">
              Lista de Unidades
            </button>
            <button :class="['sub-nav-item', vistaActual === 'guardias' ? 'active-sub' : '']" @click="vistaActual = 'guardias'">
              Turnos / Guardias
            </button>
          </div>
        </div>

        <button :class="['nav-item', vistaActual === 'clientes' ? 'active' : '']" @click="vistaActual = 'clientes'">
          <span class="nav-icon">👥</span>
          <span class="nav-label" v-if="!menuPlegado">Clientes</span>
        </button>

        <button :class="['nav-item', vistaActual === 'viajes' ? 'active' : '']" @click="vistaActual = 'viajes'">
          <span class="nav-icon">📍</span>
          <span class="nav-label" v-if="!menuPlegado">Carreras / Despacho</span>
        </button>

        <button :class="['nav-item', vistaActual === 'usuarios' ? 'active' : '']" @click="vistaActual = 'usuarios'">
          <span class="nav-icon">🔐</span>
          <span class="nav-label" v-if="!menuPlegado">Usuarios y Roles</span>
        </button>

        <button :class="['nav-item', vistaActual === 'reportes' ? 'active' : '']" @click="vistaActual = 'reportes'">
          <span class="nav-icon">📈</span>
          <span class="nav-label" v-if="!menuPlegado">Reportes</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button @click="$emit('logout')" class="btn-logout">
          <span class="nav-icon">🚪</span>
          <span class="nav-label" v-if="!menuPlegado">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <div class="main-wrapper">
      <header class="top-header">
        <div>
          <h1>{{ tituloVista }}</h1>
          <p class="subtitle">Panel de Control Operativo</p>
        </div>
        <div class="user-profile">
          <span class="user-badge">Administrador</span>
        </div>
      </header>

      <main class="content-area">
        <!-- VISTAS DE LOS MÓDULOS -->
        <PanelDashboard v-if="vistaActual === 'dashboard'" />  
        <Mapa v-else-if="vistaActual === 'mapa'" />
        <Base v-else-if="vistaActual === 'base'" />
        <Flota v-else-if="vistaActual === 'flota'" />
        <Guardias v-else-if="vistaActual === 'guardias'" />
        <Clientes v-else-if="vistaActual === 'clientes'" />
        <Usuarios v-else-if="vistaActual === 'usuarios'" />
        <Carreras v-else-if="vistaActual === 'viajes'" />
        <Reportes v-else-if="vistaActual === 'reportes'" />

        <div v-else class="card placeholder-card">
          <h3>Módulo en preparación</h3>
          <p>Esta sección estará lista pronto.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
// AQUÍ ESTABA EL ERROR: Aseguramos que importe Dashboard.vue
import PanelDashboard from './Dashboard.vue'; 
import Mapa from './Mapa.vue';
import Base from './Base.vue'; 
import Flota from './Flota.vue';
import Guardias from './Guardias.vue';
import Clientes from './Clientes.vue';
import Usuarios from './Usuarios.vue';
import Carreras from './Carreras.vue'; 
import Reportes from './Reportes.vue'; 

export default {
  name: 'MainLayout',
  components: { 
    PanelDashboard, 
    Mapa, 
    Base, 
    Flota, 
    Guardias,
    Clientes, 
    Usuarios, 
    Carreras,
    Reportes 
  },
  data() {
    return {
      menuPlegado: false,
      vistaActual: 'dashboard', 
      menuFlotaExpandido: false 
    };
  },
  computed: {
    tituloVista() {
      if (this.vistaActual === 'dashboard') return 'Resumen Operativo';
      if (this.vistaActual === 'mapa') return 'Radar y Rastreo GPS';
      if (this.vistaActual === 'base') return 'Control de Base';
      if (this.vistaActual === 'flota') return 'Directorio de Flota';
      if (this.vistaActual === 'guardias') return 'Control de Guardias y Turnos'; 
      if (this.vistaActual === 'clientes') return 'Directorio de Clientes';
      if (this.vistaActual === 'usuarios') return 'Gestión de Sistema y Accesos';
      if (this.vistaActual === 'viajes') return 'Despacho de Carreras';
      if (this.vistaActual === 'reportes') return 'Reportes Generales';
      return 'Panel Operativo';
    }
  },
  methods: {
    toggleMenuFlota() {
      this.menuFlotaExpandido = !this.menuFlotaExpandido;
      if (this.menuFlotaExpandido && this.vistaActual !== 'flota' && this.vistaActual !== 'guardias') {
        this.vistaActual = 'flota';
      }
    }
  }
};
</script>

<style scoped>
.layout-container { display: flex; min-height: 100vh; background-color: #f1f5f9; }
.sidebar { width: 250px; background-color: #0f172a; color: #ffffff; display: flex; flex-direction: column; transition: width 0.3s; position: sticky; top: 0; height: 100vh; z-index: 100;}
.sidebar.collapsed { width: 80px; }
.sidebar-header { padding: 24px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; }
.brand { display: flex; align-items: center; gap: 10px; }
.brand-icon { font-size: 1.4rem; }
.brand-name { font-weight: 700; font-size: 1.15rem; color: #ffffff; }
.toggle-btn { background: #1e293b; border: none; color: #94a3b8; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; margin-left: auto; }
.toggle-btn:hover { background: #334155; color: #ffffff; }

.sidebar-nav { display: flex; flex-direction: column; gap: 8px; padding: 20px 12px; flex: 1; overflow-y: auto;}
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

.nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: transparent; border: none; border-radius: 10px; color: #94a3b8; font-size: 0.95rem; font-weight: 500; cursor: pointer; width: 100%; text-align: left; transition: all 0.2s;}
.nav-item:hover { background-color: #1e293b; color: #ffffff; }
.nav-item.active { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

.nav-group { display: flex; flex-direction: column; gap: 4px; }
.nav-item.active-parent { background-color: rgba(37, 99, 235, 0.15); color: #ffffff; border: 1px solid rgba(37, 99, 235, 0.3); }
.chevron { margin-left: auto; font-size: 0.7rem; color: #64748b; }

.sub-menu { display: flex; flex-direction: column; gap: 4px; padding-left: 46px; margin-top: 4px; animation: fadeInDown 0.2s ease-out; }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

.sub-nav-item { background: transparent; border: none; color: #94a3b8; padding: 8px 12px; border-radius: 8px; text-align: left; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
.sub-nav-item:hover { color: #ffffff; background: #1e293b; }
.sub-nav-item.active-sub { color: #3b82f6; font-weight: 700; }

.nav-icon { font-size: 1.2rem; min-width: 24px; text-align: center; }
.sidebar-footer { padding: 16px 12px; border-top: 1px solid #1e293b; }
.btn-logout { display: flex; align-items: center; gap: 14px; padding: 12px 16px; width: 100%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px; color: #f87171; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-logout:hover { background-color: #ef4444; color: #ffffff; }

.main-wrapper { flex: 1; padding: 30px 40px; overflow-y: auto; }
.top-header { background: white; padding: 24px 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
.top-header h1 { font-size: 1.6rem; color: #0f172a; margin-bottom: 4px; }
.subtitle { color: #64748b; font-size: 0.95rem; }
.user-badge { background-color: #dcfce7; color: #15803d; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }

.placeholder-card { text-align: center; padding: 60px 20px; color: #64748b; background: white; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; gap: 15px;}
.placeholder-card h3 { color: #1e293b; margin: 0; }
</style>