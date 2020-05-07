const URL = 'http://prints-albert.herokuapp.com';
const printTimeRemaining = document.getElementById('print-time');
const solidName = document.getElementById('solid-name');
const solidMaterial = document.getElementById('solid-material');
const printerImg = document.getElementById('printer-img');

document.addEventListener('DOMContentLoaded', checkPrinterStatus());
document.addEventListener('DOMContentLoaded', loadEventListeners());

function loadEventListeners() {
  const startBtn = document.getElementById('printer-start');
  startBtn.addEventListener('click', printNextJob);
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
    fetch(`${URL}/api/printjobs/${currentPrintJob.id}`, {
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

async function getAllPrintjobs() {
  // get print jobs from 'db'
  const response = await fetch(`${URL}/api/printjobs/`);
  const printJobs = await response.json();
  return printJobs;
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

// printer status
// pause button
// clear button
// pj history
// add solid stats to api
