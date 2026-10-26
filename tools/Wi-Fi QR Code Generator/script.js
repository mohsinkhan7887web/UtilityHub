
const wifiForm = document.getElementById("wifiForm");
const wifiName = document.getElementById("wifiName");
const wifiPassword = document.getElementById("wifiPassword");
const wifiSecurity = document.getElementById("wifiSecurity");
const showPassword = document.getElementById("showPassword");
const hiddenNetwork = document.getElementById("hiddenNetwork");
const generateBtn = document.getElementById("generateBtn");
const statusMessage = document.getElementById("status");
const resultBox = document.getElementById("result");
const qrContainer = document.getElementById("qrcode");
const networkLabel = document.getElementById("networkLabel");
const downloadBtn = document.getElementById("downloadBtn");

let generatedCanvas = null;

document.getElementById("year").textContent =
  new Date().getFullYear();

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status";

  if (type) {
    statusMessage.classList.add(type);
  }
}

// Show or hide the Wi-Fi password.
showPassword.addEventListener("change", function () {
  wifiPassword.type = showPassword.checked ? "text" : "password";
});

// Clear the previous QR code when the user changes details.
wifiForm.addEventListener("input", function () {
  resultBox.hidden = true;
  generatedCanvas = null;
  qrContainer.replaceChildren();
  showStatus("");
});

// Escape special characters in Wi-Fi QR data.
function escapeWifiValue(value) {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

wifiForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = wifiName.value;
  const password = wifiPassword.value;
  const security = wifiSecurity.value;

  if (!name.trim()) {
    showStatus("Please enter your Wi-Fi network name.", "error");
    wifiName.focus();
    return;
  }

  if (security !== "nopass" && !password) {
    showStatus("Please enter the Wi-Fi password.", "error");
    wifiPassword.focus();
    return;
  }

  if (typeof QRCode === "undefined") {
    showStatus(
      "QR library could not load. Check your internet connection and refresh the page.",
      "error"
    );
    return;
  }

  const escapedName = escapeWifiValue(name);
  const escapedPassword = escapeWifiValue(password);
  const hidden = hiddenNetwork.checked ? "true" : "false";

  let wifiData;

  if (security === "nopass") {
    wifiData =
      "WIFI:T:nopass;S:" + escapedName +
      ";H:" + hidden + ";;";
  } else {
    wifiData =
      "WIFI:T:" + security +
      ";S:" + escapedName +
      ";P:" + escapedPassword +
      ";H:" + hidden + ";;";
  }

  qrContainer.replaceChildren();
  generatedCanvas = null;

  try {
    new QRCode(qrContainer, {
      text: wifiData,
      width: 260,
      height: 260,
      colorDark: "#172033",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    resultBox.hidden = false;
    networkLabel.textContent = "Network: " + name;
    showStatus("Wi-Fi QR code generated successfully.", "success");

    // qrcodejs creates a canvas in most browsers and an image fallback.
    // Wait briefly for the generated output to become available.
    window.setTimeout(function () {
      generatedCanvas = qrContainer.querySelector("canvas");

      if (!generatedCanvas) {
        const image = qrContainer.querySelector("img");

        if (image && image.complete && image.naturalWidth > 0) {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          const context = canvas.getContext("2d");

          if (context) {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            generatedCanvas = canvas;
          }
        }
      }
    }, 150);
  } catch (error) {
    resultBox.hidden = true;
    showStatus(
      "Could not generate the QR code. Please check your details and try again.",
      "error"
    );
  }
});

downloadBtn.addEventListener("click", function () {
  if (!generatedCanvas) {
    generatedCanvas = qrContainer.querySelector("canvas");
  }

  if (!generatedCanvas) {
    showStatus(
      "QR image is not ready yet. Wait a moment and try again.",
      "error"
    );
    return;
  }

  try {
    generatedCanvas.toBlob(function (blob) {
      if (!blob) {
        showStatus("Could not create the PNG file.", "error");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "utilityhub-wifi-qr.png";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);

      showStatus("Wi-Fi QR code PNG downloaded.", "success");
    }, "image/png");
  } catch (error) {
    showStatus("Could not download the QR code.", "error");
  }
});
