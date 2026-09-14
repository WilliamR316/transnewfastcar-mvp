<template>
  <div class="clientes-section">
    <div class="header-section">
      <h2>Directorio de Clientes</h2>
      <div class="header-buttons">
        
        <!-- Botón para descargar la plantilla vacía -->
        <button class="btn btn-outline" @click="descargarPlantilla" title="Descargar Excel vacío para llenar">
          📝 Plantilla
        </button>

        <!-- Input oculto que abre la ventana de selección de archivos -->
        <input type="file" ref="fileInput" @change="importarExcel" accept=".csv" style="display: none" />
        
        <!-- Botón visible que activa el input oculto -->
        <button class="btn btn-warning" @click="$refs.fileInput.click()" title="Subir lista de clientes">
          📤 Importar
        </button>

        <button class="btn btn-success" @click="exportarExcel" title="Descargar respaldo">
          📥 Exportar
        </button>
        
        <button class="btn btn-primary" @click="abrirModalNuevo">
          ➕ Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- BARRA DE BÚSQUEDA -->
    <div class="search-bar-container card">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="busqueda" 
          placeholder="Buscar por nombre, teléfono, correo o dirección..." 
        />
        <button v-if="busqueda" class="clear-search" @click="busqueda = ''">✖</button>
      </div>
    </div>

    <!-- TABLA DE CLIENTES -->
    <div class="card table-container">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Dirección Frecuente</th>
              <th>Viajes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
              <td><strong>#{{ cliente.id }}</strong></td>
              <td>
                <div class="fw-500">{{ cliente.nombre }}</div>
                <div class="text-xs text-muted">{{ cliente.email }}</div>
              </td>
              <td>{{ cliente.telefono }}</td>
              <td>
                <div>{{ cliente.direccion }}</div>
                <div class="text-xs text-muted" v-if="cliente.referencia">Ref: {{ cliente.referencia }}</div>
              </td>
              <td>
                <span class="badge badge-success">{{ cliente.viajes }}</span>
              </td>
              <td>
                <div class="actions-group">
                  <button 
                    :class="['btn', 'btn-whatsapp', { 'btn-copiado': copiadoId === cliente.id }]" 
                    @click="copiarWhatsApp(cliente)"
                    title="Copiar datos para enviar a conductor">
                    {{ copiadoId === cliente.id ? '✔' : '📲' }}
                  </button>

                  <button class="btn btn-outline btn-edit" @click="editarCliente(cliente)" title="Editar Cliente">
                    ✏️
                  </button>

                  <button class="btn btn-outline btn-delete" @click="eliminarCliente(cliente.id)" title="Eliminar Cliente">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="clientesFiltrados.length === 0">
              <td colspan="6" class="text-center" style="padding: 30px; color: #64748b;">
                {{ clientes.length === 0 ? 'No hay clientes registrados. ¡Importa tu base de datos!' : 'No se encontraron resultados para la búsqueda.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VENTANA MODAL (Omitida visualmente en resumen para no hacer largo el texto, pero el código está completo abajo) -->
    <div class="modal-overlay" v-if="mostrarModal" @click.self="cerrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modoEdicion ? '✏️ Editar Cliente' : '➕ Registrar Nuevo Cliente' }}</h3>
          <button class="close-btn" @click="cerrarModal">✖</button>
        </div>
        
        <form @submit.prevent="guardarCliente">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre Completo *</label>
              <input type="text" id="nombre" v-model="formCliente.nombre" required placeholder="Ej. Luis Ramírez" />
            </div>
            
            <div class="form-group">
              <label for="telefono">Teléfono / Celular *</label>
              <input type="tel" id="telefono" v-model="formCliente.telefono" required placeholder="Ej. 0991234567" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" v-model="formCliente.email" placeholder="Ej. luis.ramirez@gmail.com" />
          </div>

          <div class="form-group">
            <label for="direccion">Dirección Habitual / Frecuente *</label>
            <input type="text" id="direccion" v-model="formCliente.direccion" required placeholder="Ej. Av. 9 de Octubre y P. Carbo" />
          </div>

          <div class="form-group">
            <label for="referencia">Referencias de Ubicación</label>
            <input type="text" id="referencia" v-model="formCliente.referencia" placeholder="Ej. Casa de dos pisos blanca, junto a la farmacia" />
          </div>

          <div class="form-group">
            <label for="novedades">Información Adicional / Novedades</label>
            <textarea 
              id="novedades" 
              v-model="formCliente.novedades" 
              rows="2" 
              placeholder="Ej. Requiere factura física, viaja con mascota, etc.">
            </textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              {{ modoEdicion ? 'Actualizar Cliente' : 'Guardar Cliente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Clientes',
  data() {
    return {
      rolUsuario: 'admin',
      mostrarModal: false,
      modoEdicion: false,
      clienteIdAEditar: null,
      copiadoId: null,
      busqueda: '', 
      
      formCliente: { 
        nombre: '', telefono: '', email: '', direccion: '', referencia: '', novedades: '' 
      },
      
      clientes: [
        { id: 1001, nombre: 'María González', telefono: '0987654321', email: 'maria.g@hotmail.com', direccion: 'Ciudadela Las Brisas Mz 4', referencia: 'Frente al parque infantil', novedades: 'Viaja con un perro pequeño', viajes: 15, activo: true },
        { id: 1002, nombre: 'Juan Pérez', telefono: '0912345678', email: 'jperez@gmail.com', direccion: 'Calle Sucre y Bolívar', referencia: 'Edificio Los Álamos, Piso 2', novedades: 'Solo acepta unidades con aire acondicionado', viajes: 3, activo: true }
      ]
    };
  },
  computed: {
    clientesFiltrados() {
      const termino = this.busqueda.toLowerCase().trim();
      if (!termino) return this.clientes;
      
      return this.clientes.filter(c => 
        c.nombre.toLowerCase().includes(termino) ||
        c.telefono.includes(termino) ||
        c.email.toLowerCase().includes(termino) ||
        c.direccion.toLowerCase().includes(termino)
      );
    }
  },
  methods: {
    abrirModalNuevo() { this.modoEdicion = false; this.clienteIdAEditar = null; this.formCliente = { nombre: '', telefono: '', email: '', direccion: '', referencia: '', novedades: '' }; this.mostrarModal = true; },
    editarCliente(cliente) { this.modoEdicion = true; this.clienteIdAEditar = cliente.id; this.formCliente = { ...cliente }; this.mostrarModal = true; },
    eliminarCliente(id) {
      if (this.rolUsuario !== 'admin') { alert('Acceso Denegado.'); return; }
      if (confirm('¿Estás seguro de que deseas eliminar este cliente definitivamente?')) { this.clientes = this.clientes.filter(c => c.id !== id); }
    },
    cerrarModal() { this.mostrarModal = false; },
    guardarCliente() {
      if (this.modoEdicion) {
        const index = this.clientes.findIndex(c => c.id === this.clienteIdAEditar);
        if (index !== -1) { this.clientes[index] = { ...this.clientes[index], ...this.formCliente }; }
      } else {
        const nuevoId = this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1001;
        this.clientes.push({ id: nuevoId, ...this.formCliente, email: this.formCliente.email || 'No registrado', referencia: this.formCliente.referencia || 'Sin referencias', novedades: this.formCliente.novedades || 'Ninguna', viajes: 0, activo: true });
      }
      this.cerrarModal();
    },
    copiarWhatsApp(cliente) {
      let mensaje = `🚕 *TRANSNEWFASTCAR - ASIGNACIÓN*\n\n👤 *Cliente:* ${cliente.nombre}\n📞 *Teléfono:* ${cliente.telefono}\n📍 *Dirección:* ${cliente.direccion}\n📝 *Ref:* ${cliente.referencia || 'N/A'}\n`;
      if (cliente.novedades && cliente.novedades !== 'Ninguna') mensaje += `⚠️ *Nota:* ${cliente.novedades}\n`;
      navigator.clipboard.writeText(mensaje).then(() => { this.copiadoId = cliente.id; setTimeout(() => { if (this.copiadoId === cliente.id) this.copiadoId = null; }, 2000); });
    },
    
    // --- LECTOR INTELIGENTE DE CSV PARA IMPORTAR ---
    parseCSVLine(text) {
      let result = [], current = '', inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char === '"' && text[i+1] === '"') { current += '"'; i++; } // Maneja comillas dobles
        else if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += char; }
      }
      result.push(current);
      return result;
    },
    importarExcel(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lineas = text.split('\n');
        let importados = 0;
        
        for (let i = 1; i < lineas.length; i++) {
          if (!lineas[i].trim()) continue;
          
          const valores = this.parseCSVLine(lineas[i]);
          if (valores.length >= 2) {
            // Genera nuevo ID automáticamente para que no choque con los existentes
            const nuevoId = this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1001;
            
            // Limpiamos los datos de fórmulas de Excel y comillas
            const limpiarTexto = (val) => val ? val.replace(/^="?|"?$/g, '').trim() : '';

            this.clientes.push({
              id: nuevoId,
              nombre: limpiarTexto(valores[1]) || 'Sin Nombre',
              telefono: limpiarTexto(valores[2]) || '',
              email: limpiarTexto(valores[3]) || '',
              direccion: limpiarTexto(valores[4]) || '',
              referencia: limpiarTexto(valores[5]) || '',
              novedades: limpiarTexto(valores[6]) || '',
              viajes: parseInt(limpiarTexto(valores[7])) || 0,
              activo: true
            });
            importados++;
          }
        }
        alert(`✅ ¡Proceso exitoso! Se importaron ${importados} clientes a tu directorio.`);
        event.target.value = ''; // Resetea el botón de archivo
      };
      reader.readAsText(file);
    },

    exportarExcel() {
      const cabeceras = ['ID', 'Nombre', 'Teléfono', 'Email', 'Dirección', 'Referencia', 'Novedades', 'Viajes Realizados'];
      const filas = this.clientes.map(c => [
        c.id, `"${c.nombre}"`, `="${c.telefono}"`, `"${c.email}"`, `"${c.direccion}"`, `"${c.referencia}"`, `"${c.novedades}"`, c.viajes
      ]);
      const contenidoCSV = [cabeceras.join(','), ...filas.map(fila => fila.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
      const enlaceDescarga = document.createElement('a');
      enlaceDescarga.href = URL.createObjectURL(blob);
      enlaceDescarga.setAttribute('download', `Transnewfast_Clientes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      document.body.removeChild(enlaceDescarga);
    },
    
    descargarPlantilla() {
      const cabeceras = 'ID,Nombre,Teléfono,Email,Dirección,Referencia,Novedades,Viajes Realizados\n';
      const filaEjemplo = '"(Automático)","Ejemplo Carlos Mendoza","="0991234567"","carlos@email.com","Av. Las Palmeras","Casa azul","Ninguna",0\n';
      const blob = new Blob(['\uFEFF' + cabeceras + filaEjemplo], { type: 'text/csv;charset=utf-8;' });
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.setAttribute('download', 'Plantilla_Clientes.csv');
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    }
  }
};
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;}
.header-section h2 { font-size: 1.25rem; color: #0f172a; margin: 0;}

/* Nuevo contenedor para agrupar los botones superiores */
.header-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

.search-bar-container { padding: 16px; margin-bottom: 20px; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 14px; font-size: 1rem; }
.search-input-wrapper input { width: 100%; box-sizing: border-box; padding: 12px 16px 12px 42px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none; background-color: #f8fafc; color: #1e293b; transition: all 0.2s; }
.search-input-wrapper input:focus { border-color: #3b82f6; background-color: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.clear-search { position: absolute; right: 14px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; }
.clear-search:hover { color: #ef4444; }

.card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; }
.table-container { padding: 0; overflow: hidden; }
.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { background-color: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; }
td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; vertical-align: middle; }
.text-center { text-align: center; }
.fw-500 { font-weight: 500; }
.text-xs { font-size: 0.8rem; }
.text-muted { color: #64748b; }

.badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.badge-success { background: #dcfce7; color: #166534; }

.actions-group { display: flex; gap: 6px; align-items: center; }

.btn { padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;}
.btn-primary { background-color: #3b82f6; color: white; padding: 8px 16px; }
.btn-primary:hover { background-color: #2563eb; transform: translateY(-1px); }

/* Estilo para los botones de Importar y Exportar */
.btn-success { background-color: #10b981; color: white; padding: 8px 16px; }
.btn-success:hover { background-color: #059669; transform: translateY(-1px); }
.btn-warning { background-color: #f59e0b; color: white; padding: 8px 16px; }
.btn-warning:hover { background-color: #d97706; transform: translateY(-1px); }

.btn-whatsapp { background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 1rem; }
.btn-whatsapp:hover { background-color: #10b981; color: white; border-color: #10b981; }
.btn-copiado { background-color: #059669 !important; color: white !important; border-color: #059669 !important; }

.btn-outline { background-color: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 8px 16px; }
.btn-outline:hover { background: #f1f5f9;}
.btn-edit { padding: 6px 10px; font-size: 1rem; }
.btn-edit:hover { border-color: #3b82f6; color: #3b82f6; background-color: #eff6ff; }
.btn-delete { padding: 6px 10px; font-size: 1rem; }
.btn-delete:hover { border-color: #ef4444; color: #ef4444; background-color: #fef2f2; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background: white; width: 100%; max-width: 550px; border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s ease-out; max-height: 90vh; overflow-y: auto; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
.modal-header h3 { color: #0f172a; font-size: 1.25rem; margin: 0; }
.close-btn { background: transparent; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
.close-btn:hover { color: #ef4444; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: #1e293b; outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit; background-color: white;}
.form-group textarea { resize: vertical; min-height: 60px; }
.form-group input:focus, .form-group textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
</style>