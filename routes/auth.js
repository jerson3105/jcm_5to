const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Página de inicio -> redirige al login
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect(`/${req.session.user.rol === 'admin' ? 'admin' : req.session.user.rol}`);
  }
  res.redirect('/login');
});

// Login
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
