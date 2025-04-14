const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user.model');

describe('User endpoints', () => {
    let token;
    let userId;
    const password = '12345678';
    const email = `user${Date.now()}@test.com`;

    jest.setTimeout(20000);

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('debería registrar y validar al usuario', async () => {
        // Registro
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({email, password});

        expect(registerRes.statusCode).toBe(201);
        expect(registerRes.body).toHaveProperty('token');
        token = registerRes.body.token;

        // Validación
        const user = await User.findOne({email});
        expect(user).toBeTruthy();

        const validationRes = await request(app)
            .post('/api/auth/validate-email')
            .set('Authorization', `Bearer ${token}`)
            .send({code: user.validationCode});

        expect(validationRes.statusCode).toBe(200);
        userId = user._id;
    });

    it('debería hacer onboarding personal', async () => {
        const res = await request(app)
            .put('/api/users/onboarding/personal')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Julián',
                lastname: 'Villar',
                nif: '12345678H'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Datos personales actualizados');
    });

    it('debería hacer onboarding de empresa', async () => {
        const res = await request(app)
            .patch('/api/users/onboarding/company')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Mi Empresa S.L.',
                cif: 'B12345678',
                address: 'Calle Ejemplo 123',
                isAutonomous: false
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Datos de compañía actualizados');
    });

    it('debería devolver el perfil del usuario', async () => {
        const res = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(email);
        expect(res.body.user.name).toBe('Julián');
    });

    it('debería eliminar el usuario (soft delete)', async () => {
        const res = await request(app)
            .delete('/api/users')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Usuario eliminado/);
    });

    it('debería permitir registrar de nuevo con el mismo email tras hard delete', async () => {
        const reusedEmail = `reuser${Date.now()}@test.com`;

        // Registro y validación
        const reg1 = await request(app)
            .post('/api/auth/register')
            .send({email: reusedEmail, password});

        expect(reg1.statusCode).toBe(201);

        const tempToken = reg1.body.token;

        // Hard delete
        const del = await request(app)
            .delete('/api/users?soft=false')
            .set('Authorization', `Bearer ${tempToken}`);

        expect(del.statusCode).toBe(200);

        // Nuevo intento de registro
        const reg2 = await request(app)
            .post('/api/auth/register')
            .send({email: reusedEmail, password});

        expect(reg2.statusCode).toBe(201);
    });
});