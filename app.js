const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Cargar variables .env
dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const projectRoutes = require('./routes/project.routes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
