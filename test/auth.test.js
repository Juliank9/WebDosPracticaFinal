const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');

describe('Auth endpoints', () => {
    let jwtToken = null;
    let resetToken = null;
    const randomEmail = `user${Date.now()}@test.com`;
    const password = '12345678';
    jest.setTimeout(20000);

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('debería registrar un usuario nuevo', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({email: randomEmail, password});

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');

        jwtToken = res.body.token;
    });

    it('debería rechazar registro duplicado', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({email: randomEmail, password});

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('message', 'Email ya registrado');
    });

    it('debería validar el email correctamente', async () => {
        const userInDb = await User.findOne({email: randomEmail});
        const code = userInDb.validationCode;

        const res = await request(app)
            .post('/api/auth/validate-email')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({code});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Email validado correctamente');
    });

    it('debería hacer login con credenciales válidas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({email: randomEmail, password});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', randomEmail);

        jwtToken = res.body.token;
    });

    it('debería fallar login con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({email: randomEmail, password: 'incorrecta'});

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Credenciales incorrectas');
    });

    it('debería generar un token de recuperación', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({email: randomEmail});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');

        resetToken = res.body.token;
    });

    it('debería resetear la contraseña con el token', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({
                token: resetToken,
                newPassword: 'claveNueva123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Contraseña actualizada correctamente');
    });

    it('debería permitir login con la nueva contraseña', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: randomEmail,
                password: 'claveNueva123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', randomEmail);
    });
});