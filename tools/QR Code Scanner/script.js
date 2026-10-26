
const cameraTab = document.getElementById("cameraTab");
const uploadTab = document.getElementById("uploadTab");
const cameraPanel = document.getElementById("cameraPanel");
const uploadPanel = document.getElementById("uploadPanel");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const qrFile = document.getElementById("qrFile");
const scanImageBtn = document.getElementById("scanImageBtn");

const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");

const statusMessage = document.getElementById("status");
const resultPanel = document.getElementById("resultPanel");
const scanResult = document.getElementById("scanResult");
const copyBtn = document.getElementById("copyBtn");
const openLink = document.getElementById("openLink");

document.getElementById("year").textContent =
  new Date().getFullYear();

let scanner = null;
let cameraRunning = false;
let scanningImage = false;
let selectedFile = null;
let currentResult = "";
let activeObjectURL = null;

function setStatus(message) {
  statusMessage.textContent = message;
}

function showResult(text) {
  currentResult = text;
  scanResult.value = text;
  resultPanel.hidden = false;

  openLink.hidden = true;
  openLink.removeAttribute("href");

  // Only offer direct opening for HTTP or HTTPS URLs.
  try {
    const url = new URL(text);

    if (url.protocol === "https:" || url.protocol === "http:") {
      openLink.href = url.href;
      openLink.hidden = false;
    }
  } catch {
    // The QR result is text, not a valid absolute URL.
  }
}

function clearResult() {
  currentResult = "";
  scanResult.value = "";
  resultPanel.hidden = true;
  openLink.hidden = true;
  openLink.removeAttribute("href");
}

function switchTab(tab) {
  const showCamera = tab === "camera";

  if (cameraRunning && !showCamera) {
    stopCamera();
  }

  cameraPanel.hidden = !showCamera;
  uploadPanel.hidden = showCamera;

  cameraTab.classList.toggle("active", showCamera);
  uploadTab.classList.toggle("active", !showCamera);

  clearResult();
  setStatus(
    showCamera
      ? "Ready to scan using your camera."
      : "Choose an image containing a QR code."
  );
}

cameraTab.addEventListener("click", () => {
  switchTab("camera");
});

uploadTab.addEventListener("click", () => {
  switchTab("upload");
});

async function stopCamera() {
  if (!scanner || !cameraRunning) {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cameraRunning = false;
    return;
  }

  try {
    await scanner.stop();
  } catch (error) {
    console.warn("Camera stop notice:", error);
  }

  cameraRunning = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  setStatus("Camera stopped.");
}

startBtn.addEventListener("click", async () => {
  if (typeof Html5Qrcode === "undefined") {
    setStatus(
      "Scanner library failed to load. Check your internet connection and refresh the page."
    );
    return;
  }

  startBtn.disabled = true;
  setStatus("Starting camera. Please allow camera permission.");

  try {
    if (!scanner) {
      scanner = new Html5Qrcode("reader");
    }

    await scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1
      },
      async (decodedText) => {
        if (!cameraRunning) return;

        showResult(decodedText);
        setStatus("QR code scanned successfully.");
        await stopCamera();
      },
      () => {
        // Frame-by-frame scan failures are normal while searching.
      }
    );

    cameraRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    setStatus("Camera active. Point it at a QR code.");
  } catch (error) {
    cameraRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;

    setStatus(
      "Could not start the camera. Check browser permission and make sure the page is served through localhost or HTTPS."
    );

    console.error("Camera error:", error);
  }
});

stopBtn.addEventListener("click", stopCamera);

qrFile.addEventListener("change", () => {
  const file = qrFile.files && qrFile.files[0];

  selectedFile = file || null;
  scanImageBtn.disabled = !selectedFile;
  imagePreview.hidden = true;

  if (activeObjectURL) {
    URL.revokeObjectURL(activeObjectURL);
    activeObjectURL = null;
  }

  if (!selectedFile) {
    setStatus("No image selected.");
    return;
  }

  if (!selectedFile.type.startsWith("image/")) {
    selectedFile = null;
    qrFile.value = "";
    scanImageBtn.disabled = true;
    setStatus("Please choose a valid image file.");
    return;
  }

  activeObjectURL = URL.createObjectURL(selectedFile);
  previewImage.src = activeObjectURL;
  imagePreview.hidden = false;

  clearResult();
  setStatus("Image selected. Click Scan Uploaded Image.");
});

scanImageBtn.addEventListener("click", async () => {
  if (!selectedFile || scanningImage) return;

  if (typeof Html5Qrcode === "undefined") {
    setStatus("Scanner library failed to load. Check your internet connection.");
    return;
  }

  scanningImage = true;
  scanImageBtn.disabled = true;
  setStatus("Scanning the selected image...");

  let imageScanner = null;

  try {
    imageScanner = new Html5Qrcode("reader");

    const decodedText = await imageScanner.scanFile(
      selectedFile,
      false
    );

    showResult(decodedText);
    setStatus("QR code scanned successfully.");
  } catch (error) {
    setStatus(
      "No readable QR code found in this image. Try a clearer image with the full QR code visible."
    );
    console.warn("Image scan result:", error);
  } finally {
    if (imageScanner) {
      try {
        await imageScanner.clear();
      } catch (error) {
        console.warn("Scanner cleanup notice:", error);
      }
    }

    scanningImage = false;
    scanImageBtn.disabled = !selectedFile;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!currentResult) return;

  try {
    await navigator.clipboard.writeText(currentResult);
    setStatus("QR result copied to clipboard.");
  } catch (error) {
    scanResult.focus();
    scanResult.select();

    try {
      const copied = document.execCommand("copy");
      setStatus(
        copied
          ? "QR result copied to clipboard."
          : "Copy was blocked. Select the result and copy it manually."
      );
    } catch {
      setStatus("Select the result and copy it manually.");
    }
  }
});

window.addEventListener("beforeunload", () => {
  if (activeObjectURL) {
    URL.revokeObjectURL(activeObjectURL);
  }
});
