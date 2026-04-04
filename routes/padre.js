const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Proteger todas las rutas de padre
router.use(auth, role('padre'));

// Dashboard padre
router.get('/', (req, res) => {
  res.render('padre/dashboard', {
    title: 'Panel de Padre',
    layout: 'layouts/padre',
    currentPage: 'dashboard'
  });
});

module.exports = router;
