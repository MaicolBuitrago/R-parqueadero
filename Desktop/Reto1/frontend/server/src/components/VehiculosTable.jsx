import React, { useState } from 'react';
import './VehiculosTable.css';

function VehiculosTable({ vehiculos, tipos, estados, onRefresh, onUpdateEstado }) {
  const [filterEstado, setFilterEstado] = useState('');

  // Función para obtener nombre del tipo por ID
  const getTipoNombre = (idTipo) => {
    const tipo = tipos.find(t => t.id_tipo === idTipo);
    return tipo ? tipo.descripcion : 'Desconocido';
  };

  // Función para obtener nombre del estado por ID
  const getEstadoNombre = (idEstado) => {
    const estado = estados.find(e => e.id_estado === idEstado);
    return estado ? estado.descripcion : 'Desconocido';
  };

  // Función para formatear fecha
  const formatFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formato corto para fecha de salida (solo fecha)
  const formatFechaSalida = (fechaString) => {
    if (!fechaString) return '--';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtrar vehículos
  const filteredVehiculos = filterEstado 
    ? vehiculos.filter(v => v.id_estado === parseInt(filterEstado))
    : vehiculos;

  const handleCambiarEstado = (vehiculo) => {
    // Solo permitir cambiar si el vehículo está "Adentro" (estado 1)
    if (vehiculo.id_estado === 1) {
      const confirmar = window.confirm(
        `¿Registrar salida del vehículo ${vehiculo.placa}?\n` +
        `Propietario: ${vehiculo.propietario}\n` +
        `Ingreso: ${formatFecha(vehiculo.fecha_ingreso)}`
      );
      
      if (confirmar) {
        onUpdateEstado(vehiculo.placa, 2); // Cambiar a Afuera
      }
    }
  };

  const getEstadoClass = (idEstado) => {
    switch(idEstado) {
      case 1: return 'estado-adentro';
      case 2: return 'estado-afuera';
      default: return '';
    }
  };

  // Contadores para el footer
  const vehiculosAdentro = vehiculos.filter(v => v.id_estado === 1).length;
  const vehiculosAfuera = vehiculos.filter(v => v.id_estado === 2).length;

  return (
    <div className="vehiculos-table-container">
      <div className="table-header">
        <h2>🚗 Lista de Vehículos</h2>
        <div className="header-controls">
          <div className="filter-group">
            <label>Filtrar por estado:</label>
            <select 
              value={filterEstado} 
              onChange={(e) => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos ({vehiculos.length})</option>
              {estados.map(estado => (
                <option key={estado.id_estado} value={estado.id_estado}>
                  {estado.descripcion} (
                    {estado.id_estado === 1 ? vehiculosAdentro : 
                     estado.id_estado === 2 ? vehiculosAfuera : 0}
                  )
                </option>
              ))}
            </select>
          </div>
          <button onClick={onRefresh} className="btn-refresh">
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card adentro">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-number">{vehiculosAdentro}</div>
            <div className="stat-label">Adentro</div>
          </div>
        </div>
        <div className="stat-card afuera">
          <div className="stat-icon">🚪</div>
          <div className="stat-content">
            <div className="stat-number">{vehiculosAfuera}</div>
            <div className="stat-label">Afuera</div>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{vehiculos.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="vehiculos-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Propietario</th>
              <th>Fecha Ingreso</th>
              <th>Fecha Salida</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehiculos.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {filterEstado ? 
                    `No hay vehículos con el estado seleccionado` : 
                    `No hay vehículos registrados`
                  }
                </td>
              </tr>
            ) : (
              filteredVehiculos.map(vehiculo => {
                // Solo mostrar botón si está ADENTRO (estado 1)
                const mostrarBoton = vehiculo.id_estado === 1;
                const tiempoAdentro = vehiculo.id_estado === 1 ? 
                  `Desde: ${formatFecha(vehiculo.fecha_ingreso)}` : 
                  `Salió: ${formatFechaSalida(vehiculo.fecha_salida)}`;

                return (
                  // LÍNEA CORREGIDA - Usar id_vehiculo en lugar de placa
                  <tr key={vehiculo.id_vehiculo} className={vehiculo.id_estado === 2 ? 'row-afuera' : ''}>
                    <td className="placa-cell">
                      <span className="placa-badge">{vehiculo.placa}</span>
                    </td>
                    <td>{getTipoNombre(vehiculo.id_tipo)}</td>
                    <td>{vehiculo.propietario}</td>
                    <td>
                      <div className="fecha-detalle">
                        <div className="fecha-fecha">{formatFecha(vehiculo.fecha_ingreso)}</div>
                        {vehiculo.id_estado === 1 && (
                          <div className="tiempo-transcurrido">
                            {(() => {
                              const ingreso = new Date(vehiculo.fecha_ingreso);
                              const ahora = new Date();
                              const horas = Math.floor((ahora - ingreso) / (1000 * 60 * 60));
                              if (horas < 1) return 'Hace < 1 hora';
                              if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
                              const dias = Math.floor(horas / 24);
                              return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
                            })()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {vehiculo.fecha_salida ? (
                        <div className="fecha-detalle">
                          <div className="fecha-fecha">{formatFechaSalida(vehiculo.fecha_salida)}</div>
                          {vehiculo.id_estado === 2 && (
                            <div className="tiempo-transcurrido">
                              {(() => {
                                const salida = new Date(vehiculo.fecha_salida);
                                const ahora = new Date();
                                const horas = Math.floor((ahora - salida) / (1000 * 60 * 60));
                                if (horas < 1) return 'Hace < 1 hora';
                                if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
                                const dias = Math.floor(horas / 24);
                                return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="no-salida">--</span>
                      )}
                    </td>
                    <td>
                      <span className={`estado-badge ${getEstadoClass(vehiculo.id_estado)}`}>
                        {getEstadoNombre(vehiculo.id_estado)}
                        {vehiculo.id_estado === 1 ? ' 🚗' : ' 🚪'}
                      </span>
                    </td>
                    <td>
                      {mostrarBoton ? (
                        <button
                          onClick={() => handleCambiarEstado(vehiculo)}
                          className="btn-action btn-salida"
                          title={`Registrar salida de ${vehiculo.placa}`}
                        >
                          🚪 Registrar Salida
                        </button>
                      ) : (
                        <div className="acciones-afuera">
                          <span className="no-action">Histórico</span>
                          <div className="info-afuera">
                            Para nueva entrada use "Nueva Entrada"
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="footer-left">
          <p>Mostrando <strong>{filteredVehiculos.length}</strong> de <strong>{vehiculos.length}</strong> vehículos</p>
          <div className="filtro-activo">
            {filterEstado && (
              <span className="filtro-tag">
                Filtrado por: {getEstadoNombre(parseInt(filterEstado))}
                <button 
                  onClick={() => setFilterEstado('')}
                  className="btn-quitar-filtro"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
        <div className="estado-leyenda">
          <span className="leyenda-item">
            <span className="leyenda-color estado-adentro"></span> Adentro
          </span>
          <span className="leyenda-item">
            <span className="leyenda-color estado-afuera"></span> Afuera
          </span>
        </div>
      </div>

      <div className="table-instructions">
        <div className="instruction-card">
          <h4>💡 Instrucciones:</h4>
          <ul>
            <li><strong>Vehículos "Adentro"</strong>: Pueden registrar salida</li>
            <li><strong>Vehículos "Afuera"</strong>: Son registros históricos</li>
            <li><strong>Nueva entrada</strong>: Use la pestaña "Nueva Entrada"</li>
            <li><strong>Registro permanente</strong>: Cada entrada/salida se guarda</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VehiculosTable;