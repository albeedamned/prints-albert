const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const db = require('../../db');

// middleware function to validate print job
const validPrintJob = (req, res, next) => {
  const printJob = req.body;
  const hasId = typeof printJob.id === 'string' && printJob.name !== '';
  const hasName = typeof printJob.name === 'string' && printJob.name !== '';
  const hasMaterial =
    typeof printJob.material === 'string' && printJob.material !== '';
  const hasDensity =
    typeof printJob.density === 'string' && printJob.density !== '';
  if (hasId && hasName && hasMaterial && hasDensity) next();
  else res.status(400).json({ error: 'Invalid Print Job' });
};

// get all print jobs
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM printjobs');
    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t get print jobs'});
  }
});

// add solid to job list
router.post('/', validPrintJob, async (req, res) => {
  const printTime = Math.floor(Math.random() * 61 * (req.body.density * 0.01));
  const newPrintJob = [uuid.v4(), req.body.id, req.body.name, req.body.material, printTime];
  try {
    const { rows } = await db.query('INSERT INTO printjobs(id, solid_id, solid_name, solid_material, print_time) \
    VALUES($1, $2, $3, $4, $5) RETURNING *', newPrintJob);
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t create print job'});
  }
});

// delete print job from print queue
router.delete('/:id', async (req, res) => {
  const singlePrintJobId = [req.params.id];
  try {
    const { rows } = await db.query('DELETE FROM printjobs WHERE id = $1 RETURNING *', 
      singlePrintJobId);
    if (rows.length === 0) res.send({error: 'solid not found'});
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(400).send({db_error: 'can\'t delete solid'});
  }
});

module.exports = { router };
