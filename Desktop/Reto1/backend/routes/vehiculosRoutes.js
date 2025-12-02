const express = require('express');
const router = express.Router();
const supabase = require('../server/db');

console.log('🔄 Rutas de vehículos cargadas (2 estados: Adentro/Afuera)');

// GET todos los vehículos con información relacionada
router.get('/vehiculos', async (req, res) => {
    try {
        console.log('🔍 Obteniendo todos los vehículos...');
        
        const { data, error } = await supabase
            .from('vehiculos')
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `)
            .order('fecha_ingreso', { ascending: false });

        if (error) {
            console.error('❌ Error obteniendo vehículos:', error);
            return res.status(500).json({ 
                error: 'Error al obtener vehículos',
                details: error.message 
            });
        }

        console.log(`✅ ${data?.length || 0} vehículos encontrados`);
        res.json(data || []);
        
    } catch (error) {
        console.error('💥 Error inesperado:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
});

// GET tipos de vehículo
router.get('/tipos', async (req, res) => {
    try {
        console.log('📋 Obteniendo tipos de vehículo...');
        
        const { data, error } = await supabase
            .from('tipo_vehiculo')
            .select('*')
            .order('descripcion');

        if (error) {
            console.error('Error obteniendo tipos:', error);
            return res.status(500).json({ error: error.message });
        }
        
        console.log(`✅ ${data?.length || 0} tipos encontrados`);
        res.json(data || []);
        
    } catch (error) {
        console.error('Error en /tipos:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET estados (SOLO 2: Adentro/Afuera)
router.get('/estados', async (req, res) => {
    try {
        console.log('🔄 Obteniendo estados...');
        
        const { data, error } = await supabase
            .from('estado_vehiculo')
            .select('*')
            .order('id_estado');

        if (error) {
            console.warn('Error obteniendo estados de BD, usando por defecto:', error.message);
            // Siempre devolver los 2 estados básicos
            return res.json([
                { id_estado: 1, descripcion: 'Adentro' },
                { id_estado: 2, descripcion: 'Afuera' }
            ]);
        }

        // Si no hay datos, devolver los 2 estados básicos
        if (!data || data.length === 0) {
            console.log('⚠️  No hay estados en BD, usando por defecto');
            return res.json([
                { id_estado: 1, descripcion: 'Adentro' },
                { id_estado: 2, descripcion: 'Afuera' }
            ]);
        }

        console.log(`✅ ${data.length} estados encontrados`);
        res.json(data);
        
    } catch (error) {
        console.error('Error en /estados:', error);
        // Siempre devolver los 2 estados básicos
        res.json([
            { id_estado: 1, descripcion: 'Adentro' },
            { id_estado: 2, descripcion: 'Afuera' }
        ]);
    }
});

// POST crear nuevo vehículo (siempre entra como "Adentro")
router.post('/vehiculos', async (req, res) => {
    try {
        const { placa, id_tipo, propietario } = req.body;
        
        console.log('➕ Creando nuevo vehículo:', { placa, id_tipo, propietario });

        // Validaciones básicas
        if (!placa || !placa.trim()) {
            return res.status(400).json({ error: 'La placa es requerida' });
        }
        if (!id_tipo) {
            return res.status(400).json({ error: 'El tipo de vehículo es requerido' });
        }
        if (!propietario || !propietario.trim()) {
            return res.status(400).json({ error: 'El propietario es requerido' });
        }

        // Normalizar placa (mayúsculas, sin espacios)
        const placaNormalizada = placa.trim().toUpperCase();

        // Verificar si hay un vehículo ACTIVO con esta placa (estado = 1 "Adentro")
        const { data: vehiculoActivo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('placa', placaNormalizada)
            .eq('id_estado', 1)  // Solo buscar vehículos que estén "Adentro"
            .maybeSingle();  // Usar maybeSingle para evitar error 406

        // Si ya hay un vehículo con la misma placa ADENTRO, no permitir registrar
        if (vehiculoActivo) {
            return res.status(400).json({ 
                error: `La placa ${placaNormalizada} ya tiene un vehículo registrado adentro`,
                suggestion: 'Registre la salida del vehículo actual antes de crear uno nuevo'
            });
        }

        // Crear vehículo - SIEMPRE entra como "Adentro" (id_estado: 1)
        const nuevoVehiculo = {
            placa: placaNormalizada,
            id_tipo: parseInt(id_tipo),
            propietario: propietario.trim(),
            id_estado: 1, // SIEMPRE "Adentro" al registrar
            fecha_ingreso: new Date(),
            fecha_salida: null
        };

        const { data, error } = await supabase
            .from('vehiculos')
            .insert([nuevoVehiculo])
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `);

        if (error) {
            console.error('Error creando vehículo:', error);
            throw error;
        }
        
        console.log(`✅ Vehículo creado: ${placaNormalizada} - Estado: Adentro`);
        res.status(201).json(data[0]);
        
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        res.status(500).json({ 
            error: 'Error al crear vehículo',
            details: error.message 
        });
    }
});

