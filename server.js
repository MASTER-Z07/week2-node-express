require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Bonus: custom middleware to log every request
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
}

app.use(requestLogger);

// JSON parsing
app.use(express.json());

// Static files (index: false so the GET / route below controls "/")
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// GET / -> "My Week 2 API!"
// Browsers get the static HTML page; curl/Postman get the plain text.
app.get('/', (req, res) => {
  if (req.accepts(['text', 'html']) === 'html') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.type('text/plain').send('My Week 2 API!');
});

// POST /user -> accepts {name, email}; responds "Hello, [name]!"
app.post('/user', (req, res) => {
  const { name, email } = req.body || {};

  if (
    typeof name !== 'string' || name.trim() === '' ||
    typeof email !== 'string' || email.trim() === ''
  ) {
    return res.status(400).json({ error: 'Both name and email are required.' });
  }

  res.type('text/plain').send(`Hello, ${name}!`);
});

// GET /user/:id -> "User [id] profile"
app.get('/user/:id', (req, res) => {
  res.type('text/plain').send(`User ${req.params.id} profile`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (e.g. malformed JSON -> 400)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});