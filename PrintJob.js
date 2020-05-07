const uuid = require('uuid');

class PrintJob {
  constructor(solidId, solidName, solidMaterial, solidDensity) {
    this.jobId = uuid.v4();
    this.solidId = solidId;
    this.solidMaterial = solidMaterial;
    this.solidName = solidName;
    this.printTime = Math.floor(Math.random() * 61 * (solidDensity * 0.01));
  }
}

module.exports = PrintJob;
