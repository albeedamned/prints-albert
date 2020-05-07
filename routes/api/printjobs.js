const express = require('express');
const router = express.Router();
const PrintJob = require('../../object-classes/PrintJob');

const Jobs = [];

// JSON/body parser middleware
router.use(express.json());

// add solid to job list
router.post('/', (req, res) => {
  if (validPrintJob(req.body)) {
    const newPrintJob = new PrintJob(
      req.body.id,
      req.body.name,
      req.body.material,
      req.body.density
    );
    Jobs.push(newPrintJob);
    return res.redirect('/');
  } else return res.json({ messsge: 'Error - Invalid Print Job' });
});

// delete print job from print queue
router.delete('/:id', (req, res) => {
  const found = Jobs.some((job) => job.id === req.params.id);
  if (found) {
    Jobs.forEach((job, i) => {
      if (req.params.id === job.id) {
        Jobs.splice(i, 1);
      }
    });
  } else return res.status(400).json({ msg: 'Print Job Not Found' });
});

// get all print jobs
router.get('/', (req, res) => {
  return res.send(Jobs);
});

function validPrintJob(printJob) {
  const hasId = typeof printJob.id === 'string' && printJob.name !== '';
  const hasName = typeof printJob.name === 'string' && printJob.name !== '';
  const hasMaterial =
    typeof printJob.material === 'string' && printJob.material !== '';
  const hasDensity =
    typeof printJob.density === 'string' && printJob.density !== '';
  return hasId && hasName && hasMaterial && hasDensity;
}

module.exports = { router, Jobs };
