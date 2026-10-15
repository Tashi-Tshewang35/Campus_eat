jest.mock('../config/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(),
}));

const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const { sendVerificationEmail } = require('../config/mailer');

const email = 'signup.tester.sherubtse@rub.edu.bt';

afterEach(() => sendVerificationEmail.mockClear());

afterAll(async () => {
  await db.none('DELETE FROM users WHERE email = $1', [email]);
  await db.$pool.end();
});

describe('POST /signup', () => {
  it('creates an unverified account and hands a verification token to the mailer', async () => {
    const res = await request(app)
      .post('/signup')
      .type('form')
      .send({ name: 'Signup Tester', email, password: 'testpass123' });

    expect(res.status).toBe(200);
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(sendVerificationEmail).toHaveBeenCalledWith(email, expect.any(String));

    const user = await db.one('SELECT is_verified, verification_token FROM users WHERE email = $1', [email]);
    const tokenSent = sendVerificationEmail.mock.calls[0][1];
    expect(user.is_verified).toBe(false);
    expect(user.verification_token).toBe(tokenSent);
  });

  it('rejects a non-Sherubtse email without creating a user or sending any email', async () => {
    const res = await request(app)
      .post('/signup')
      .type('form')
      .send({ name: 'Outsider', email: 'someone@gmail.com', password: 'testpass123' });

    expect(res.text).toContain('Sherubtse College email');
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    const row = await db.oneOrNone('SELECT id FROM users WHERE email = $1', ['someone@gmail.com']);
    expect(row).toBeNull();
  });
});
