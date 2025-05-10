const express = require('express');
const app = express();
const PORT = 3000;
dulc
app.use(express.json());

// Ruta de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: '¡Hola desde TripTogether backend!' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

app.get('/api/viajes', (req, res) => {
    res.json([{ origen: 'Ciudad A', destino: 'Ciudad B', conductor: 'Luis' }]);
  });