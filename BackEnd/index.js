const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // permite peticiones desde tu frontend
app.use(express.json());

// Rutas
const saldoRoute = require('./routes/saldo');
app.use('/api/saldo', saldoRoute);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});