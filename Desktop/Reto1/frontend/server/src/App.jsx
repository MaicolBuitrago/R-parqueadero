import React, { useState, useEffect } from 'react';
import VehiculoForm from './components/VehiculoForm';
import VehiculosTable from './components/VehiculosTable';
import VehiculoStatus from './components/VehiculoStatus';
import './App.css';

const API_URL = 'http://localhost:4000/api';

function App() {
  const [vehiculos, setVehiculos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('table');

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando datos desde:', API_URL);
      
      // Cargar vehículos
      console.log('Solicitando vehículos...');
      const vehiculosRes = await fetch(`${API_URL}/vehiculos`);
      console.log('Respuesta vehículos:', vehiculosRes.status);
      
      if (!vehiculosRes.ok) {
        throw new Error(`Error HTTP: ${vehiculosRes.status}`);
      }
      
      const vehiculosData = await vehiculosRes.json();
      console.log('Datos de vehículos recibidos:', vehiculosData);
      setVehiculos(Array.isArray(vehiculosData) ? vehiculosData : []);

      // Cargar tipos
      console.log('Solicitando tipos...');
      const tiposRes = await fetch(`${API_URL}/tipos`);
      console.log('Respuesta tipos:', tiposRes.status);
      
      if (!tiposRes.ok) {
        throw new Error(`Error HTTP: ${tiposRes.status}`);
      }
      
      const tiposData = await tiposRes.json();
      console.log('Datos de tipos recibidos:', tiposData);
      setTipos(Array.isArray(tiposData) ? tiposData : []);

      // Cargar estados
      console.log('Solicitando estados...');
      const estadosRes = await fetch(`${API_URL}/estados`);
      console.log('Respuesta estados:', estadosRes.status);
      
      if (!estadosRes.ok) {
        throw new Error(`Error HTTP: ${estadosRes.status}`);
      }
      
      const estadosData = await estadosRes.json();
      console.log('Datos de estados recibidos:', estadosData);
      
      // Asegurar que siempre tengamos los 2 estados básicos
      const estadosBasicos = [
        { id_estado: 1, descripcion: 'Adentro' },
        { id_estado: 2, descripcion: 'Afuera' }
      ];
      
      // Si el backend devuelve estados, usarlos, sino usar los básicos
      if (Array.isArray(estadosData) && estadosData.length > 0) {
        // Verificar que tengamos los estados correctos
        const estadosFinales = [...estadosBasicos];
        estadosData.forEach(estado => {
          if (!estadosFinales.find(e => e.id_estado === estado.id_estado)) {
            estadosFinales.push(estado);
          }
        });
        setEstados(estadosFinales);
      } else {
        setEstados(estadosBasicos);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError(`Error de conexión: ${error.message}`);
      
      // Datos de prueba en caso de error
      setVehiculos([]);
      setTipos([
        { id_tipo: 1, descripcion: 'Automóvil' },
        { id_tipo: 2, descripcion: 'Camioneta' },
        { id_tipo: 3, descripcion: 'Motocicleta' },
        { id_tipo: 4, descripcion: 'Camión' }
      ]);
      setEstados([
        { id_estado: 1, descripcion: 'Adentro' },
        { id_estado: 2, descripcion: 'Afuera' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehiculo = async (vehiculoData) => {
    try {
      console.log('Enviando datos para nuevo vehículo:', vehiculoData);
      
      // El backend espera: { placa, id_tipo, propietario }
      const datosParaEnviar = {
        placa: vehiculoData.placa,
        id_tipo: vehiculoData.id_tipo,
        propietario: vehiculoData.propietario
        // NO enviamos id_estado - el backend lo pone como "Adentro" automáticamente
      };

      const response = await fetch(`${API_URL}/vehiculos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaEnviar),
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (response.ok) {
        await fetchData();
        setActiveView('table');
        alert(`✅ Vehículo ${vehiculoData.placa} registrado exitosamente\nEstado: Adentro`);
      } else {
        alert(`❌ Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      alert('⚠️ Error de conexión al registrar el vehículo');
    }
  };

  const handleUpdateEstado = async (placa, nuevoEstadoId) => {
    try {
      // Si la placa viene con formato placa:id, extraer solo la placa
      const placaLimpia = placa.includes(':') ? placa.split(':')[0] : placa;
      
      console.log(`Actualizando estado de ${placaLimpia} a:`, nuevoEstadoId);
      
      const response = await fetch(`${API_URL}/vehiculos/${placaLimpia}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_estado: nuevoEstadoId })
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (response.ok) {
        await fetchData();
        const estadoTexto = nuevoEstadoId === 1 ? 'entró' : 'salió';
        alert(`✅ Vehículo ${placaLimpia} ${estadoTexto} exitosamente`);
      } else {
        alert(`❌ Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('⚠️ Error de conexión al actualizar el estado');
    }
  };

  const handleNuevaEntrada = async (vehiculoData) => {
    try {
      console.log('Creando nuevo registro de entrada:', vehiculoData);
      
      // Para nueva entrada, usamos el mismo endpoint que para crear vehículo
      const datosParaEnviar = {
        placa: vehiculoData.placa.toUpperCase(),
        id_tipo: parseInt(vehiculoData.id_tipo),
        propietario: vehiculoData.propietario.trim()
      };

      // Verificar si ya existe un vehículo con la misma placa y está Adentro
      const vehiculoExistenteAdentro = vehiculos.find(v => 
        v.placa === datosParaEnviar.placa && v.id_estado === 1
      );
      
      if (vehiculoExistenteAdentro) {
        alert(`⚠️ El vehículo ${datosParaEnviar.placa} ya está registrado como "Adentro".`);
        return;
      }

      const response = await fetch(`${API_URL}/vehiculos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaEnviar),
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (response.ok) {
        await fetchData();
        alert(`✅ Nuevo registro creado: ${datosParaEnviar.placa}\nEstado: Adentro`);
      } else {
        alert(`❌ Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al crear nuevo registro:', error);
      alert('⚠️ Error de conexión al crear nuevo registro');
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos del sistema...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🏢 Sistema de Gestión de Vehículos</h1>
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={handleRetry} className="btn-retry">
              🔄 Reintentar
            </button>
          </div>
        )}
        <nav className="app-nav">
          <button 
            className={`nav-btn ${activeView === 'table' ? 'active' : ''}`}
            onClick={() => setActiveView('table')}
          >
            📋 Lista de Vehículos ({vehiculos.length})
          </button>
          <button 
            className={`nav-btn ${activeView === 'form' ? 'active' : ''}`}
            onClick={() => setActiveView('form')}
          >
            ➕ Registrar Vehículo
          </button>
          <button 
            className={`nav-btn ${activeView === 'status' ? 'active' : ''}`}
            onClick={() => setActiveView('status')}
          >
            🔄 Gestión Entradas/Salidas
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeView === 'table' && (
          <VehiculosTable 
            vehiculos={vehiculos} 
            tipos={tipos}
            estados={estados}
            onRefresh={fetchData}
            onUpdateEstado={handleUpdateEstado}
          />
        )}
        
        {activeView === 'form' && (
          <VehiculoForm 
            tipos={tipos}
            onSubmit={handleCreateVehiculo}
            onCancel={() => setActiveView('table')}
          />
        )}
        
        {activeView === 'status' && (
          <VehiculoStatus 
            vehiculos={vehiculos}
            tipos={tipos}
            estados={estados}
            onUpdateEstado={handleUpdateEstado}
            onCreateVehiculo={handleNuevaEntrada}
          />
        )}
      </main>
    </div>
  );
}

export default App;