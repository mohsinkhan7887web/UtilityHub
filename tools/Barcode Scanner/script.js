
const scannerForm = document.getElementById("scannerForm");
const barcodeFile = document.getElementById("barcodeFile");
const fileName = document.getElementById("fileName");
const scanBtn = document.getElementById("scanBtn");
const statusMessage = document.getElementById("status");
const resultBox = document.getElementById("result");
const barcodeResult = document.getElementById("barcodeResult");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

document.getElementById("year").textContent =
  new Date().getFullYear();

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status";

  if (type) {
    statusMessage.classList.add(type);
  }
}

barcodeFile.addEventListener("change", function () {
  const file = barcodeFile.files[0];

  fileName.textContent = file
    ? "Selected: " + file.name
    : "No image selected";

  resultBox.hidden = true;
  showStatus("");
});

scannerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const file = barcodeFile.files[0];

  if (!file) {
    showStatus("Please select a barcode image first.", "error");
    return;
  }

  if (!file.type.startsWith("image/")) {
    showStatus("Please choose a valid image file.", "error");
    return;
  }

  if (typeof ZXing === "undefined") {
    showStatus(
      "Scanner library could not load. Check your internet connection and refresh the page.",
      "error"
    );
    return;
  }

  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning...";
  resultBox.hidden = true;
  showStatus("Scanning your image. Please wait...");

  let objectUrl = null;

  try {
    const reader = new ZXing.BrowserMultiFormatReader();
    objectUrl = URL.createObjectURL(file);

    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(
        new Error("Could not open this image. Try another image.")
      );

      image.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not process the selected image.");
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);

const decoded = await reader.decodeFromImageElement(image);
    if (!decoded || !decoded.getText()) {
      throw new Error("No readable barcode was found in this image.");
    }

    barcodeResult.value = decoded.getText();
    resultBox.hidden = false;
    showStatus("Barcode scanned successfully!", "success");
  } catch (error) {
    showStatus(
      error.message ||
        "Could not scan this image. Try a clearer barcode image.",
      "error"
    );
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    scanBtn.disabled = false;
    scanBtn.textContent = "Scan Barcode";
  }
});

copyBtn.addEventListener("click", async function () {
  const value = barcodeResult.value;

  if (!value) {
    showStatus("There is no result to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    showStatus("Barcode result copied!", "success");
  } catch {
    barcodeResult.focus();
    barcodeResult.select();

    const copied = document.execCommand("copy");

    showStatus(
      copied
        ? "Barcode result copied!"
        : "Copy failed. Select the result and copy it manually.",
      copied ? "success" : "error"
    );
  }
});

clearBtn.addEventListener("click", function () {
  scannerForm.reset();
  barcodeResult.value = "";
  fileName.textContent = "No image selected";
  resultBox.hidden = true;
  showStatus("");
});
