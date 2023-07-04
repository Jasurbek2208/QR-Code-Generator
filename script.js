let QR_CODE_LINK = '';
const API_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=';

const image = document.querySelector(".content-body__image");

const input = document.getElementById("text-input");
const button = document.getElementById("btn");

const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");

// Sending btn function
button.addEventListener("click", async () => {
  if (!input.value) {
    alert('No text entered!');
    return;
  }

  try {
    const response = await fetch(API_URL + input.value, { method: 'GET' });
    image.src = response.url;
    QR_CODE_LINK = response.url;
    activateBtn(true);

  } catch (error) {
    activateBtn(false);
  }
});

// Copy QR-Code Link
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(QR_CODE_LINK);
});

// Download QR-Code Image
downloadBtn.addEventListener('click', async () => {
  const response = await fetch(QR_CODE_LINK);
  const blob = await response.blob();
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "QR-Code.png";
  downloadLink.click();
});

// Action buttons toggles
function activateBtn(is_success) {
  if (is_success) {
    copyBtn.classList.remove('no-hover');
    copyBtn.classList.add('active');
    copyBtn.removeAttribute('disabled');

    downloadBtn.classList.remove('no-hover');
    downloadBtn.classList.add('active');
    downloadBtn.removeAttribute('disabled');
  } else {
    image.src = "";

    copyBtn.classList.add('no-hover');
    copyBtn.classList.remove('active');
    copyBtn.setAttribute('disabled', true);

    downloadBtn.classList.add('no-hover');
    downloadBtn.classList.remove('active');
    downloadBtn.setAttribute('disabled', true);
  }
}