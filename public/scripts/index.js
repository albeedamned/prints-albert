const locationURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const solidForm = document.getElementById('solid-form');
const printTimeRemaining = document.getElementById('print-time');
const solidName = document.getElementById('solid-name');
const solidMaterial = document.getElementById('solid-material');
const printerImg = document.getElementById('printer-img');

// document.addEventListener('DOMContentLoaded', checkPrinterStatus());
document.addEventListener('DOMContentLoaded', loadEventListeners());

function loadEventListeners() {
  solidForm.addEventListener('submit', addPartFormSubmit);

  // density slider value
  const densityValue = document.getElementById('densityRange');
  const densityValueDisplay = document.getElementById('density-value');
  densityValueDisplay.innerText = densityValue.value;
  densityValue.addEventListener('change', () => {
    densityValueDisplay.innerText = densityValue.value;
  });

  // buttons on each solid li item
  const solidList = document.querySelectorAll('.solid-li');
  solidList.forEach((item) => {
    item
      .getElementsByClassName('remove-btn-solid')[0]
      .addEventListener('click', deletePartFromLibrary);

    item
      .getElementsByClassName('print-btn-solid')[0]
      .addEventListener('click', addPrintjobToQueue);
  });

  // buttons on each print job li item
  const printJobListItem = document.querySelectorAll('.print-job-li');
  printJobListItem.forEach((item) => {
    item
      .getElementsByClassName('remove-btn-pj')[0]
      .addEventListener('click', deletePrintJobFromQueue);
  });

  // print next print job button
  const startBtn = document.getElementById('printer-start');
  startBtn.addEventListener('click', printNextJob);
}

async function getAllPrintjobs() {
  // get print jobs from 'db'
  const response = await MakeRequest.get(`${locationURL}/api/printjobs/`);
  if (response.ok) return response.json();
  else throw new Error('Bad Solid Get Request');
}

async function getAllSolids() {
  // get print jobs from 'db'
  const response = await MakeRequest.get(`${locationURL}/api/solids/`);
  if (response.ok) return response.json();
  else throw new Error('Bad Solid Get Request');
}

async function getSingleSolid(id) {
  // get solid from 'db'
  const response = await MakeRequest.getSingle(
    `${locationURL}/api/solids/`,
    `${id}`
  );
  if (response.ok) return response.json();
  else throw new Error('Bad Solid Get Single Request');
}

async function addPartFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name-field');
  const material = document.getElementById('material-field');
  const density = document.getElementById('densityRange');

  const response = await MakeRequest.post(`${locationURL}/api/solids`, {
    name: name.value,
    material: material.value,
    density: density.value
  });

  if (response.ok) {
    name.value = '';
    material.value = 'Plastic';
    density.value = '50';
    DOMStuff.refreshSolidUL();
  } else throw new Error('Bad Solid Post Request');
}

async function deletePartFromLibrary(e) {
  // remove from 'db'
  const delSolidId = e.target.nextElementSibling.nextElementSibling.innerText;
  const response = await MakeRequest.delete(
    `${locationURL}/api/solids/`,
    `${delSolidId}`
  );
  if (response.ok) DOMStuff.refreshSolidUL();
  else throw new Error('Bad Solid Delete Request');
}

async function addPrintjobToQueue(e) {
  // get solid to print
  const queueSolidId = e.target.nextElementSibling.innerText;
  const singleSolid = await getSingleSolid(queueSolidId);
  const solidToPrint = singleSolid[0];

  // make post request to /api/printjobs with solid
  const response = await MakeRequest.post(
    `${locationURL}/api/printjobs`,
    solidToPrint
  );
  if (response.ok) DOMStuff.refreshPrintJobUL();
  else throw new Error('Bad Print Job Post Request');
}

async function deletePrintJobFromQueue(e) {
  // id of print job to delete
  const delPrintJobId = e.target.nextElementSibling.innerText;
  const response = await MakeRequest.delete(
    `${locationURL}/api/printjobs/`,
    `${delPrintJobId}`
  );
  if (response.ok) DOMStuff.refreshPrintJobUL();
  else throw new Error('Bad Print Job Delete Request');
}

async function printNextJob() {
  const printJobs = await getAllPrintjobs();
  if (
    printJobs.length > 0 &&
    (printTimeRemaining.innerText === '0' ||
      printTimeRemaining.innerText === 'Print Finished!')
  ) {
    // get next print job
    const currentPrintJob = printJobs[0];
    localStorage.setItem('currentPrintJobName', currentPrintJob.solidName);
    localStorage.setItem(
      'currentPrintJobMaterial',
      currentPrintJob.solidMaterial
    );

    // update current print info
    DOMStuff.updateCurrentPrintInfo(currentPrintJob);

    // remove from job list and DOM
    const response = await MakeRequest.delete(
      `${locationURL}/api/printjobs/`,
      `${currentPrintJob.id}`
    );
    if (response.ok)
      DOMStuff.removeTarget(document.getElementsByClassName('print-job-li')[0]);
    else throw new Error('Bad Print Job Delete Request');

    // countdown timer on screen
    const currentPrintJobTime = currentPrintJob.printTime;
    countdownPrintTime(currentPrintJobTime);
  } else {
    printTimeRemaining.innerText = 'No Job Queued!';
  }
}

