const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user.model');

describe('Project endpoints', () => {
    let token;
    let projectId;
    let clientId;

    const email = `projectuser${Date.now()}@test.com`;
    const password = '12345678';

    jest.setTimeout(20000);

    beforeAll(async () => {
        // Registrar y validar usuario
        const register = await request(app)
            .post('/api/auth/register')
            .send({email, password});

        token = register.body.token;

        const user = await User.findOne({email});
        await request(app)
            .post('/api/auth/validate-email')
            .set('Authorization', `Bearer ${token}`)
            .send({code: user.validationCode});

        // Crear cliente necesario para el proyecto
        const clientRes = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Proyecto',
                email: `cliente${Date.now()}@test.com`,
                phone: '600000000',
                address: 'Calle Cliente 1',
                cif: '87654321Z'
            });

        expect(clientRes.statusCode).toBe(201);
        clientId = clientRes.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('debería crear un proyecto', async () => {
        expect(clientId).toBeDefined();

        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Proyecto Test',
                client: clientId
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'Proyecto Test');
        expect(res.body).toHaveProperty('_id');
        projectId = res.body._id;
    });

    it('debería obtener todos los proyectos', async () => {
        const res = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('debería obtener un proyecto por ID', async () => {
        expect(projectId).toBeDefined();

        const res = await request(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', projectId);
    });

    it('debería actualizar un proyecto', async () => {
        const res = await request(app)
            .put(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({name: 'Proyecto Actualizado'});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Proyecto Actualizado');
    });

    it('debería eliminar un proyecto', async () => {
        const res = await request(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
    });
});