const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const setupSwagger = require('./swagger');

// Cargar variables .env
dotenv.config();

// Conectar a MongoDB
connectDB();

// Crear instancia de Express
const app = express();

// Middlewares
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/albaranes', require('./routes/albaran.routes'));

// Swagger UI
setupSwagger(app);

// Exportar app (sin levantar servidor) para usar en tests
module.exports = app;
