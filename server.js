require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24h
  }
}));

// Variables globales para vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  res.locals.importErrors = req.session.importErrors || null;
  // Limpiar mensajes flash después de leerlos
  delete req.session.success;
  delete req.session.error;
  delete req.session.importErrors;
  next();
});

// Rutas
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/estudiante', require('./routes/estudiante'));
app.use('/padre', require('./routes/padre'));

// 404
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Página no encontrada', layout: false });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500', { title: 'Error del servidor', layout: false });
});

// Iniciar servidor
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la BD:', error.message);
    process.exit(1);
  }
}

start();