function countdownPrintTime(currentJobPrintTime) {
  const totalPrintTime = currentJobPrintTime;
  let timeRemaining = totalPrintTime;

  setTimeout(() => {
    printerImg.src = 'images/3dPrinter.gif';
  }, 900);

  const timer = setInterval(() => {
    printTimeRemaining.innerText = `${timeRemaining}`;
    localStorage.setItem('timeRemaining', timeRemaining);
    timeRemaining -= 1;
    if (timeRemaining < 0) {
      printTimeRemaining.innerText = 'Print Finished!';
      printerImg.src = 'images/fullPrinter.png';
      clearInterval(timer);
    }
  }, 1000);
}

function checkPrinterStatus() {
  const timeRemaining = localStorage.getItem('timeRemaining');

  // continue current print
  if (timeRemaining > 0) {
    solidName.innerText = ` ${localStorage.getItem('currentPrintJobName')}`;
    solidMaterial.innerText = ` ${localStorage.getItem(
      'currentPrintJobMaterial'
    )}`;
    printTimeRemaining.innerText = timeRemaining;
    countdownPrintTime(timeRemaining);
  }
}

class DOMStuff {
  static async refreshSolidUL() {
    const solidUl = document.getElementById('solid-list');
    const solids = await getAllSolids();
    solidUl.innerHTML = '';
    if (solids.length > 0) {
      solids.forEach((solid) => {
        const newLi = document.createElement('li');
        newLi.classList.add(
          'list-group-item',
          'd-flex',
          'justify-content-between',
          'align-items-center',
          'solid-li'
        );
        newLi.innerHTML = `
        <span>
          <text class="li-name">${solid.name}</text>
          <br>
          <small class="li-detail">Material: ${solid.material}</small>
          <br>
          <small class="li-detail">Density: ${solid.density}%</small>
        </span>
        <span>
          <button id="remove-${solid.id}" class="btn-primary btn remove-btn-pj">Remove</button>
          <button id="print-${solid.id}" class="btn-primary btn remove-btn-pj ml-1">Print</button>
          <small class="hidden-id">${solid.id}</small>
        </span>`;
        solidUl.appendChild(newLi);

        // add listeners for buttons
        const removeButton = document.getElementById(`remove-${solid.id}`);
        removeButton.addEventListener('click', deletePartFromLibrary);
        const printButton = document.getElementById(`print-${solid.id}`);
        printButton.addEventListener('click', addPrintjobToQueue);
      });
    }
  }

  static async refreshPrintJobUL() {
    const pjUl = document.getElementById('pj-list');
    const printJobs = await getAllPrintjobs();
    pjUl.innerHTML = '';
    if (printJobs.length > 0) {
      printJobs.forEach((job) => {
        const newLi = document.createElement('li');
        newLi.classList.add(
          'list-group-item',
          'd-flex',
          'justify-content-between',
          'align-items-center',
          'print-job-li'
        );
        newLi.innerHTML = `
        <span>
          <text class="li-name">${job.solidName}</text>
          <br>
          <small class="li-detail">Material: ${job.solidMaterial}</small>
          <br>
          <small class="li-detail">Print Time: ${job.printTime} seconds</small>
        </span>
        <span>
          <button id="${job.id}" class="btn-primary btn remove-btn-pj">Remove</button>
          <small class="hidden-id">${job.id}</small>
        </span>`;
        pjUl.appendChild(newLi);

        // add listener for remove button
        const button = document.getElementById(`${job.id}`);
        button.addEventListener('click', deletePrintJobFromQueue);
      });
    }
  }

  static removeTarget(target) {
    target.remove();
    return target;
  }

  static updateCurrentPrintInfo(currentPrintJob) {
    printTimeRemaining.innerText = 'Starting Print';
    solidName.innerText = ` ${currentPrintJob.solidName}`;
    solidMaterial.innerText = `${currentPrintJob.solidMaterial}`;
  }
}

class MakeRequest {
  static async get(endpoint) {
    return await fetch(endpoint);
  }

  static async getSingle(endpoint, param) {
    return await fetch(`${endpoint}${param}`);
  }

  static async post(endpoint, body) {
    return await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  static async delete(endpoint, param) {
    return await fetch(`${endpoint}${param}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' }
    });
  }
}
