const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const db = require('../../db');

// middleware function to validate solid
const validSolid = (req, res, next) => {
  const solid = req.body;
  const hasName = typeof solid.name === 'string' && solid.name !== '';
  const hasMaterial =
    typeof solid.material === 'string' && solid.material !== '';
  const hasDensity = typeof solid.density === 'string' && solid.density !== '';
  if (hasName && hasMaterial && hasDensity) next();
  else res.status(400).json({ error: 'Invalid Solid Configuration' });
};

// get all solids
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM solids');
    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t get solids'});
  }
});

//get single solid
router.get('/:id', async (req, res) => {
  const singleSolidId = [req.params.id];
  try {
    const { rows } = await db.query('SELECT * FROM solids WHERE id = $1', singleSolidId);
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t get solid'});
  }
});

// create new solid
router.post('/', validSolid, async (req, res) => {
  const newSolid = [uuid.v4(), req.body.name, req.body.material, req.body.density];
  try {
    const { rows } = await db.query('INSERT INTO solids(id, name, material, density) \
    VALUES($1, $2, $3, $4) RETURNING *', newSolid);
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t create solid'});
  }
});

// delete solid
router.delete('/:id', async (req, res) => {
  const singleSolidId = [req.params.id];
  try {
    const { rows } = await db.query('DELETE FROM solids WHERE id = $1 RETURNING *', singleSolidId);
    if (rows.length === 0) res.send({error: 'solid not found'});
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t delete solid'});
  }
});

module.exports = { router };
