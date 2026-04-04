-- =============================================
-- JCM 5to - Datos iniciales (Seed)
-- =============================================

USE jcm_5to;

-- Configuración inicial
INSERT INTO configuracion (clave, valor) VALUES
  ('nombre_institucion', 'I.E. José Carlos Mariátegui')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

INSERT INTO configuracion (clave, valor) VALUES
  ('ciudad', 'Ica')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

INSERT INTO configuracion (clave, valor) VALUES
  ('anio_escolar', '2026')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

INSERT INTO configuracion (clave, valor) VALUES
  ('puntaje_minimo_admision_default', '10.0000')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);
