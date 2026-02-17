// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const bcrypt = require('bcrypt');

const app = express();

app.get('/health', (req, res) => res.status(200).send('ok'));

// allow JSON bodies (POST/PUT)
app.use(express.json());

app.use(
  cors({
    origin: true, //process.env.FRONTEND_URL,
    credentials: true,
  }),
);

/* // allow requests from your React dev server (Vite default port is 5173)
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
); */

app.set('trust proxy', 1);

const sessionStore = new MySQLStore({}, pool);

app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

/* // quick health check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is running' });
}); */

// ✅ DB health check
app.get('/api/db-health', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS db_ok');
    res.json({ ok: true, rows });
  } catch (err) {
    next(err);
  }
});

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

// who am I?
app.get('/api/auth/me', async (req, res, next) => {
  try {
    if (!req.session.userId) return res.json({ ok: true, user: null });

    const [rows] = await pool.execute(
      'SELECT id, email FROM users WHERE id = ?',
      [req.session.userId],
    );
    if (!rows.length) return res.json({ ok: true, user: null });

    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
});

// register
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const password =
      typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: 'email and password required' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, password_hash],
    );

    req.session.userId = result.insertId;
    res.status(201).json({ ok: true, user: { id: result.insertId, email } });
  } catch (err) {
    if (String(err?.code) === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'Email already exists' });
    }
    next(err);
  }
});

// login
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const password =
      typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: 'email and password required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email],
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/applications', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    // normalize inputs
    const rawStatus = req.query.status;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const sort =
      typeof req.query.sort === 'string' ? req.query.sort.trim() : '';

    const statuses = Array.isArray(rawStatus)
      ? rawStatus.map((s) => String(s).trim()).filter(Boolean)
      : typeof rawStatus === 'string'
        ? [rawStatus.trim()].filter(Boolean)
        : [];

    let sql = 'SELECT * FROM applications';
    const params = [];
    const where = [];

    // ✅ only this user's data
    where.push('user_id = ?');
    params.push(userId);

    // status filter
    if (statuses.length === 1) {
      where.push('status = ?');
      params.push(statuses[0]);
    } else if (statuses.length > 1) {
      where.push(`status IN (${statuses.map(() => '?').join(',')})`);
      params.push(...statuses);
    }

    // search filter
    if (q) {
      where.push('(company LIKE ? OR title LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += ' WHERE ' + where.join(' AND ');

    // sort direction (whitelist)
    const order = sort === 'asc' ? 'ASC' : 'DESC';

    // whitelist allowed sort columns
    const allowedSortFields = [
      'applied_date',
      'created_at',
      'company',
      'status',
    ];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : 'applied_date';

    // NULL handling for applied_date
    if (sortBy === 'applied_date') {
      sql += ` ORDER BY (applied_date IS NULL) ASC, applied_date ${order}, id ${order}`;
    } else {
      sql += ` ORDER BY ${sortBy} ${order}, id ${order}`;
    }

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/applications', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { company, title, url, status, applied_date, notes } = req.body;

    if (!company || !title || !status) {
      return res.status(400).json({
        ok: false,
        error: 'company, title, and status are required',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO applications (user_id, company, title, url, status, applied_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company,
        title,
        url || null,
        status,
        applied_date || null,
        notes || null,
      ],
    );

    const [rows] = await pool.execute(
      'SELECT * FROM applications WHERE id = ? AND user_id = ?',
      [result.insertId, userId],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/applications/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM applications WHERE id = ? AND user_id = ?',
      [id, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.put('/api/applications/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { company, title, url, status, applied_date, notes } = req.body;

    if (!company || !title || !status) {
      return res.status(400).json({
        ok: false,
        error: 'company, title, and status are required',
      });
    }

    const [result] = await pool.execute(
      `UPDATE applications
       SET company = ?, title = ?, url = ?, status = ?, applied_date = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        company,
        title,
        url || null,
        status,
        applied_date || null,
        notes || null,
        id,
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM applications WHERE id = ? AND user_id = ?',
      [id, userId],
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// basic error handler (so you see errors as JSON)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err.message });
});

const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

/* const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
}); */
const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