// RUTAS CON id_vehiculo

// GET vehículo por ID
router.get('/vehiculos/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🔎 Buscando vehículo con ID: ${id}`);

        const { data, error } = await supabase
            .from('vehiculos')
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `)
            .eq('id_vehiculo', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        console.log(`✅ Vehículo encontrado ID ${id}: ${data.placa}`);
        res.json(data);
        
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({ 
            error: 'Error al obtener vehículo',
            details: error.message 
        });
    }
});

// PUT cambiar estado del vehículo por ID
router.put('/vehiculos/id/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_estado } = req.body;

        console.log(`🔄 Cambiando estado del vehículo ID ${id} a:`, id_estado);

        // Validar que se envió el estado
        if (id_estado === undefined) {
            return res.status(400).json({ error: 'El nuevo estado es requerido' });
        }

        // Validar que sea 1 (Adentro) o 2 (Afuera)
        const nuevoEstado = parseInt(id_estado);
        if (nuevoEstado !== 1 && nuevoEstado !== 2) {
            return res.status(400).json({ 
                error: 'Estado inválido. Use 1 para Adentro o 2 para Afuera' 
            });
        }

        // Buscar el vehículo por ID
        const { data: vehiculo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('id_vehiculo', id)
            .single();

        if (errorFind || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo no encontrado'
            });
        }

        // Preparar datos de actualización
        const updateData = { id_estado: nuevoEstado };
        
        // Lógica de fechas según cambio de estado
        if (vehiculo.id_estado === 1 && nuevoEstado === 2) {
            // De Adentro a Afuera: registrar fecha de salida
            updateData.fecha_salida = new Date();
            console.log(`🚗 ${vehiculo.placa} (ID: ${id}) Saliendo del parqueadero`);
        } 
        else if (vehiculo.id_estado === 2 && nuevoEstado === 1) {
            // De Afuera a Adentro: nueva fecha de ingreso, limpiar fecha salida
            updateData.fecha_ingreso = new Date();
            updateData.fecha_salida = null;
            console.log(`🚗 ${vehiculo.placa} (ID: ${id}) Entrando al parqueadero`);
        }
        else {
            // Mismo estado, no hacer nada especial
            console.log(`⚠️  ${vehiculo.placa} (ID: ${id}) Ya está en estado ${nuevoEstado === 1 ? 'Adentro' : 'Afuera'}`);
        }

        // Actualizar el vehículo usando su id_vehiculo
        const { data, error } = await supabase
            .from('vehiculos')
            .update(updateData)
            .eq('id_vehiculo', id)
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `);

        if (error) {
            console.error('Error actualizando estado:', error);
            throw error;
        }
        
        const estadoTexto = nuevoEstado === 1 ? 'Adentro' : 'Afuera';
        console.log(`✅ ${vehiculo.placa} (ID: ${id}) Estado actualizado a: ${estadoTexto}`);
        res.json(data[0]);
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ 
            error: 'Error al cambiar estado del vehículo',
            details: error.message 
        });
    }
});

