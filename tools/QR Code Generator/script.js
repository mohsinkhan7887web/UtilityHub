
const qrForm = document.getElementById("qrForm");
const qrType = document.getElementById("qrType");
const qrInput = document.getElementById("qrInput");
const inputLabel = document.getElementById("inputLabel");
const statusMessage = document.getElementById("status");
const result = document.getElementById("result");
const qrOutput = document.getElementById("qrOutput");
const downloadBtn = document.getElementById("downloadBtn");
const generateBtn = document.getElementById("generateBtn");

document.getElementById("year").textContent =
  new Date().getFullYear();

const fieldSettings = {
  url: {
    label: "Website URL",
    placeholder: "https://example.com"
  },
  text: {
    label: "Your text",
    placeholder: "Enter the text you want to share"
  },
  email: {
    label: "Email address",
    placeholder: "name@example.com"
  },
  whatsapp: {
    label: "WhatsApp message",
    placeholder: "Enter phone number with country code, then message"
  }
};

qrType.addEventListener("change", () => {
  const settings = fieldSettings[qrType.value];

  inputLabel.textContent = settings.label;
  qrInput.placeholder = settings.placeholder;
  qrInput.value = "";
  statusMessage.textContent = "";
  result.hidden = true;
});

function getQRContent(type, value) {
  const input = value.trim();

  if (!input) {
    throw new Error("Please enter some information first.");
  }

  if (type === "url") {
    let url;

    try {
      url = new URL(input);
    } catch {
      throw new Error("Enter a valid website URL, such as https://example.com.");
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Only HTTP and HTTPS website links are supported.");
    }

    return url.href;
  }

  if (type === "email") {
    const email = input;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }

    return `mailto:${email}`;
  }

  if (type === "whatsapp") {
    const lines = input.split("\n");
    const phone = lines.shift().trim();
    const message = lines.join("\n").trim();
    const phoneNumber = phone.replace(/[+\s()-]/g, "");

    if (!/^\d{7,15}$/.test(phoneNumber)) {
      throw new Error(
        "Enter a phone number with country code, using digits only if possible."
      );
    }

    const query = message
      ? `?text=${encodeURIComponent(message)}`
      : "";

    return `https://wa.me/${phoneNumber}${query}`;
  }

  return input;
}

function getQRCodeImage() {
  const canvas = qrOutput.querySelector("canvas");

  if (canvas) {
    return canvas.toDataURL("image/png");
  }

  const image = qrOutput.querySelector("img");

  if (image && image.src.startsWith("data:image/")) {
    return image.src;
  }

  return null;
}

qrForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (typeof QRCode === "undefined") {
    statusMessage.textContent =
      "QR library could not load. Check your internet connection and refresh the page.";
    result.hidden = true;
    return;
  }

  try {
    const content = getQRContent(qrType.value, qrInput.value);

    qrOutput.replaceChildren();
    result.hidden = false;
    statusMessage.textContent = "";
    downloadBtn.hidden = true;
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";

    new QRCode(qrOutput, {
      text: content,
      width: 240,
      height: 240,
      colorDark: "#172033",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    window.setTimeout(() => {
      const imageData = getQRCodeImage();

      if (imageData) {
        downloadBtn.href = imageData;
        downloadBtn.hidden = false;
        statusMessage.textContent =
          "QR code generated successfully. Scan it before sharing.";
      } else {
        statusMessage.textContent =
          "QR code created, but the download image is not ready. Please try again.";
      }

      generateBtn.disabled = false;
      generateBtn.textContent = "Generate QR Code";
    }, 150);
  } catch (error) {
    statusMessage.textContent = error.message;
    result.hidden = true;
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate QR Code";
  }
});
