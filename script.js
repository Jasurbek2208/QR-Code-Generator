let QR_CODE_LINK = '';
let CAMERA_IS_OPEN = false;
const API_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=';

const root = document.querySelector(".root");

const image = document.querySelector(".content-body__image");

const input = document.getElementById("text-input");
const button = document.getElementById("btn");

const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");

const cameraBtn = document.getElementById("btn-camera");
const videoElement = document.getElementById('videoElement');

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
copyBtn.addEventListener('click', copyText);

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

// Camera button click event
cameraBtn.addEventListener('click', () => {
  CAMERA_IS_OPEN = !CAMERA_IS_OPEN;

  if (!CAMERA_IS_OPEN) {
    cameraBtn.innerText = "Using the device's camera";
    cameraBtnToggler(CAMERA_IS_OPEN);
    return;
  }

  QR_CODE_LINK = "";
  cameraBtn.innerText = "Disable the device camera";
  cameraBtnToggler(CAMERA_IS_OPEN);
  startCamera();

})

function cameraBtnToggler(camera_is_open) {
  if (camera_is_open) {
    image.classList.remove('active');
    videoElement.classList.add('active');
  } else {
    image.classList.add('active');
    videoElement.classList.remove('active');
    videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }
}

function copyText() {
  navigator.clipboard.writeText(QR_CODE_LINK);
}

function startCamera() {
  const videoElement = document.getElementById('videoElement');

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
    });
}

function handleLoadedMetadata() {
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  const canvasElement = document.createElement('canvas');
  canvasElement.width = videoWidth;
  canvasElement.height = videoHeight;
  const canvasContext = canvasElement.getContext('2d');

  let intervalId = setInterval(() => {
    canvasContext.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
    const imageData = canvasContext.getImageData(0, 0, videoWidth, videoHeight);

    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const qrCode = new cv.QRCodeDetector();
    const decodedText = qrCode.detectAndDecode(gray);

    if (decodedText) {
      QR_CODE_LINK = decodedText;
      activateBtn(true);
      cameraBtnToggler(false);
      clearInterval(intervalId);

      renderModal();
    }

    src.delete();
    gray.delete();
  }, 100);
}

function renderModal() {
  const str = `
          <div class="modal-backfon" onclick="closeModal()"></div>
          <div class="modal">
            <header>
              <h1>Your scenered QR-Code</h1>
            </header>
            <main class="modal__content">
              <p>${QR_CODE_LINK}</p>
            </main>
            <footer class="modal__footer">
              <button type="button" class="content-body__button" onclick="closeModal()">
                  Close
              </button>
              <button type="button" class="content-body__button" onclick="copyText()">
                  Copy
              </button>
              <button type="button" class="content-body__button">
                  Open
              </button>
            </footer>
          </div>
  `

  root.innerHTML = str;
}

function closeModal() {
  root.innerHTML = "";
}
