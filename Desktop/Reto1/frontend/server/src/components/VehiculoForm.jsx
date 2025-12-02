import React, { useState } from 'react';
import './VehiculoForm.css';

function VehiculoForm({ tipos, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    placa: '',
    id_tipo: '',
    propietario: ''
    // NOTA: No incluimos id_estado porque siempre será "Adentro" (id: 1)
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es requerida';
    } else if (formData.placa.trim().length < 3) {
      newErrors.placa = 'La placa debe tener al menos 3 caracteres';
    }
    
    if (!formData.id_tipo) {
      newErrors.id_tipo = 'Seleccione un tipo de vehículo';
    }
    
    if (!formData.propietario.trim()) {
      newErrors.propietario = 'El propietario es requerido';
    } else if (formData.propietario.trim().length < 3) {
      newErrors.propietario = 'El nombre debe tener al menos 3 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const datosEnviar = {
      placa: formData.placa.trim().toUpperCase(),
      id_tipo: parseInt(formData.id_tipo),
      propietario: formData.propietario.trim()
      // NO enviamos id_estado - el backend lo pondrá como "Adentro" automáticamente
    };

    onSubmit(datosEnviar);
    
    // Resetear formulario
    setFormData({
      placa: '',
      id_tipo: '',
      propietario: ''
    });
    setErrors({});
  };

  return (
    <div className="vehiculo-form-container">
      <h2>📝 Registrar Nuevo Vehículo</h2>
      <p className="form-subtitle">
        <span className="info-icon">ℹ️</span> 
        Todos los vehículos se registran automáticamente como <strong>"Adentro"</strong>
      </p>
      
      <form onSubmit={handleSubmit} className="vehiculo-form">
        <div className="form-group">
          <label htmlFor="placa">
            Placa <span className="required">*</span>
          </label>
          <input
            type="text"
            id="placa"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            placeholder="Ej: ABC123, XYZ789"
            maxLength="10"
            className={errors.placa ? 'input-error' : ''}
          />
          {errors.placa && <span className="error-message">{errors.placa}</span>}
          <div className="input-hint">Máx. 10 caracteres</div>
        </div>

        <div className="form-group">
          <label htmlFor="id_tipo">
            Tipo de Vehículo <span className="required">*</span>
          </label>
          <select
            id="id_tipo"
            name="id_tipo"
            value={formData.id_tipo}
            onChange={handleChange}
            className={errors.id_tipo ? 'input-error' : ''}
          >
            <option value="">-- Seleccione un tipo --</option>
            {tipos.map(tipo => (
              <option key={tipo.id_tipo} value={tipo.id_tipo}>
                {tipo.descripcion}
              </option>
            ))}
          </select>
          {errors.id_tipo && <span className="error-message">{errors.id_tipo}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="propietario">
            Propietario <span className="required">*</span>
          </label>
          <input
            type="text"
            id="propietario"
            name="propietario"
            value={formData.propietario}
            onChange={handleChange}
            placeholder="Nombre completo del propietario"
            maxLength="100"
            className={errors.propietario ? 'input-error' : ''}
          />
          {errors.propietario && <span className="error-message">{errors.propietario}</span>}
          <div className="input-hint">Nombre completo del dueño del vehículo</div>
        </div>

        <div className="form-info">
          <div className="info-card">
            <div className="info-header">
              <span className="info-icon">📝</span>
              <strong>Información del registro:</strong>
            </div>
            <ul className="info-list">
              <li>✅ Estado inicial: <strong>Adentro</strong></li>
              <li>⏰ Fecha de ingreso: <strong>Automática (ahora)</strong></li>
              <li>📅 Fecha de salida: <strong>Se registrará al salir</strong></li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            <span className="btn-icon">✅</span>
            Registrar Vehículo
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-cancel"
          >
            <span className="btn-icon">❌</span>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default VehiculoForm;