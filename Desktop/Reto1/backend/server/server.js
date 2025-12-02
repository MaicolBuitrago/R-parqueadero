import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import vehiculosRoutes from '../routes/vehiculosRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true  
}));

app.use(express.json());


app.use('/api', vehiculosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Backend Parqueadero funcionando",
    timestamp: new Date().toISOString(),
    project: "R-parqueadero",
    frontend: "https://parqueadero-r.netlify.app"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
==========================================
✅ Servidor Parqueadero funcionando
📍 Puerto: ${PORT}
🌐 Local: http://localhost:${PORT}
🚀 Render: https://r-parqueadero.onrender.com
📱 Frontend: https://parqueadero-r.netlify.app
==========================================
  `);
});