const XLSX = require('xlsx');
const calculoService = require('./calculoService');

const importService = {
  /**
   * Parsea un archivo Excel/CSV y retorna filas normalizadas.
   * Espera columnas: dni, correctas, incorrectas, en_blanco
   * @param {string} filePath - Ruta del archivo subido
   * @returns {Array<{dni, correctas, incorrectas, en_blanco}>}
   */
  parsearArchivo(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: 0 });

    if (rows.length === 0) {
      throw new Error('El archivo está vacío o no tiene datos válidos.');
    }

    // Normalizar nombres de columnas (limpiar espacios, tildes, lowercase)
    const normalized = rows.map((row, idx) => {
      const keys = Object.keys(row);
      const find = (names) => {
        for (const name of names) {
          const key = keys.find(k => k.trim().toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u') === name);
          if (key !== undefined) return row[key];
        }
        return undefined;
      };

      const dni = find(['dni', 'codigo', 'cod']);
      const correctas = find(['correctas', 'buenas', 'aciertos', 'correct']);
      const incorrectas = find(['incorrectas', 'malas', 'errores', 'incorrect']);
      const en_blanco = find(['en_blanco', 'enblanco', 'blanco', 'sin_responder', 'vacias']);

      if (dni === undefined) {
        throw new Error(`Fila ${idx + 2}: No se encontró columna de DNI.`);
      }

      return {
        fila: idx + 2,
        dni: String(dni).trim(),
        correctas: parseInt(correctas) || 0,
        incorrectas: parseInt(incorrectas) || 0,
        en_blanco: parseInt(en_blanco) || 0
      };
    });

    return normalized;
  },

  /**
   * Procesa las filas importadas contra un examen y lista de estudiantes.
   * @param {Array} filas - Filas del archivo
   * @param {number} totalPreguntas - Total de preguntas del examen
   * @param {Map<string, number>} dniToEstudianteId - Mapa DNI → estudiante.id
   * @returns {{ exitosos: Array, errores: Array }}
   */
  procesarFilas(filas, totalPreguntas, dniToEstudianteId) {
    const exitosos = [];
    const errores = [];

    for (const fila of filas) {
      // Verificar que el DNI existe
      const estudianteId = dniToEstudianteId.get(fila.dni);
      if (!estudianteId) {
        errores.push({ fila: fila.fila, dni: fila.dni, error: 'DNI no encontrado en el sistema' });
        continue;
      }

      // Validar respuestas
      const validacion = calculoService.validarFila(fila.correctas, fila.incorrectas, fila.en_blanco, totalPreguntas);
      if (!validacion.ok) {
        errores.push({ fila: fila.fila, dni: fila.dni, error: validacion.error });
        continue;
      }

      // Calcular puntajes
      const { puntaje_bruto, nota_vigesimal } = calculoService.calcular(
        fila.correctas, fila.incorrectas, fila.en_blanco, totalPreguntas
      );

      exitosos.push({
        estudiante_id: estudianteId,
        correctas: parseInt(fila.correctas),
        incorrectas: parseInt(fila.incorrectas),
        en_blanco: parseInt(fila.en_blanco),
        puntaje_bruto,
        nota_vigesimal
      });
    }

    return { exitosos, errores };
  }
};

module.exports = importService;
