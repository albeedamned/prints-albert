const hostname = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const printTimeRemaining = document.getElementById('print-time');
const solidName = document.getElementById('solid-name');
const solidMaterial = document.getElementById('solid-material');
const printerImg = document.getElementById('printer-img');

document.addEventListener('DOMContentLoaded', checkPrinterStatus());
document.addEventListener('DOMContentLoaded', loadEventListeners());

function loadEventListeners() {
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
      .addEventListener('click', deleteSolid);

    item
      .getElementsByClassName('print-btn-solid')[0]
      .addEventListener('click', addToQueue);
  });

  // buttons on each print job li item
  const printJobListItem = document.querySelectorAll('.print-job-li');
  printJobListItem.forEach((item) => {
    item
      .getElementsByClassName('remove-btn-pj')[0]
      .addEventListener('click', deletePrintJob);
  });

  // print next print job button
  const startBtn = document.getElementById('printer-start');
  startBtn.addEventListener('click', printNextJob);
}

async function getAllPrintjobs() {
  // get print jobs from 'db'
  const printJobs = MakeRequest.get(`${hostname}/api/printjobs/`);
  return printJobs;
}

async function getSingleSolid(id) {
  // get solid from 'db'
  const solid = MakeRequest.getSingle(`${hostname}/api/solids/`, `${id}`);
  return solid;
}

async function deleteSolid(e) {
  // remove from document
  DOMStuff.removeTarget(e.target.parentElement.parentElement);
  // remove from 'db'
  const delSolidId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  MakeRequest.delete(`${hostname}/api/solids/`, `${delSolidId}`);
}

async function addToQueue(e) {
  // get solid to print
  const addToQueueId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  const singleSolid = await getSingleSolid(addToQueueId);
  const solidToPrint = singleSolid[0];

  // make post request to /api/printjobs with solid
  const newPrintJobData = await MakeRequest.post(
    `${hostname}/api/printjobs`,
    solidToPrint
  );

  // add pj to dom
  DOMStuff.addPrintJobLi(newPrintJobData);
}

async function deletePrintJob(e) {
  // remove from document
  DOMStuff.removeTarget(e.target.parentElement.parentElement);

  // remove from 'db'
  const delPrintJobId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  MakeRequest.delete(`${hostname}/api/printjobs/`, `${delPrintJobId}`);
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
    MakeRequest.delete(`${hostname}/api/printjobs/`, `${currentPrintJob.id}`);
    DOMStuff.removeTarget(document.getElementsByClassName('print-job-li')[0]);

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
  static removeTarget(target) {
    target.remove();
    return target;
  }

  static addPrintJobLi(newPj) {
    const pjUl = document.getElementById('pj-list');
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
      <text class="pj-id">${newPj.id}</text>
      <text class="li-name">${newPj.solidName}</text>
      <br>
      <small class="li-detail">Material: ${newPj.solidMaterial}</small>
      <br>
      <small class="li-detail">Print Time: ${newPj.printTime}</small>
      <small class="li-detail">Seconds</small>
    </span>
    <span>
      <button id="${newPj.id}" class="btn-primary btn remove-btn-pj">Remove</button>
    </span>`;
    pjUl.appendChild(newLi);

    // add listener for remove button
    const button = document.getElementById(`${newPj.id}`);
    button.addEventListener('click', function (e) {
      DOMStuff.removeTarget(e.target.parentElement.parentElement);
      MakeRequest.delete(`${hostname}/api/printjobs/`, `${newPj.id}`);
    });
  }

  static updateCurrentPrintInfo(currentPrintJob) {
    printTimeRemaining.innerText = 'Starting Print';
    solidName.innerText = ` ${currentPrintJob.solidName}`;
    solidMaterial.innerText = `${currentPrintJob.solidMaterial}`;
  }
}

class MakeRequest {
  static async get(endpoint) {
    const response = await fetch(endpoint);
    const resData = await response.json();
    return resData;
  }

  static async getSingle(endpoint, param) {
    const response = await fetch(`${endpoint}${param}`);
    const resData = await response.json();
    return resData;
  }

  static async post(endpoint, body) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const resData = await response.json();
    return resData;
  }

  static async delete(endpoint, param) {
    const response = await fetch(`${endpoint}${param}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' }
    });
    const resData = await response.json();
    return resData;
  }
}
