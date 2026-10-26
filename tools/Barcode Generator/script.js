
const barcodeForm = document.getElementById("barcodeForm");
const barcodeInput = document.getElementById("barcodeInput");
const barcodeFormat = document.getElementById("barcodeFormat");
const barcodeWidth = document.getElementById("barcodeWidth");
const generateBtn = document.getElementById("generateBtn");
const statusMessage = document.getElementById("status");
const result = document.getElementById("result");
const barcodeSvg = document.getElementById("barcodeSvg");
const barcodeValue = document.getElementById("barcodeValue");
const downloadBtn = document.getElementById("downloadBtn");

document.getElementById("year").textContent =
  new Date().getFullYear();

function generateBarcode() {
  const value = barcodeInput.value.trim();

  if (!value) {
    throw new Error("Please enter text or a number first.");
  }

  if (value.length > 80) {
    throw new Error("Please enter no more than 80 characters.");
  }

  const format = barcodeFormat.value;

  if (format === "CODE128C" && !/^\d+$/.test(value)) {
    throw new Error("Code 128C supports digits only.");
  }

  if (format === "CODE128C" && value.length % 2 !== 0) {
    throw new Error("Code 128C requires an even number of digits.");
  }

  if (typeof JsBarcode === "undefined") {
    throw new Error(
      "Barcode library could not load. Check your internet connection and refresh the page."
    );
  }

  const width = Number(barcodeWidth.value);

  barcodeSvg.replaceChildren();

  JsBarcode(barcodeSvg, value, {
    format: format,
    width: width,
    height: 100,
    margin: 12,
    displayValue: true,
    font: "Arial",
    fontSize: 16,
    textMargin: 8,
    background: "#ffffff",
    lineColor: "#172033",
    valid: function (valid) {
      if (!valid) {
        throw new Error("This value is not valid for the selected format.");
      }
    }
  });

  barcodeValue.textContent = "Value: " + value;
  result.hidden = false;
  statusMessage.textContent = "Barcode generated successfully.";
}

barcodeForm.addEventListener("submit", function (event) {
  event.preventDefault();

  try {
    generateBarcode();
  } catch (error) {
    result.hidden = true;
    statusMessage.textContent =
      error.message || "Could not generate the barcode.";
  }
});

downloadBtn.addEventListener("click", function () {
  try {
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8"
    });

    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        const scale = 2;

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not prepare the PNG image.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.scale(scale, scale);
        context.drawImage(image, 0, 0);

        canvas.toBlob(function (blob) {
          URL.revokeObjectURL(svgUrl);

          if (!blob) {
            statusMessage.textContent = "Could not create the PNG file.";
            return;
          }

          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");

          link.href = pngUrl;
          link.download = "utilityhub-barcode.png";
          document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(function () {
            URL.revokeObjectURL(pngUrl);
          }, 1000);

          statusMessage.textContent = "Barcode PNG downloaded.";
        }, "image/png");
      } catch (error) {
        URL.revokeObjectURL(svgUrl);
        statusMessage.textContent =
          error.message || "Could not download the barcode.";
      }
    };

    image.onerror = function () {
      URL.revokeObjectURL(svgUrl);
      statusMessage.textContent = "Could not prepare the barcode image.";
    };

    image.src = svgUrl;
  } catch (error) {
    statusMessage.textContent =
      error.message || "Could not download the barcode.";
  }
});
