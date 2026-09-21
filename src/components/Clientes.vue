<template>
  <div class="container-fluid mt-4">
    <!-- Header con Botones Funcionales -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0 text-dark" style="font-weight: 600;">Directorio de Clientes</h3>
      <div class="d-flex gap-2">
        <!-- Botón Plantilla -->
        <button class="btn btn-light border text-secondary fw-semibold" @click="descargarPlantilla">
          <i class="bi bi-file-earmark-text text-danger me-1"></i> Plantilla
        </button>
        
        <!-- Botón Importar (Usa un input oculto) -->
        <input type="file" ref="fileInput" @change="procesarImportacion" accept=".csv" style="display: none;">
        <button class="btn text-white fw-semibold" style="background-color: #f59e0b;" @click="$refs.fileInput.click()">
          <i class="bi bi-box-arrow-in-up text-primary me-1"></i> Importar
        </button>
        
        <!-- Botón Exportar -->
        <button class="btn text-white fw-semibold" style="background-color: #10b981;" @click="exportarClientes">
          <i class="bi bi-box-arrow-down text-danger me-1"></i> Exportar
        </button>
        
        <button class="btn btn-primary fw-semibold" @click="abrirModalNuevo">
          <i class="bi bi-plus-lg text-white me-1"></i> Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- Buscador Full Width -->
    <div class="bg-white p-3 rounded shadow-sm mb-4">
      <div class="input-group border rounded">
        <span class="input-group-text bg-white border-0">
          <i class="bi bi-search" style="color: #6366f1; font-size: 1.1rem;"></i>
        </span>
        <input 
          type="text" 
          class="form-control border-0 shadow-none py-2" 
          v-model="busqueda" 
          placeholder="Buscar por nombre, teléfono, correo o dirección..."
        >
      </div>
    </div>

    <!-- Tabla de Clientes -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped mb-0">
            <thead class="table-light">
              <tr>
                <th>Nombre del Cliente</th>
                <th>Teléfono</th>
                <th>Correo Electrónico</th>
                <th>Dirección Frecuente</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="clientesFiltrados.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  No hay clientes registrados o que coincidan con la búsqueda.
                </td>
              </tr>
              <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                <td class="fw-bold">{{ cliente.nombre }}</td>
                <td>
                  <a :href="'tel:' + cliente.telefono" class="text-decoration-none">
                    <i class="bi bi-telephone-fill me-1 text-success"></i>{{ cliente.telefono }}
                  </a>
                </td>
                <td>{{ cliente.correo || '-' }}</td>
                <td>
                  {{ cliente.direccion }}
                  <a v-if="cliente.mapaUrl" :href="cliente.mapaUrl" target="_blank" class="badge bg-info text-white text-decoration-none ms-2" title="Abrir en Google Maps">
                    <i class="bi bi-geo-alt-fill"></i> Mapa
                  </a>
                </td>
                <td class="text-muted small">{{ cliente.notas || '-' }}</td>
                <td class="text-nowrap">
                  <!-- Botón de Copiar/Compartir -->
                  <button class="btn btn-sm btn-outline-success me-2" @click="copiarDatos(cliente)" title="Copiar datos para compartir">
                    <i class="bi bi-share-fill"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editarCliente(cliente)" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="eliminarCliente(cliente.id)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para Nuevo/Editar Cliente -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-primary">
              <i class="bi bi-person-badge me-2"></i>{{ editando ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}
            </h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarCliente">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold text-muted small mb-1">Nombre Completo</label>
                  <input type="text" class="form-control" v-model="nuevoCliente.nombre" required placeholder="Ej. María Fernanda Gómez">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-muted small mb-1">Teléfono / Celular</label>
                  <input type="tel" class="form-control" v-model="nuevoCliente.telefono" required placeholder="099...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-muted small mb-1">Correo Electrónico</label>
                  <input type="email" class="form-control" v-model="nuevoCliente.correo" placeholder="ejemplo@correo.com">
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold text-muted small mb-1">Dirección Frecuente (Origen)</label>
                  <input type="text" class="form-control" v-model="nuevoCliente.direccion" required placeholder="Barrio, Calle principal y secundaria...">
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold text-muted small mb-1">
                    <i class="bi bi-geo-alt text-danger me-1"></i>Enlace de Google Maps (Opcional)
                  </label>
                  <input type="url" class="form-control" v-model="nuevoCliente.mapaUrl" placeholder="https://maps.app.goo.gl/...">
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold text-muted small mb-1">Referencias o Notas</label>
                  <textarea class="form-control" v-model="nuevoCliente.notas" rows="2" placeholder="Ej. Casa de dos pisos verde..."></textarea>
                </div>
              </div>
              <div class="modal-footer mt-4 pb-0 pe-0">
                <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  {{ editando ? 'Actualizar Datos' : 'Guardar Cliente' }}
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
  name: 'ClientesView',
  data() {
    return {
      clientes: [],
      busqueda: '',
      showModal: false,
      editando: false,
      clienteEditarId: null,
      nuevoCliente: {
        nombre: '',
        telefono: '',
        correo: '',
        direccion: '',
        mapaUrl: '',
        notas: ''
      }
    }
  },
  computed: {
    clientesFiltrados() {
      if (!this.busqueda) return this.clientes;
      const termino = this.busqueda.toLowerCase();
      return this.clientes.filter(c => 
        c.nombre.toLowerCase().includes(termino) || 
        c.telefono.includes(termino) ||
        (c.correo && c.correo.toLowerCase().includes(termino)) ||
        (c.direccion && c.direccion.toLowerCase().includes(termino))
      );
    }
  },
  mounted() {
    this.obtenerClientes();
  },
  methods: {
    abrirModalNuevo() {
      this.editando = false;
      this.clienteEditarId = null;
      this.nuevoCliente = { nombre: '', telefono: '', correo: '', direccion: '', mapaUrl: '', notas: '' };
      this.showModal = true;
    },
    cerrarModal() {
      this.showModal = false;
    },
    obtenerClientes() {
      onSnapshot(collection(db, "clientes"), (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        this.clientes = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      });
    },
    async guardarCliente() {
      try {
        if (this.editando) {
          const clienteRef = doc(db, "clientes", this.clienteEditarId);
          await updateDoc(clienteRef, { ...this.nuevoCliente });
        } else {
          await addDoc(collection(db, "clientes"), { ...this.nuevoCliente });
        }
        this.cerrarModal();
      } catch (e) {
        console.error("Error al guardar cliente: ", e);
      }
    },
    editarCliente(cliente) {
      this.editando = true;
      this.clienteEditarId = cliente.id;
      this.nuevoCliente = { 
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo || '',
        direccion: cliente.direccion,
        mapaUrl: cliente.mapaUrl || '',
        notas: cliente.notas || ''
      };
      this.showModal = true;
    },
    async eliminarCliente(id) {
      if(confirm("¿Estás seguro de que deseas eliminar a este cliente?")) {
        try {
          await deleteDoc(doc(db, "clientes", id));
        } catch (e) {
          console.error("Error al eliminar: ", e);
        }
      }
    },
    
    // --- FUNCIÓN ACTUALIZADA: Copiar al Portapapeles ---
    async copiarDatos(cliente) {
      let texto = `🚕 *Datos del Cliente - Transnewfastcar*\n\n`;
      texto += `👤 *Nombre:* ${cliente.nombre}\n`;
      texto += `📱 *Teléfono:* ${cliente.telefono}\n`;
      texto += `📍 *Dirección:* ${cliente.direccion}\n`;
      
      if (cliente.mapaUrl) {
        texto += `🗺️ *Mapa:* ${cliente.mapaUrl}\n`;
      }
      if (cliente.notas) {
        texto += `⚠️ *Notas:* ${cliente.notas}\n`;
      }
      
      try {
        await navigator.clipboard.writeText(texto);
        alert("¡Datos copiados exitosamente! Ya puedes pegarlos en WhatsApp o donde lo necesites.");
      } catch (err) {
        console.error("Error al copiar: ", err);
        alert("Hubo un error al intentar copiar los datos.");
      }
    },

    // --- FUNCIONES DE EXPORTAR E IMPORTAR ---
    descargarPlantilla() {
      const csvContent = "data:text/csv;charset=utf-8,Nombre,Teléfono,Correo,Dirección,MapaURL,Notas\nJuan Perez,0991234567,juan@correo.com,Terminal Terrestre,https://maps.app.goo.gl/ejemplo,Cliente frecuente";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "plantilla_clientes.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportarClientes() {
      if (this.clientes.length === 0) {
        alert("No hay clientes para exportar.");
        return;
      }
      let csvContent = "data:text/csv;charset=utf-8,Nombre,Teléfono,Correo,Dirección,MapaURL,Notas\n";
      this.clientes.forEach(c => {
        let row = `"${c.nombre}","${c.telefono}","${c.correo || ''}","${c.direccion}","${c.mapaUrl || ''}","${c.notas || ''}"`;
        csvContent += row + "\n";
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "clientes_transnewfastcar.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    procesarImportacion(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1);
        let contador = 0;
        for (let row of rows) {
          if (!row.trim()) continue;
          const cols = row.split(',').map(col => col.replace(/(^"|"$)/g, '').trim());
          if (cols.length >= 4 && cols[0]) { 
            try {
              await addDoc(collection(db, "clientes"), {
                nombre: cols[0],
                telefono: cols[1] || '',
                correo: cols[2] || '',
                direccion: cols[3] || '',
                mapaUrl: cols[4] || '',
                notas: cols[5] || ''
              });
              contador++;
            } catch (error) {
              console.error("Error al importar fila: ", error);
            }
          }
        }
        alert(`¡Éxito! Se importaron ${contador} clientes a la base de datos.`);
        event.target.value = null;
      };
      reader.readAsText(file);
    }
  }
}
</script>

<style scoped>
.table th {
  white-space: nowrap;
}
.form-control:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.25);
}
</style>