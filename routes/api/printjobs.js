const express = require('express');
const router = express.Router();
const PrintJob = require('../../PrintJob');

const Jobs = [];

// JSON/body parser middleware
router.use(express.json());

// add solid to job list
router.post('/', (req, res) => {
  const newPrintJob = new PrintJob(
    req.body.id,
    req.body.name,
    req.body.material,
    req.body.density
  );
  Jobs.push(newPrintJob);
  return res.redirect('/');
});

// delete print job from print queue
router.delete('/:id', (req, res) => {
  Jobs.forEach((job, i) => {
    if (req.params.id === job.jobId) {
      Jobs.splice(i, 1);
    }
  });
});

// get all print jobs
router.get('/', (req, res) => {
  return res.send(Jobs);
});

module.exports = { router, Jobs };
