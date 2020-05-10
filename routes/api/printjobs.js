const express = require('express');
const router = express.Router();
const PrintJob = require('../../object-classes/PrintJob');

const Jobs = [];

// JSON/body parser middleware
router.use(express.json());

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
  else res.json({ error: 'Invalid Print Job Configuration' });
};

// add solid to job list
router.post('/', validPrintJob, (req, res) => {
  const newPrintJob = new PrintJob(
    req.body.id,
    req.body.name,
    req.body.material,
    req.body.density
  );
  Jobs.push(newPrintJob);
  return res.send(newPrintJob);
});

// delete print job from print queue
router.delete('/:id', (req, res) => {
  const found = Jobs.some((job) => job.id === req.params.id);
  if (found) {
    Jobs.forEach((job, i) => {
      if (req.params.id === job.id) {
        Jobs.splice(i, 1);
        return res.send(job);
      }
    });
  } else return res.status(400).json({ msg: 'Print Job Not Found' });
});

// get all print jobs
router.get('/', (req, res) => {
  return res.send(Jobs);
});

module.exports = { router, Jobs };
