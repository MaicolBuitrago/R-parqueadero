require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://parqueadero-r.netlify.app'],
  credentials: true
}));
app.use(express.json());

// Importar rutas 
const vehiculosRoutes = require('../routes/vehiculosRoutes'); 

// Usar rutas
app.use('/api', vehiculosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Gestión de Vehículos - Render',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            vehiculos: '/api/vehiculos',
            tipos: '/api/tipos',
            estados: '/api/estados'
        }
    });
});

// Ruta de health check para Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'parqueadero-api',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`🌐 URL local: http://localhost:${PORT}`);
    console.log(`🌐 URL Render: https://r-parqueadero.onrender.com`);
    console.log('\n📋 Endpoints disponibles:');
    console.log(`   GET  /                    - Info de la API`);
    console.log(`   GET  /health              - Health check`);
    console.log(`   GET  /api/vehiculos       - Obtener todos los vehículos`);
    console.log(`   POST /api/vehiculos       - Crear nuevo vehículo`);
    console.log(`   PUT  /api/vehiculos/:placa/estado - Cambiar estado`);
});