const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarios');
const habitacionRoutes = require('./routes/habitaciones');
const reservaRoutes = require('./routes/reservas');
const servicioRoutes = require('./routes/servicios');
const qrRoutes = require('./routes/qrs');
const checkinRoutes = require('./routes/checkin');
const authRoutes = require('./routes/auth');
const misReservasRoutes = require('./routes/mis-reservas');
const horariosRoutes = require('./routes/horarios');
const dashboardRoutes = require('./routes/dashboard');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/qrs', qrRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/mis-reservas', misReservasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Hospedaje Líder funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});