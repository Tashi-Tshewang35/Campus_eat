function requireAuth(req, res, next) {
  if (!req.session?.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden — restaurant admins only.');
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.session?.user) return res.redirect('/login');
  if (req.session.user.role !== 'superadmin') {
    return res.status(403).send('Forbidden — super admin only.');
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireSuperAdmin };

function requireAuthApi(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'You must be logged in to place an order.' });
  }
  next();
}
module.exports.requireAuthApi = requireAuthApi;
