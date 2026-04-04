/**
 * Script para crear la BD y ejecutar el schema + seed
 * Uso: npm run db:create
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createDatabase() {
  let connection;
  try {
    // Conectar sin DB para crearla
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      multipleStatements: true
    });

    console.log('Conectado a MySQL...');

    // Ejecutar schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('Schema creado correctamente.');

    // Generar hash del password admin
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insertar admin con password hasheado
    await connection.query(`USE jcm_5to`);
    await connection.query(
      `INSERT INTO usuarios (nombre, email, password, rol, activo)
       VALUES ('Administrador', 'admin@jcm5to.edu.pe', ?, 'admin', 1)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [adminPassword]
    );
    console.log('Admin creado (email: admin@jcm5to.edu.pe, password: admin123)');

    // Ejecutar seed (configuración)
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(seed);
    console.log('Datos iniciales insertados.');

    console.log('\n✅ Base de datos creada exitosamente.');
    console.log('   DB: jcm_5to');
    console.log('   Admin: admin@jcm5to.edu.pe / admin123');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

createDatabase();
