const { Configuracion } = require('../../models');

// Claves de configuración con sus valores por defecto y descripciones
const CLAVES_CONFIG = [
  { clave: 'nombre_institucion', defecto: 'I.E. José Carlos Mariátegui', descripcion: 'Nombre de la institución educativa', tipo: 'text' },
  { clave: 'anio_academico', defecto: new Date().getFullYear().toString(), descripcion: 'Año académico actual', tipo: 'text' },
  { clave: 'grado', defecto: '5to Secundaria', descripcion: 'Grado que utiliza el sistema', tipo: 'text' },
  { clave: 'nota_aprobatoria', defecto: '11', descripcion: 'Nota mínima para aprobar (escala vigesimal)', tipo: 'number' },
  { clave: 'penalizacion_incorrecta', defecto: '-0.33', descripcion: 'Penalización por respuesta incorrecta', tipo: 'number' },
  { clave: 'puntaje_blanco', defecto: '0.0625', descripcion: 'Puntaje por respuesta en blanco', tipo: 'number' },
  { clave: 'puntaje_correcta', defecto: '1', descripcion: 'Puntaje por respuesta correcta', tipo: 'number' },
  { clave: 'alerta_nota_baja', defecto: '8', descripcion: 'Nota debajo de la cual se genera alerta pedagógica', tipo: 'number' },
  { clave: 'alerta_tendencia_baja', defecto: '3', descripcion: 'Cantidad de exámenes consecutivos con tendencia negativa para alerta', tipo: 'number' },
  { clave: 'mostrar_ranking_estudiantes', defecto: 'true', descripcion: 'Permitir que los estudiantes vean el ranking general', tipo: 'boolean' },
  { clave: 'mostrar_ranking_padres', defecto: 'true', descripcion: 'Permitir que los padres vean el ranking', tipo: 'boolean' }
];

const configuracionController = {
  async index(req, res) {
    try {
      // Obtener configuración existente
      const configDB = await Configuracion.findAll({ raw: true });
      const configMap = new Map(configDB.map(c => [c.clave, c.valor]));

      // Combinar con valores por defecto
      const configuraciones = CLAVES_CONFIG.map(c => ({
        ...c,
        valor: configMap.has(c.clave) ? configMap.get(c.clave) : c.defecto
      }));

      res.render('admin/configuracion', {
        title: 'Configuración',
        layout: 'layouts/admin',
        currentPage: 'configuracion',
        configuraciones,
        grupos: {
          general: configuraciones.filter(c => ['nombre_institucion', 'anio_academico', 'grado'].includes(c.clave)),
          calificacion: configuraciones.filter(c => ['nota_aprobatoria', 'penalizacion_incorrecta', 'puntaje_blanco', 'puntaje_correcta'].includes(c.clave)),
          alertas: configuraciones.filter(c => ['alerta_nota_baja', 'alerta_tendencia_baja'].includes(c.clave)),
          visibilidad: configuraciones.filter(c => ['mostrar_ranking_estudiantes', 'mostrar_ranking_padres'].includes(c.clave))
        }
      });
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      req.session.error = 'Error al cargar la configuración.';
      res.redirect('/admin');
    }
  },

  async update(req, res) {
    try {
      const updates = req.body;
      
      for (const c of CLAVES_CONFIG) {
        let valor = updates[c.clave];
        
        // Para checkboxes/booleans que no se envían si están desmarcados
        if (c.tipo === 'boolean') {
          valor = valor ? 'true' : 'false';
        }

        if (valor !== undefined && valor !== null) {
          await Configuracion.upsert({
            clave: c.clave,
            valor: String(valor).trim()
          });
        }
      }

      req.session.success = 'Configuración guardada correctamente.';
      res.redirect('/admin/configuracion');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      req.session.error = 'Error al guardar la configuración.';
      res.redirect('/admin/configuracion');
    }
  }
};

module.exports = configuracionController;