// PUT actualizar datos del vehículo por ID
router.put('/vehiculos/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_tipo, propietario } = req.body;

        console.log(`📝 Actualizando datos del vehículo ID ${id}:`, { id_tipo, propietario });

        // Buscar el vehículo por ID
        const { data: vehiculo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('id_vehiculo', id)
            .single();

        if (errorFind || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo no encontrado'
            });
        }

        // Preparar datos a actualizar
        const updateData = {};
        if (id_tipo !== undefined && id_tipo !== null && id_tipo !== '') {
            updateData.id_tipo = parseInt(id_tipo);
        }
        if (propietario !== undefined && propietario !== null && propietario.trim()) {
            updateData.propietario = propietario.trim();
        }

        // Si no hay nada que actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                error: 'No hay datos para actualizar',
                details: 'Envíe id_tipo o propietario en el cuerpo de la solicitud'
            });
        }

        // Actualizar
        const { data, error } = await supabase
            .from('vehiculos')
            .update(updateData)
            .eq('id_vehiculo', id)
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `);

        if (error) {
            console.error('Error actualizando vehículo:', error);
            throw error;
        }
        
        console.log(`✅ Vehículo ID ${id} (${vehiculo.placa}) Datos actualizados`);
        res.json(data[0]);
        
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ 
            error: 'Error al actualizar vehículo',
            details: error.message 
        });
    }
});

// RUTAS CON placa (para compatibilidad, buscan el vehículo ACTIVO)

// GET vehículo específico por placa (devuelve el ACTIVO)
router.get('/vehiculos/:placa', async (req, res) => {
    try {
        const { placa } = req.params;
        
        console.log(`🔎 Buscando vehículo ACTIVO con placa: ${placa}`);

        // Buscar el vehículo ACTIVO (sin fecha_salida)
        const { data: vehiculo, error } = await supabase
            .from('vehiculos')
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `)
            .eq('placa', placa.toUpperCase())
            .is('fecha_salida', null)  // Buscar activo
            .order('fecha_ingreso', { ascending: false })
            .limit(1)
            .single();

        if (error || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo activo no encontrado',
                suggestion: 'El vehículo puede estar afuera o no existe'
            });
        }

        console.log(`✅ Vehículo activo encontrado: ${placa} (ID: ${vehiculo.id_vehiculo})`);
        res.json(vehiculo);
        
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({ 
            error: 'Error al obtener vehículo',
            details: error.message 
        });
    }
});

