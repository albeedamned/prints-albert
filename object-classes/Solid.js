const uuid = require('uuid');

class Solid {
  constructor(name, material, density) {
    this.id = uuid.v4();
    this.name = name;
    this.material = material;
    this.density = density;
  }
}

module.exports = Solid;
