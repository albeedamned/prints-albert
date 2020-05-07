const hostname = `http://${window.location.hostname}:${window.location.port}`;
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
      .addEventListener('click', printSolid);
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
  const response = await fetch(`${hostname}/api/printjobs/`);
  const printJobs = await response.json();
  return printJobs;
}

async function getSingleSolid(id) {
  // get solid from 'db'
  const response = await fetch(`${hostname}/api/solids/${id}`);
  const solid = await response.json();
  return solid;
}

async function deleteSolid(e) {
  // remove from document
  e.target.parentElement.parentElement.remove();

  // remove from 'db'
  const delSolidId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  await fetch(`${hostname}/api/solids/${delSolidId}`, {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' }
  });
}

async function printSolid(e) {
  // get solid to print
  const printSolidId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  const singleSolid = await getSingleSolid(printSolidId);
  const solidToPrint = singleSolid[0];

  // make post request to /api/printjobs with solid
  await fetch(`${hostname}/api/printjobs`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(solidToPrint)
  });

  location.reload();
}

async function deletePrintJob(e) {
  // remove from document
  e.target.parentElement.parentElement.remove();

  // remove from 'db'
  const delPrintJobId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  await fetch(`${hostname}/api/printjobs/${delPrintJobId}`, {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' }
  });
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

    // populate printer status
    printTimeRemaining.innerText = 'Starting Print';

    // remove from job list and DOM
    fetch(`${hostname}/api/printjobs/${currentPrintJob.id}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' }
    });
    document.getElementsByClassName('print-job-li')[0].remove();

    // add now printing info to DOM
    solidName.innerText = ` ${currentPrintJob.solidName}`;
    solidMaterial.innerText = ` ${currentPrintJob.solidMaterial}`;

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
