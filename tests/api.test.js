const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models/db');

let token = '';
let productId = '';
let cartId = '';

beforeAll((done) => {
  
  db.serialize(() => {
    db.run('DELETE FROM users');
    db.run('DELETE FROM products');
    db.run('DELETE FROM carts');
    db.run('DELETE FROM cart_items', done);
  });
});

describe('API de Carrinho com Estoque Reativo', () => {
  it('Deve registrar um novo usuário', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Admin',
      email: 'admin@admin.com',
      password: '12345678'
    });
    expect(res.statusCode).toBe(201);
  });

  it('Deve fazer login e retornar token', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'admin@admin.com',
      password: '12345678'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('Deve criar um produto', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .set('adminsecret', process.env.ADMIN_SECRET)
      .send({
        name: 'Camisa Azul',
        stock: 10
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    productId = res.body.id;
  });

  it('Deve listar produtos', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Deve criar um carrinho', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    cartId = res.body.id;
  });

  it('Deve adicionar produto ao carrinho', async () => {
    const res = await request(app)
      .post('/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cart_id: cartId,
        product_id: productId,
        quantity: 2
      });
    expect(res.statusCode).toBe(201);
  });

  it('Deve finalizar compra e reduzir estoque', async () => {
    const res = await request(app)
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cart_id: cartId
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
