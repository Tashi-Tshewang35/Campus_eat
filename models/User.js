const db = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser({ name, email, password, verificationToken }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return db.one(
    `INSERT INTO users (name, email, password_hash, verification_token)
     VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_verified`,
    [name, email, passwordHash, verificationToken]
  );
}

async function findByEmail(email) {
  return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
}

async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

async function markVerified(token) {
  return db.oneOrNone(
    `UPDATE users SET is_verified = true, verification_token = NULL
     WHERE verification_token = $1 RETURNING id, name, role`,
    [token]
  );
}

module.exports = { createUser, findByEmail, verifyPassword, markVerified };

async function promoteToAdmin(userId, restaurantId) {
  return db.tx(async (t) => {
    await t.none("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
    await t.none('UPDATE restaurants SET owner_id = $1 WHERE id = $2', [userId, restaurantId]);
  });
}

module.exports.promoteToAdmin = promoteToAdmin;

async function setResetToken(email, token, expires) {
  return db.oneOrNone(
    `UPDATE users SET reset_token = $1, reset_token_expires = $2
     WHERE email = $3 RETURNING id`,
    [token, expires, email]
  );
}

async function findByResetToken(token) {
  return db.oneOrNone(
    `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );
}

async function resetPassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return db.none(
    `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

module.exports.setResetToken = setResetToken;
module.exports.findByResetToken = findByResetToken;
module.exports.resetPassword = resetPassword;
