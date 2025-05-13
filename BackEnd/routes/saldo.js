const express = require('express');
const router = express.Router();

// Puedes simular una base de datos 
const usuario = {
  id: 1,
  nombre: 'Juan Pérez',
  saldo: 1520.75
};

router.get('/', (req, res) => {
  res.json({ saldo: usuario.saldo });
});

module.exports = router;