// PUT cambiar estado por placa (ACTIVO)
router.put('/vehiculos/:placa/estado', async (req, res) => {
    try {
        const { placa } = req.params;
        const { id_estado } = req.body;

        console.log(`🔄 Cambiando estado de ${placa} (ACTIVO) a:`, id_estado);

        // Buscar el vehículo ACTIVO
        const { data: vehiculo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('placa', placa.toUpperCase())
            .is('fecha_salida', null)
            .order('fecha_ingreso', { ascending: false })
            .limit(1)
            .single();

        if (errorFind || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo activo no encontrado',
                suggestion: 'Si el vehículo ya salió, use POST /vehiculos para registrarlo nuevamente'
            });
        }

        // Llamar a la ruta de ID
        // Redirigir a la ruta con ID
        const id = vehiculo.id_vehiculo;
        
        // Crear un nuevo request para la ruta con ID
        req.params.id = id;
        req.body.id_estado = id_estado;
        
        // Usar la misma lógica que la ruta con ID
        const nuevoEstado = parseInt(id_estado);
        const updateData = { id_estado: nuevoEstado };
        
        if (vehiculo.id_estado === 1 && nuevoEstado === 2) {
            updateData.fecha_salida = new Date();
            console.log(`🚗 ${placa} (ID: ${id}) Saliendo del parqueadero`);
        } 
        else if (vehiculo.id_estado === 2 && nuevoEstado === 1) {
            updateData.fecha_ingreso = new Date();
            updateData.fecha_salida = null;
            console.log(`🚗 ${placa} (ID: ${id}) Entrando al parqueadero`);
        }

        const { data, error } = await supabase
            .from('vehiculos')
            .update(updateData)
            .eq('id_vehiculo', id)
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `);

        if (error) {
            console.error('Error actualizando estado:', error);
            throw error;
        }
        
        const estadoTexto = nuevoEstado === 1 ? 'Adentro' : 'Afuera';
        console.log(`✅ ${placa} (ID: ${id}) Estado actualizado a: ${estadoTexto}`);
        res.json(data[0]);
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ 
            error: 'Error al cambiar estado del vehículo',
            details: error.message 
        });
    }
});

// PUT actualizar datos por placa (ACTIVO)
router.put('/vehiculos/:placa', async (req, res) => {
    try {
        const { placa } = req.params;
        const { id_tipo, propietario } = req.body;

        console.log(`📝 Actualizando datos de ${placa} (ACTIVO):`, { id_tipo, propietario });

        // Buscar el vehículo ACTIVO
        const { data: vehiculo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('placa', placa.toUpperCase())
            .is('fecha_salida', null)
            .order('fecha_ingreso', { ascending: false })
            .limit(1)
            .single();

        if (errorFind || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo activo no encontrado',
                suggestion: 'Si el vehículo ya salió, no se pueden actualizar sus datos'
            });
        }

        // Llamar a la ruta con ID
        return res.redirect(307, `/api/vehiculos/id/${vehiculo.id_vehiculo}`);
        
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ 
            error: 'Error al actualizar vehículo',
            details: error.message 
        });
    }
});

// DELETE eliminar vehículo ACTIVO por placa
router.delete('/vehiculos/:placa', async (req, res) => {
    try {
        const { placa } = req.params;
        
        console.log(`🗑️  Eliminando vehículo ACTIVO: ${placa}`);

        // Buscar el vehículo ACTIVO
        const { data: vehiculo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('placa', placa.toUpperCase())
            .is('fecha_salida', null)
            .order('fecha_ingreso', { ascending: false })
            .limit(1)
            .single();

        if (errorFind || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo activo no encontrado',
                suggestion: 'Solo se pueden eliminar vehículos que están actualmente en el parqueadero'
            });
        }

        // Eliminar usando id_vehiculo
        const { error } = await supabase
            .from('vehiculos')
            .delete()
            .eq('id_vehiculo', vehiculo.id_vehiculo);

        if (error) {
            console.error('Error eliminando vehículo:', error);
            throw error;
        }
        
        console.log(`✅ Vehículo eliminado: ${placa} (ID: ${vehiculo.id_vehiculo})`);
        res.json({ 
            success: true, 
            message: 'Vehículo eliminado correctamente',
            placa: placa,
            id_vehiculo: vehiculo.id_vehiculo
        });
        
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        res.status(500).json({ 
            error: 'Error al eliminar vehículo',
            details: error.message 
        });
    }
});

// POST registrar salida rápida (de Adentro a Afuera) - Para vehículo ACTIVO
router.post('/vehiculos/:placa/salir', async (req, res) => {
    try {
        const { placa } = req.params;
        
        console.log(`🚪 Registrando salida de: ${placa}`);

        // Buscar el vehículo ACTIVO
        const { data: vehiculo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('placa', placa.toUpperCase())
            .eq('id_estado', 1)
            .is('fecha_salida', null)
            .single();

        if (errorFind || !vehiculo) {
            return res.status(404).json({ 
                error: 'Vehículo no encontrado o no está adentro',
                suggestion: 'El vehículo ya puede estar afuera o no existe'
            });
        }

        // Redirigir a la ruta de cambiar estado con ID
        req.params.id = vehiculo.id_vehiculo;
        req.body = { id_estado: 2 };
        
        // Simular la llamada a la ruta con ID
        const { data, error } = await supabase
            .from('vehiculos')
            .update({
                id_estado: 2,
                fecha_salida: new Date()
            })
            .eq('id_vehiculo', vehiculo.id_vehiculo)
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `);

        if (error) {
            console.error('Error registrando salida:', error);
            throw error;
        }
        
        console.log(`✅ ${placa} (ID: ${vehiculo.id_vehiculo}) ha salido del parqueadero`);
        res.json(data[0]);
        
    } catch (error) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ 
            error: 'Error al registrar salida',
            details: error.message 
        });
    }
});

