const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user.model');

describe('Client endpoints', () => {
    let token;
    let clientId;
    const password = '12345678';
    const email = `clientuser${Date.now()}@test.com`;

    jest.setTimeout(20000);

    beforeAll(async () => {
        // Registro
        const register = await request(app)
            .post('/api/auth/register')
            .send({email, password});

        token = register.body.token;

        // Validar email
        const user = await User.findOne({email});
        await request(app)
            .post('/api/auth/validate-email')
            .set('Authorization', `Bearer ${token}`)
            .send({code: user.validationCode});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('debería crear un cliente', async () => {
        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Test',
                email: 'cliente@test.com',
                phone: '666555444',
                address: 'Calle Falsa 123',
                cif: '12345678H'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'Cliente Test');
        expect(res.body).toHaveProperty('_id');
        clientId = res.body._id;
    });

    it('debería obtener todos los clientes', async () => {
        const res = await request(app)
            .get('/api/clients')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('debería obtener un cliente por ID', async () => {
        expect(clientId).toBeDefined();

        const res = await request(app)
            .get(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', clientId);
    });

    it('debería actualizar un cliente', async () => {
        const res = await request(app)
            .put(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({name: 'Cliente Actualizado'});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Cliente Actualizado');
    });

    it('debería eliminar un cliente', async () => {
        const res = await request(app)
            .delete(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
    });
});