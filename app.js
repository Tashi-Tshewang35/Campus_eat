const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();



const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files and body parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions (must come before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'campus-eats-dev-secret',
  resave: false,
  saveUninitialized: false,
}));

// Make the logged-in user available to every view
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes (after sessions)
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Keep API failures JSON, including malformed JSON request bodies.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status === 500) console.error(err);
  const message = status === 500 ? 'Internal server error' : 'Invalid request';
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    return res.status(status).json({ error: message });
  }
  res.status(status).send(message);
});

// Start server (last)
app.listen(PORT, () => {
  console.log(`Campus Eats running at http://localhost:${PORT}`);
});
