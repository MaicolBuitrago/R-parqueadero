import React, { useState, useEffect } from 'react';
import './VehiculoStatus.css';

function VehiculoStatus({ vehiculos, tipos, estados, onUpdateEstado, onCreateVehiculo }) {
  const [selectedPlaca, setSelectedPlaca] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [modo, setModo] = useState('salida'); // 'salida' o 'nuevo'
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    placa: '',
    id_tipo: '',
    propietario: ''
  });

  // Vehículos que están "Adentro" y pueden salir
  const vehiculosAdentro = vehiculos.filter(v => v.id_estado === 1);
  
  // Vehículos que están "Afuera"
  const vehiculosAfuera = vehiculos.filter(v => v.id_estado === 2);

  useEffect(() => {
    if (selectedPlaca) {
      // Limpiar la placa primero (en caso de que venga con formato placa:id)
      const placaLimpia = selectedPlaca.includes(':') 
        ? selectedPlaca.split(':')[0] 
        : selectedPlaca;
      
      const vehiculo = vehiculos.find(v => v.placa === placaLimpia);
      setVehiculoSeleccionado(vehiculo);
      
      // Si el vehículo está afuera, cambiar a modo "nuevo registro"
      if (vehiculo && vehiculo.id_estado === 2) {
        setModo('nuevo');
        setNuevoVehiculo({
          placa: vehiculo.placa,
          id_tipo: vehiculo.id_tipo.toString(),
          propietario: vehiculo.propietario
        });
      } else {
        setModo('salida');
        setSelectedEstado('2'); // Por defecto cambiar a Afuera
      }
    }
  }, [selectedPlaca, vehiculos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modo === 'salida') {
      // Registrar salida de vehículo existente
      if (!selectedPlaca) {
        alert('Por favor seleccione un vehículo');
        return;
      }
      
      // Asegurarse de usar solo la placa (sin :id)
      const placaParaEnviar = selectedPlaca.includes(':') 
        ? selectedPlaca.split(':')[0] 
        : selectedPlaca;
      
      onUpdateEstado(placaParaEnviar, 2); // Cambiar a Afuera
      setSelectedPlaca('');
      setVehiculoSeleccionado(null);
    } else {
      // Crear nuevo registro (nueva entrada)
      if (!nuevoVehiculo.placa || !nuevoVehiculo.id_tipo || !nuevoVehiculo.propietario) {
        alert('Por favor complete todos los campos del nuevo registro');
        return;
      }
      
      // Verificar si la placa ya existe y está Adentro
      const vehiculoExistente = vehiculos.find(v => 
        v.placa === nuevoVehiculo.placa.toUpperCase() && v.id_estado === 1
      );
      
      if (vehiculoExistente) {
        alert(`⚠️ El vehículo ${nuevoVehiculo.placa} ya está registrado como "Adentro".`);
        return;
      }
      
      onCreateVehiculo(nuevoVehiculo);
      setNuevoVehiculo({
        placa: '',
        id_tipo: '',
        propietario: ''
      });
      setModo('salida');
      setSelectedPlaca('');
    }
  };

  const handleNuevoVehiculoChange = (e) => {
    const { name, value } = e.target;
    setNuevoVehiculo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setSelectedPlaca('');
    setSelectedEstado('');
    setVehiculoSeleccionado(null);
    setModo('salida');
    setNuevoVehiculo({
      placa: '',
      id_tipo: '',
      propietario: ''
    });
  };

  const handleSelectChange = (e) => {
    const valor = e.target.value;
    // Limpiar la placa si viene con formato placa:id
    const placaLimpia = valor.includes(':') ? valor.split(':')[0] : valor;
    setSelectedPlaca(placaLimpia);
  };

  return (
    <div className="status-container">
      <h2>🚗 Gestión de Entradas y Salidas</h2>
      
      <div className="status-tabs">
        <button 
          className={`tab-btn ${modo === 'salida' ? 'active' : ''}`}
          onClick={() => setModo('salida')}
        >
          🚪 Registrar Salida
        </button>
        <button 
          className={`tab-btn ${modo === 'nuevo' ? 'active' : ''}`}
          onClick={() => setModo('nuevo')}
        >
          🚗 Nueva Entrada
        </button>
      </div>

      {modo === 'salida' ? (
        <>
          <div className="status-info">
            <p><strong>Registrar Salida:</strong> Seleccione un vehículo que está actualmente <span className="estado-adentro-text">ADENTRO</span> para registrar su salida.</p>
            <p>Vehículos disponibles para salida: <strong>{vehiculosAdentro.length}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="status-form">
            <div className="form-group">
              <label htmlFor="vehiculo">Seleccionar Vehículo *</label>
              <select
                id="vehiculo"
                value={selectedPlaca}
                onChange={handleSelectChange}
                required
                disabled={vehiculosAdentro.length === 0}
              >
                <option value="">
                  {vehiculosAdentro.length === 0 ? 'No hay vehículos adentro' : 'Seleccione un vehículo'}
                </option>
                {vehiculosAdentro.map(vehiculo => (
                  <option key={vehiculo.placa} value={vehiculo.placa}>
                    {vehiculo.placa} - {vehiculo.propietario} ({vehiculo.tipo_vehiculo?.descripcion || 'Sin tipo'})
                  </option>
                ))}
              </select>
              
              {selectedPlaca && vehiculoSeleccionado && (
                <div className="vehiculo-info">
                  <div className="info-row">
                    <span className="info-label">Propietario:</span>
                    <span className="info-value">{vehiculoSeleccionado.propietario}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tipo:</span>
                    <span className="info-value">{vehiculoSeleccionado.tipo_vehiculo?.descripcion || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ingreso:</span>
                    <span className="info-value">
                      {new Date(vehiculoSeleccionado.fecha_ingreso).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Nuevo Estado</label>
              <div className="estado-display">
                <span className="estado-actual">
                  Estado actual: <strong className="estado-adentro-text">ADENTRO</strong>
                </span>
                <span className="estado-flecha">→</span>
                <span className="estado-nuevo">
                  Nuevo estado: <strong className="estado-afuera-text">AFUERA</strong>
                </span>
              </div>
              <p className="estado-descripcion">
                Al confirmar, se registrará la fecha y hora de salida.
              </p>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit btn-salida"
                disabled={!selectedPlaca || vehiculosAdentro.length === 0}
              >
                🚪 Registrar Salida
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-cancel"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>

          {vehiculosAfuera.length > 0 && (
            <div className="vehiculos-afuera">
              <h3>🚪 Vehículos Afuera ({vehiculosAfuera.length})</h3>
              <p>Estos vehículos ya registraron su salida. Para una nueva entrada, use "Nueva Entrada".</p>
              <div className="afuera-list">
                {vehiculosAfuera.slice(0, 5).map(vehiculo => (
                  <div key={vehiculo.placa} className="afuera-item">
                    <span className="placa">{vehiculo.placa}</span>
                    <span className="propietario">{vehiculo.propietario}</span>
                    <span className="fecha-salida">
                      {new Date(vehiculo.fecha_salida).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {vehiculosAfuera.length > 5 && (
                  <div className="afuera-more">
                    +{vehiculosAfuera.length - 5} más...
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="status-info">
            <p><strong>Nueva Entrada:</strong> Registre la entrada de un vehículo. Si el vehículo ya existe pero está "Afuera", se creará un nuevo registro de entrada.</p>
            <p className="info-note">💡 <strong>Nota:</strong> Cada entrada crea un nuevo registro independiente.</p>
          </div>

          <form onSubmit={handleSubmit} className="status-form">
            <div className="form-group">
              <label htmlFor="nuevaPlaca">Placa del Vehículo *</label>
              <input
                type="text"
                id="nuevaPlaca"
                name="placa"
                value={nuevoVehiculo.placa}
                onChange={handleNuevoVehiculoChange}
                placeholder="Ej: ABC123"
                required
                className="input-placa"
              />
              
              {/* Mostrar información si la placa ya existe */}
              {nuevoVehiculo.placa && (
                <div className="placa-info">
                  {(() => {
                    const vehiculoExistente = vehiculos.find(v => 
                      v.placa === nuevoVehiculo.placa.toUpperCase()
                    );
                    
                    if (!vehiculoExistente) {
                      return (
                        <div className="info-nueva">
                          ✅ Esta placa no está registrada. Se creará nuevo vehículo.
                        </div>
                      );
                    } else if (vehiculoExistente.id_estado === 1) {
                      return (
                        <div className="info-advertencia">
                          ⚠️ Este vehículo ya está <strong>ADENTRO</strong>. No se puede registrar nueva entrada.
                        </div>
                      );
                    } else {
                      return (
                        <div className="info-existente">
                          🔄 Vehículo existente que está <strong>AFUERA</strong>. Se creará nuevo registro de entrada.
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="nuevoTipo">Tipo de Vehículo *</label>
              <select
                id="nuevoTipo"
                name="id_tipo"
                value={nuevoVehiculo.id_tipo}
                onChange={handleNuevoVehiculoChange}
                required
              >
                <option value="">Seleccione tipo</option>
                {tipos.map(tipo => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nuevoPropietario">Propietario *</label>
              <input
                type="text"
                id="nuevoPropietario"
                name="propietario"
                value={nuevoVehiculo.propietario}
                onChange={handleNuevoVehiculoChange}
                placeholder="Nombre del propietario"
                required
              />
            </div>

            <div className="form-info">
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">📝</span>
                  <strong>Información del registro:</strong>
                </div>
                <ul className="info-list">
                  <li>✅ Se creará <strong>nuevo registro</strong> de entrada</li>
                  <li>⏰ Fecha de ingreso: <strong>Actual</strong></li>
                  <li>📊 Estado inicial: <strong className="estado-adentro-text">ADENTRO</strong></li>
                  {selectedPlaca && vehiculoSeleccionado && (
                    <li>🔄 Vehículo anterior: <strong>{vehiculoSeleccionado.placa}</strong> (Afuera desde {new Date(vehiculoSeleccionado.fecha_salida).toLocaleDateString()})</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit btn-entrada"
              >
                🚗 Registrar Nueva Entrada
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setModo('salida');
                  setNuevoVehiculo({
                    placa: '',
                    id_tipo: '',
                    propietario: ''
                  });
                }}
                className="btn-cancel"
              >
                ← Volver a Salidas
              </button>
            </div>
          </form>
        </>
      )}

      <div className="status-note">
        <p>📋 <strong>Flujo del sistema:</strong></p>
        <ol className="flujo-lista">
          <li>1. Vehículo <strong>entra</strong> → Nuevo registro "Adentro"</li>
          <li>2. Vehículo <strong>sale</strong> → Se marca como "Afuera" con fecha de salida</li>
          <li>3. Vehículo <strong>vuelve a entrar</strong> → Nuevo registro independiente</li>
        </ol>
        <p className="nota-importante">
          ⚠️ <strong>Importante:</strong> Cada entrada/salida es un registro histórico independiente.
        </p>
      </div>
    </div>
  );
}

export default VehiculoStatus;