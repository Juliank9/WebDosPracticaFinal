const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user.model');

describe('Albarán endpoints', () => {
    let token;
    let clientId;
    let projectId;
    let albaranId;
    jest.setTimeout(20000);

    const path = require('path');
    const email = `albaranuser${Date.now()}@test.com`;
    const password = '12345678';

    beforeAll(async () => {
        // Crear usuario y validar
        const register = await request(app)
            .post('/api/auth/register')
            .send({email, password});

        token = register.body.token;

        const user = await User.findOne({email});
        await request(app)
            .post('/api/auth/validate-email')
            .set('Authorization', `Bearer ${token}`)
            .send({code: user.validationCode});

        // Crear cliente
        const client = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Albarán',
                email: `clientealb${Date.now()}@mail.com`,
                phone: '600111222',
                address: 'Calle Cliente Albarán',
                cif: '98765432T',
            });

        expect(client.statusCode).toBe(201);
        clientId = client.body._id;

        // Crear proyecto
        const project = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Proyecto Albarán',
                client: clientId,
            });

        expect(project.statusCode).toBe(201);
        projectId = project.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('debería crear un albarán', async () => {
        const res = await request(app)
            .post('/api/albaranes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Entrega de materiales',
                description: 'Material entregado en obra',
                project: projectId,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('_id');

        albaranId = res.body._id;
        console.log('Albarán creado con ID:', albaranId);
    });

    it('debería obtener todos los albaranes', async () => {
        const res = await request(app)
            .get('/api/albaranes')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('debería obtener un albarán por ID', async () => {
        expect(albaranId).toBeDefined();

        const res = await request(app)
            .get(`/api/albaranes/${albaranId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', albaranId);
    });

    it('debería firmar un albarán subiendo una imagen', async () => {
        const imagePath = path.join(__dirname, '..', 'uploads', 'firma', 'firma.png');
        console.log('📸 Subiendo imagen desde:', imagePath);

        const res = await request(app)
            .patch(`/api/albaranes/${albaranId}/firma`)
            .set('Authorization', `Bearer ${token}`)
            .attach('firma', imagePath); // <-- 'firma' debe coincidir con el campo Multer

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Firma subida correctamente');
    });

    it('debería generar un PDF del albarán', async () => {
        expect(albaranId).toBeDefined();

        const res = await request(app)
            .get(`/api/albaranes/${albaranId}/pdf`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('application/pdf');
    });
});