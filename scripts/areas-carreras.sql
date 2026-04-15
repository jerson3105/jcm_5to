-- Exportación de áreas y carreras
-- Generado: 2026-04-15T19:50:48.972Z

-- =====================
-- ÁREAS
-- =====================
INSERT INTO `areas` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(3, 'Área A', 'Ciencias de la Salud', 'Fri Apr 03 2026 15:34:18 GMT-0500 (hora estándar de Perú)', 'Fri Apr 03 2026 15:34:18 GMT-0500 (hora estándar de Perú)'),
(4, 'Área B', 'Ciencias Sociales y Humanidades', 'Fri Apr 03 2026 15:34:31 GMT-0500 (hora estándar de Perú)', 'Fri Apr 03 2026 15:34:31 GMT-0500 (hora estándar de Perú)'),
(5, 'Área C', 'Ciencias e Ingeniería', 'Fri Apr 03 2026 15:34:43 GMT-0500 (hora estándar de Perú)', 'Fri Apr 03 2026 15:34:43 GMT-0500 (hora estándar de Perú)')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- =====================
-- CARRERAS
-- =====================
INSERT INTO `carreras` (`id`, `nombre`, `area_id`, `puntaje_minimo_admision`, `created_at`, `updated_at`) VALUES
(1, 'Biología', 3, 3.0918, 'Fri Apr 03 2026 18:49:38 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:38:03 GMT-0500 (hora estándar de Perú)'),
(2, 'Enfermería', 3, 10.9792, 'Fri Apr 03 2026 18:49:50 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:39:27 GMT-0500 (hora estándar de Perú)'),
(3, 'Farmacia y Bioquímica', 3, 2.4709, 'Fri Apr 03 2026 18:50:00 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:39:49 GMT-0500 (hora estándar de Perú)'),
(4, 'Medicina Humana', 3, 15.5959, 'Fri Apr 03 2026 18:50:10 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:40:27 GMT-0500 (hora estándar de Perú)'),
(5, 'Obstetricia', 3, 4.0876, 'Fri Apr 03 2026 18:50:17 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:40:44 GMT-0500 (hora estándar de Perú)'),
(6, 'Odontología', 3, 5.3340, 'Fri Apr 03 2026 18:50:26 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:41:29 GMT-0500 (hora estándar de Perú)'),
(7, 'Psicología', 3, 4.8293, 'Fri Apr 03 2026 18:50:33 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:41:51 GMT-0500 (hora estándar de Perú)'),
(8, 'Administración', 4, 1.8209, 'Fri Apr 03 2026 18:50:53 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:42:47 GMT-0500 (hora estándar de Perú)'),
(9, 'Arqueología', 4, 0.2544, 'Fri Apr 03 2026 18:51:00 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:43:03 GMT-0500 (hora estándar de Perú)'),
(10, 'Ciencias de la comunicación', 4, 0.1377, 'Fri Apr 03 2026 18:51:08 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:43:21 GMT-0500 (hora estándar de Perú)'),
(11, 'Turismo', 4, 0.1545, 'Fri Apr 03 2026 18:51:15 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:44:10 GMT-0500 (hora estándar de Perú)'),
(12, 'Ciencias de la educación en ciencias biológicas y química', 4, 0.8086, 'Fri Apr 03 2026 18:51:35 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:44:46 GMT-0500 (hora estándar de Perú)'),
(13, 'Ciencias de la educación en educación artística', 4, 0.0753, 'Fri Apr 03 2026 18:51:46 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:45:13 GMT-0500 (hora estándar de Perú)'),
(14, 'Ciencias de la educación en educación física', 4, 1.2751, 'Fri Apr 03 2026 18:51:58 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:46:15 GMT-0500 (hora estándar de Perú)'),
(15, 'Ciencias de la educación en educación inicial', 4, 2.4004, 'Fri Apr 03 2026 18:52:09 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:46:30 GMT-0500 (hora estándar de Perú)'),
(16, 'Ciencias de la educación en educación primaria', 4, 1.4586, 'Fri Apr 03 2026 18:52:22 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:46:43 GMT-0500 (hora estándar de Perú)'),
(17, 'Ciencias de la educación en filosofía, psicología y ciencias sociales.', 4, 0.2672, 'Fri Apr 03 2026 18:52:46 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:46:56 GMT-0500 (hora estándar de Perú)'),
(18, 'Ciencias de la educación en historia y geografía', 4, 0.1545, 'Fri Apr 03 2026 18:53:01 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:47:11 GMT-0500 (hora estándar de Perú)'),
(19, 'Ciencias de la educación en lengua y literatura', 4, 1.0417, 'Fri Apr 03 2026 18:53:13 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:47:23 GMT-0500 (hora estándar de Perú)'),
(20, 'Ciencias de la educación en Matemática e Informática', 4, 0.8005, 'Fri Apr 03 2026 18:53:27 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:47:42 GMT-0500 (hora estándar de Perú)'),
(21, 'Economía', 4, 0.0005, 'Fri Apr 03 2026 18:53:35 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:48:09 GMT-0500 (hora estándar de Perú)'),
(22, 'Negocios Internacionales', 4, 1.3338, 'Fri Apr 03 2026 18:53:46 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:48:25 GMT-0500 (hora estándar de Perú)'),
(23, 'Contabilidad', 4, 0.2669, 'Fri Apr 03 2026 18:53:55 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:48:41 GMT-0500 (hora estándar de Perú)'),
(24, 'Derecho', 4, 4.6045, 'Fri Apr 03 2026 18:54:01 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:48:55 GMT-0500 (hora estándar de Perú)'),
(25, 'Agronomía', 5, 3.2209, 'Fri Apr 03 2026 18:54:54 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:49:25 GMT-0500 (hora estándar de Perú)'),
(26, 'Arquitectura', 5, 4.0044, 'Fri Apr 03 2026 18:55:02 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:49:54 GMT-0500 (hora estándar de Perú)'),
(27, 'Estadística', 5, 0.2672, 'Fri Apr 03 2026 18:55:10 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:50:10 GMT-0500 (hora estándar de Perú)'),
(28, 'Física', 5, 0.3376, 'Fri Apr 03 2026 18:55:16 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:50:51 GMT-0500 (hora estándar de Perú)'),
(29, 'Matemática e Informática', 5, 0.8005, 'Fri Apr 03 2026 18:55:25 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:51:12 GMT-0500 (hora estándar de Perú)'),
(30, 'Ingeniería Ambiental y Sanitaria', 5, 1.8085, 'Fri Apr 03 2026 18:55:38 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:51:30 GMT-0500 (hora estándar de Perú)'),
(31, 'Ingeniería Civil', 5, 4.4459, 'Fri Apr 03 2026 18:55:46 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:51:51 GMT-0500 (hora estándar de Perú)'),
(32, 'Ingeniería de Minas', 5, 2.9667, 'Fri Apr 03 2026 18:55:53 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:52:15 GMT-0500 (hora estándar de Perú)'),
(33, 'Ingeniería Metalúrgica', 5, 1.6418, 'Fri Apr 03 2026 18:57:10 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:52:43 GMT-0500 (hora estándar de Perú)'),
(34, 'Ingeniería de Sistemas', 5, 6.2417, 'Fri Apr 03 2026 18:57:21 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:55:44 GMT-0500 (hora estándar de Perú)'),
(35, 'Ingeniería Electrónica', 5, 1.7417, 'Fri Apr 03 2026 18:57:29 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:56:01 GMT-0500 (hora estándar de Perú)'),
(36, 'Ingeniería Mecánica Eléctrica', 5, 4.3959, 'Fri Apr 03 2026 18:57:40 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:56:16 GMT-0500 (hora estándar de Perú)'),
(37, 'Ingeniería de Alimentos', 5, 0.0294, 'Fri Apr 03 2026 18:57:49 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:56:29 GMT-0500 (hora estándar de Perú)'),
(38, 'Ingeniería Pesquera', 5, 0.9501, 'Fri Apr 03 2026 18:57:57 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:56:47 GMT-0500 (hora estándar de Perú)'),
(39, 'Ingeniería Química', 5, 0.0797, 'Fri Apr 03 2026 18:58:10 GMT-0500 (hora estándar de Perú)', 'Sat Apr 04 2026 11:57:04 GMT-0500 (hora estándar de Perú)')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), area_id=VALUES(area_id), puntaje_minimo_admision=VALUES(puntaje_minimo_admision);

