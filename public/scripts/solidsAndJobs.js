document.addEventListener('DOMContentLoaded', loadEventListeners());

function loadEventListeners() {
  // density slider value
  const densityValue = document.getElementById('densityRange');
  const densityValueDisplay = document.getElementById('density-value');
  densityValueDisplay.innerText = densityValue.value;
  densityValue.addEventListener('change', () => {
    densityValueDisplay.innerText = densityValue.value;
  });

  // buttons on each li item
  const solidList = document.querySelectorAll('.solid-li');
  solidList.forEach((item) => {
    item
      .getElementsByClassName('remove-btn-solid')[0]
      .addEventListener('click', deleteSolid);

    item
      .getElementsByClassName('print-btn-solid')[0]
      .addEventListener('click', printSolid);
  });

  const printJobListItem = document.querySelectorAll('.print-job-li');
  printJobListItem.forEach((item) => {
    item
      .getElementsByClassName('remove-btn-pj')[0]
      .addEventListener('click', deletePrintJob);
  });
}

async function getSingleSolid(id) {
  // get solid from 'db'
  const response = await fetch(`http://localhost:3000/api/solids/${id}`);
  const solid = await response.json();
  return solid;
}

async function deleteSolid(e) {
  // remove from document
  e.target.parentElement.parentElement.remove();

  // remove from 'db'
  const delSolidId =
    e.target.parentElement.previousSibling.childNodes[0].textContent;
  await fetch(`http://localhost:3000/api/solids/${delSolidId}`, {
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
  await fetch('http://localhost:3000/api/printjobs', {
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
  await fetch(`http://localhost:3000/api/printjobs/${delPrintJobId}`, {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' }
  });
}
