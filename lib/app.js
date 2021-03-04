const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const { getPlants, mungePlants } = require('./utils');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

app.get('/api/plants', async(req, res) => {
  try {
    const data = await getPlants(req.query.search);
    const mungedData = mungePlants(data);
    
    res.json(mungedData);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/faves', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT *
    FROM plants
    WHERE user_id = $1
    `,
    [
      req.userId
    ]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/faves/:id', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT *
    FROM plants
    WHERE user_id = $1
    AND _id = $2
    `,
    [
      req.userId,
      req.params.id
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/faves/:id', async(req, res) => {
  try {
    const data = await client.query(`
    DELETE
    FROM plants
    WHERE user_id = $1
    AND _id = $2
    `,
    [
      req.userId,
      req.params.id
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/faves', async(req, res) => {
  try {
    const {
      id,
      common_name,
      scientific_name,
      year,
      family_common_name,
      image_url,
      genus,
      family
    } = req.body;
    const data = await client.query(`
    INSERT INTO plants (
      id,
      common_name,
      scientific_name,
      year,
      family_common_name,
      image_url,
      genus,
      family,
      user_id
      )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,
    [
      id,
      common_name,
      scientific_name,
      year,
      family_common_name,
      image_url,
      genus,
      family,
      req.userId
    ]);

    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.detail });
  }
});

app.put('/api/faves/:id', async(req, res) => {
  try {
    const {
      id,
      common_name,
      scientific_name,
      year,
      family_common_name,
      image_url,
      genus,
      family
    } = req.body;
    const data = await client.query(`
    UPDATE plants
    SET id = $1,
      common_name = $2,
      scientific_name = $3,
      year = $4,
      family_common_name = $5,
      image_url = $6,
      genus = $7,
      family = $8
    WHERE _id = $9
    AND user_id = $10
    RETURNING *
  `,
    [
      id,
      common_name,
      scientific_name,
      year,
      family_common_name,
      image_url,
      genus,
      family,
      req.params.id,
      req.userId
    ]);

    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