// POST registrar entrada rápida (de Afuera a Adentro) - Crear NUEVO registro
router.post('/vehiculos/:placa/entrar', async (req, res) => {
    try {
        const { placa } = req.params;
        const { id_tipo, propietario } = req.body;
        
        console.log(`🚗 Registrando entrada de: ${placa}`);

        // Normalizar placa
        const placaNormalizada = placa.toUpperCase();

        // Verificar si hay un vehículo ACTIVO con esta placa
        const { data: vehiculoActivo, error: errorFind } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('placa', placaNormalizada)
            .eq('id_estado', 1)
            .maybeSingle();

        if (vehiculoActivo) {
            return res.status(400).json({ 
                error: `El vehículo ${placaNormalizada} ya está adentro`,
                vehiculo: vehiculoActivo
            });
        }

        // Buscar datos anteriores si no se envían
        let tipoVehiculo = id_tipo;
        let nombrePropietario = propietario;

        if (!tipoVehiculo || !nombrePropietario) {
            const { data: ultimoRegistro } = await supabase
                .from('vehiculos')
                .select('id_tipo, propietario')
                .eq('placa', placaNormalizada)
                .order('fecha_ingreso', { ascending: false })
                .limit(1)
                .single();

            if (ultimoRegistro) {
                if (!tipoVehiculo) tipoVehiculo = ultimoRegistro.id_tipo;
                if (!nombrePropietario) nombrePropietario = ultimoRegistro.propietario;
            }
        }

        // Validar datos necesarios
        if (!tipoVehiculo) {
            return res.status(400).json({ 
                error: 'Tipo de vehículo requerido',
                suggestion: 'Envíe id_tipo en el cuerpo de la solicitud'
            });
        }
        if (!nombrePropietario) {
            return res.status(400).json({ 
                error: 'Propietario requerido',
                suggestion: 'Envíe propietario en el cuerpo de la solicitud'
            });
        }

        // Crear NUEVO registro
        const nuevoRegistro = {
            placa: placaNormalizada,
            id_tipo: parseInt(tipoVehiculo),
            propietario: nombrePropietario.trim(),
            id_estado: 1,
            fecha_ingreso: new Date(),
            fecha_salida: null
        };

        const { data, error } = await supabase
            .from('vehiculos')
            .insert([nuevoRegistro])
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `);

        if (error) {
            console.error('Error registrando entrada:', error);
            throw error;
        }
        
        console.log(`✅ ${placa} ha entrado al parqueadero (ID: ${data[0].id_vehiculo})`);
        res.json(data[0]);
        
    } catch (error) {
        console.error('Error al registrar entrada:', error);
        res.status(500).json({ 
            error: 'Error al registrar entrada',
            details: error.message 
        });
    }
});

// GET historial de una placa
router.get('/vehiculos/:placa/historial', async (req, res) => {
    try {
        const { placa } = req.params;
        
        console.log(`📜 Obteniendo historial de: ${placa}`);

        const { data, error } = await supabase
            .from('vehiculos')
            .select(`
                *,
                tipo_vehiculo: id_tipo (descripcion),
                estado_vehiculo: id_estado (descripcion)
            `)
            .eq('placa', placa.toUpperCase())
            .order('fecha_ingreso', { ascending: false });

        if (error) {
            console.error('Error obteniendo historial:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log(`✅ ${data?.length || 0} registros encontrados para ${placa}`);
        res.json(data || []);
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ 
            error: 'Error al obtener historial',
            details: error.message 
        });
    }
});

module.exports = router;