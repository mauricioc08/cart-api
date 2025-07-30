const request = require('supertest');
const app = require('../src/app');
require('dotenv').config();

describe('Controle de concorrência no checkout', () => {
  let token;
  let cartId;
  let productId;

  beforeAll(async () => {
    await request(app).post('/auth/register').send({
      name: 'Teste Concorrencia',
      email: 'concorrencia@example.com',
      password: '123456'
    });

    const login = await request(app).post('/auth/login').send({
      email: 'concorrencia@example.com',
      password: '123456'
    });
    token = login.body.token;

    const product = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .set('adminsecret', process.env.ADMIN_SECRET)
      .send({
        name: 'Produto Concorrencia',
        stock: 5
      });
    productId = product.body.id;

    const cart = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`);
    cartId = cart.body.id;

    await request(app)
      .post('/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cart_id: cartId,
        product_id: productId,
        quantity: 2
      });
  });

  it('Deve impedir dois checkouts simultâneos no mesmo carrinho', async () => {

    const [res1, res2] = await Promise.all([
      request(app)
        .post('/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({ cart_id: cartId }),
      request(app)
        .post('/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({ cart_id: cartId })
    ]);

    expect([200, 409]).toContain(res1.statusCode);

    expect([200, 409]).toContain(res2.statusCode);
    
    expect(res1.statusCode).not.toBe(res2.statusCode);
  });
});
