require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas - CORREGIR LA RUTA
const vehiculosRoutes = require('../routes/vehiculosRoutes');

// Usar rutas
app.use('/api', vehiculosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Gestión de Vehículos',
        endpoints: {
            vehiculos: '/api/vehiculos',
            tipos: '/api/tipos',
            estados: '/api/estados'
        }
    });
});

// Middleware para manejar errores 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('\n📋 Endpoints disponibles:');
    console.log(`   GET  /api/vehiculos     - Obtener todos los vehículos`);
    console.log(`   GET  /api/vehiculos/:placa - Obtener un vehículo por placa`);
    console.log(`   POST /api/vehiculos     - Crear nuevo vehículo`);
    console.log(`   PUT  /api/vehiculos/:placa - Actualizar vehículo`);
    console.log(`   DELETE /api/vehiculos/:placa - Eliminar vehículo`);
    console.log(`   GET  /api/tipos         - Obtener tipos de vehículo`);
    console.log(`   GET  /api/estados       - Obtener estados de vehículo`);
});