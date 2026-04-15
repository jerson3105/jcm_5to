-- Exportación de áreas y carreras
-- Generado: 2026-04-15T19:57:08.971Z

-- =====================
-- ÁREAS
-- =====================
INSERT INTO `areas` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(3, 'Área A', 'Ciencias de la Salud', '2026-04-03 20:34:18', '2026-04-03 20:34:18'),
(4, 'Área B', 'Ciencias Sociales y Humanidades', '2026-04-03 20:34:31', '2026-04-03 20:34:31'),
(5, 'Área C', 'Ciencias e Ingeniería', '2026-04-03 20:34:43', '2026-04-03 20:34:43')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- =====================
-- CARRERAS
-- =====================
INSERT INTO `carreras` (`id`, `nombre`, `area_id`, `puntaje_minimo_admision`, `created_at`, `updated_at`) VALUES
(1, 'Biología', 3, 3.0918, '2026-04-03 23:49:38', '2026-04-04 16:38:03'),
(2, 'Enfermería', 3, 10.9792, '2026-04-03 23:49:50', '2026-04-04 16:39:27'),
(3, 'Farmacia y Bioquímica', 3, 2.4709, '2026-04-03 23:50:00', '2026-04-04 16:39:49'),
(4, 'Medicina Humana', 3, 15.5959, '2026-04-03 23:50:10', '2026-04-04 16:40:27'),
(5, 'Obstetricia', 3, 4.0876, '2026-04-03 23:50:17', '2026-04-04 16:40:44'),
(6, 'Odontología', 3, 5.3340, '2026-04-03 23:50:26', '2026-04-04 16:41:29'),
(7, 'Psicología', 3, 4.8293, '2026-04-03 23:50:33', '2026-04-04 16:41:51'),
(8, 'Administración', 4, 1.8209, '2026-04-03 23:50:53', '2026-04-04 16:42:47'),
(9, 'Arqueología', 4, 0.2544, '2026-04-03 23:51:00', '2026-04-04 16:43:03'),
(10, 'Ciencias de la comunicación', 4, 0.1377, '2026-04-03 23:51:08', '2026-04-04 16:43:21'),
(11, 'Turismo', 4, 0.1545, '2026-04-03 23:51:15', '2026-04-04 16:44:10'),
(12, 'Ciencias de la educación en ciencias biológicas y química', 4, 0.8086, '2026-04-03 23:51:35', '2026-04-04 16:44:46'),
(13, 'Ciencias de la educación en educación artística', 4, 0.0753, '2026-04-03 23:51:46', '2026-04-04 16:45:13'),
(14, 'Ciencias de la educación en educación física', 4, 1.2751, '2026-04-03 23:51:58', '2026-04-04 16:46:15'),
(15, 'Ciencias de la educación en educación inicial', 4, 2.4004, '2026-04-03 23:52:09', '2026-04-04 16:46:30'),
(16, 'Ciencias de la educación en educación primaria', 4, 1.4586, '2026-04-03 23:52:22', '2026-04-04 16:46:43'),
(17, 'Ciencias de la educación en filosofía, psicología y ciencias sociales.', 4, 0.2672, '2026-04-03 23:52:46', '2026-04-04 16:46:56'),
(18, 'Ciencias de la educación en historia y geografía', 4, 0.1545, '2026-04-03 23:53:01', '2026-04-04 16:47:11'),
(19, 'Ciencias de la educación en lengua y literatura', 4, 1.0417, '2026-04-03 23:53:13', '2026-04-04 16:47:23'),
(20, 'Ciencias de la educación en Matemática e Informática', 4, 0.8005, '2026-04-03 23:53:27', '2026-04-04 16:47:42'),
(21, 'Economía', 4, 0.0005, '2026-04-03 23:53:35', '2026-04-04 16:48:09'),
(22, 'Negocios Internacionales', 4, 1.3338, '2026-04-03 23:53:46', '2026-04-04 16:48:25'),
(23, 'Contabilidad', 4, 0.2669, '2026-04-03 23:53:55', '2026-04-04 16:48:41'),
(24, 'Derecho', 4, 4.6045, '2026-04-03 23:54:01', '2026-04-04 16:48:55'),
(25, 'Agronomía', 5, 3.2209, '2026-04-03 23:54:54', '2026-04-04 16:49:25'),
(26, 'Arquitectura', 5, 4.0044, '2026-04-03 23:55:02', '2026-04-04 16:49:54'),
(27, 'Estadística', 5, 0.2672, '2026-04-03 23:55:10', '2026-04-04 16:50:10'),
(28, 'Física', 5, 0.3376, '2026-04-03 23:55:16', '2026-04-04 16:50:51'),
(29, 'Matemática e Informática', 5, 0.8005, '2026-04-03 23:55:25', '2026-04-04 16:51:12'),
(30, 'Ingeniería Ambiental y Sanitaria', 5, 1.8085, '2026-04-03 23:55:38', '2026-04-04 16:51:30'),
(31, 'Ingeniería Civil', 5, 4.4459, '2026-04-03 23:55:46', '2026-04-04 16:51:51'),
(32, 'Ingeniería de Minas', 5, 2.9667, '2026-04-03 23:55:53', '2026-04-04 16:52:15'),
(33, 'Ingeniería Metalúrgica', 5, 1.6418, '2026-04-03 23:57:10', '2026-04-04 16:52:43'),
(34, 'Ingeniería de Sistemas', 5, 6.2417, '2026-04-03 23:57:21', '2026-04-04 16:55:44'),
(35, 'Ingeniería Electrónica', 5, 1.7417, '2026-04-03 23:57:29', '2026-04-04 16:56:01'),
(36, 'Ingeniería Mecánica Eléctrica', 5, 4.3959, '2026-04-03 23:57:40', '2026-04-04 16:56:16'),
(37, 'Ingeniería de Alimentos', 5, 0.0294, '2026-04-03 23:57:49', '2026-04-04 16:56:29'),
(38, 'Ingeniería Pesquera', 5, 0.9501, '2026-04-03 23:57:57', '2026-04-04 16:56:47'),
(39, 'Ingeniería Química', 5, 0.0797, '2026-04-03 23:58:10', '2026-04-04 16:57:04')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), area_id=VALUES(area_id), puntaje_minimo_admision=VALUES(puntaje_minimo_admision);

