const express = require('express');
const router = express.Router();
const Solid = require('../../object-classes/Solid');

const Solids = [
  {
    name: 'Solid 1',
    material: 'Plastic',
    density: '20',
    id: 'b65cce18-a070-43ac-b3a6-2ffbfc2c103c'
  },
  {
    name: 'Solid 2',
    material: 'Metal',
    density: '50',
    id: 'hasd9f73-jf86-kf09-f755-asdf9yh3ongo'
  }
];

// JSON/body parser middleware
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

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

router.post('/', validSolid, (req, res) => {
  const newSolid = new Solid(
    req.body.name,
    req.body.material,
    req.body.density
  );
  Solids.push(newSolid);
  res.status(200).send(newSolid);
});

// delete solid
router.delete('/:id', (req, res) => {
  const found = Solids.some((solid) => solid.id === req.params.id);
  if (found) {
    Solids.forEach((solid, i) => {
      if (req.params.id === solid.id) {
        Solids.splice(i, 1);
        return res.status(200).send(solid);
      }
    });
  } else return res.status(400).json({ msg: 'Solid Not Found' });
});

// get all Solids
router.get('/', (req, res) => {
  return res.status(200).json(Solids);
});

//get single solid
router.get('/:id', (req, res) => {
  const found = Solids.some((solid) => solid.id === req.params.id);
  if (found) {
    return res
      .status(200)
      .send(Solids.filter((solid) => solid.id === req.params.id));
  } else return res.status(400).json({ msg: 'Solid Not Found' });
});

module.exports = { router, Solids };
