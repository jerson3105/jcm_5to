/**
 * Servicio de cálculo de puntajes para exámenes.
 *
 * Fórmulas:
 *   puntaje_bruto = (correctas × 1) + (incorrectas × −0.33) + (en_blanco × 0.0625)
 *   nota_vigesimal = (puntaje_bruto / total_preguntas) × 20   [mín 0, máx 20]
 */

const calculoService = {
  /**
   * Calcula puntaje_bruto y nota_vigesimal.
   * @param {number} correctas
   * @param {number} incorrectas
   * @param {number} enBlanco
   * @param {number} totalPreguntas
   * @returns {{ puntaje_bruto: number, nota_vigesimal: number }}
   */
  calcular(correctas, incorrectas, enBlanco, totalPreguntas) {
    const c = parseInt(correctas) || 0;
    const i = parseInt(incorrectas) || 0;
    const b = parseInt(enBlanco) || 0;
    const total = parseInt(totalPreguntas);

    if (!total || total <= 0) {
      throw new Error('total_preguntas debe ser mayor a 0');
    }

    const suma = c + i + b;
    if (suma > total) {
      throw new Error(`La suma de respuestas (${suma}) supera el total de preguntas (${total})`);
    }

    const puntaje_bruto = parseFloat(
      ((c * 1) + (i * -0.33) + (b * 0.0625)).toFixed(4)
    );

    let nota_vigesimal = parseFloat(
      ((puntaje_bruto / total) * 20).toFixed(4)
    );

    // Limitar entre 0 y 20
    if (nota_vigesimal < 0) nota_vigesimal = 0;
    if (nota_vigesimal > 20) nota_vigesimal = 20;

    return { puntaje_bruto, nota_vigesimal };
  },

  /**
   * Valida que los datos de una fila de resultado sean consistentes.
   * Retorna { ok, error? }
   */
  validarFila(correctas, incorrectas, enBlanco, totalPreguntas) {
    const c = parseInt(correctas);
    const i = parseInt(incorrectas);
    const b = parseInt(enBlanco);

    if (isNaN(c) || c < 0) return { ok: false, error: 'Correctas debe ser un número ≥ 0' };
    if (isNaN(i) || i < 0) return { ok: false, error: 'Incorrectas debe ser un número ≥ 0' };
    if (isNaN(b) || b < 0) return { ok: false, error: 'En blanco debe ser un número ≥ 0' };

    const suma = c + i + b;
    if (suma > totalPreguntas) {
      return { ok: false, error: `Suma (${suma}) supera total (${totalPreguntas})` };
    }

    return { ok: true };
  }
};

module.exports = calculoService;
