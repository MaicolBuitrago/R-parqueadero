const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Usar SUPABASE_SERVICE_KEY en lugar de SUPABASE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

console.log('🔧 Configurando cliente Supabase con Service Role...');
console.log('URL:', supabaseUrl);
console.log('Service Key disponible:', supabaseServiceKey ? 'SÍ (primeros 20 chars): ' + supabaseServiceKey.substring(0, 20) + '...' : 'NO');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERROR: SUPABASE_URL o SUPABASE_SERVICE_KEY faltan en .env');
    console.error('💡 Si no tienes service key, usa SUPABASE_KEY con la anon key');
    throw new Error('Credenciales de Supabase faltantes');
}

// Crear cliente Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('✅ Cliente Supabase (Service Role) inicializado');

// Función para verificar conexión y tablas
async function verificarConexion() {
    try {
        console.log('🔍 Verificando conexión a Supabase...');
        
        // Verificar que podemos acceder a las tablas
        const tablasRequeridas = ['vehiculos', 'tipo_vehiculo', 'estado_vehiculo'];
        
        for (const tabla of tablasRequeridas) {
            try {
                const { error } = await supabase
                    .from(tabla)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.warn(`⚠️  Tabla '${tabla}' no accesible:`, error.message);
                    console.log('💡 Verifica que la tabla exista y tengas permisos');
                } else {
                    console.log(`✅ Tabla '${tabla}' accesible`);
                }
            } catch (err) {
                console.warn(`⚠️  Error al acceder a tabla '${tabla}':`, err.message);
            }
        }
        
        // Probar una consulta simple
        console.log('🧪 Probando consulta simple...');
        const { data, error } = await supabase
            .from('vehiculos')
            .select('count')
            .limit(1);
        
        if (error) {
            console.warn('⚠️  Consulta de prueba falló:', error.message);
            console.log('💡 Esto puede ser normal si la tabla está vacía o no existe aún');
        } else {
            console.log('✅ Consulta de prueba exitosa');
        }
        
    } catch (err) {
        console.error('❌ Error en verificación:', err.message);
    }
}

// Ejecutar verificación al iniciar
verificarConexion();

module.exports = supabase;