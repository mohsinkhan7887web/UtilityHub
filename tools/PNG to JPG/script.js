
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const workspace = document.getElementById("workspace");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const imageDimensions = document.getElementById("imageDimensions");
  const imagePreview = document.getElementById("imagePreview");
  const changeImageButton = document.getElementById("changeImageButton");
  const qualityInput = document.getElementById("qualityInput");
  const qualityValue = document.getElementById("qualityValue");
  const backgroundColor = document.getElementById("backgroundColor");
  const backgroundLabel = document.getElementById("backgroundLabel");
  const convertButton = document.getElementById("convertButton");
  const resetButton = document.getElementById("resetButton");
  const statusMessage = document.getElementById("statusMessage");
  const resultArea = document.getElementById("resultArea");
  const resultDetails = document.getElementById("resultDetails");
  const downloadLink = document.getElementById("downloadLink");

  let selectedFile = null;
  let previewUrl = null;
  let downloadUrl = null;
  let loadedImage = null;
  let conversionInProgress = false;
  let selectionNumber = 0;

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " bytes";
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function clearDownload() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = null;
    }

    downloadLink.removeAttribute("href");
    resultArea.hidden = true;
  }

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    imagePreview.removeAttribute("src");
    loadedImage = null;
  }

  function resetTool() {
    selectionNumber++;
    clearDownload();
    clearPreview();

    selectedFile = null;
    imageInput.value = "";
    workspace.hidden = true;
    statusMessage.textContent = "";
    convertButton.disabled = false;
    convertButton.textContent = "Convert to JPG";
    conversionInProgress = false;
  }

  function openFilePicker() {
    if (!conversionInProgress) {
      imageInput.click();
    }
  }

  function handleFileSelection() {
    const file = imageInput.files[0];

    if (!file) {
      return;
    }

    const isPng =
      file.type === "image/png" ||
      /\.png$/i.test(file.name);

    if (!isPng) {
      imageInput.value = "";
      statusMessage.textContent =
        "Please select a PNG image.";
      workspace.hidden = true;
      return;
    }

    if (file.size === 0) {
      imageInput.value = "";
      statusMessage.textContent =
        "This file is empty. Please choose another image.";
      workspace.hidden = true;
      return;
    }

    resetTool();

    const currentSelection = selectionNumber;
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);

    fileName.textContent = file.name;
    fileSize.textContent = "File size: " + formatBytes(file.size);
    imageDimensions.textContent = "Loading image dimensions...";
    imagePreview.alt = "Preview of " + file.name;
    imagePreview.src = previewUrl;

    workspace.hidden = false;
    statusMessage.textContent = "Loading your image...";

    const image = new Image();

    image.onload = () => {
      if (
        currentSelection !== selectionNumber ||
        selectedFile !== file
      ) {
        return;
      }

      loadedImage = image;

      imageDimensions.textContent =
        "Dimensions: " +
        image.naturalWidth +
        " × " +
        image.naturalHeight +
        " pixels";

      statusMessage.textContent =
        "Image ready. Adjust settings and click Convert to JPG.";
    };

    image.onerror = () => {
      if (
        currentSelection !== selectionNumber ||
        selectedFile !== file
      ) {
        return;
      }

      loadedImage = null;
      statusMessage.textContent =
        "This image could not be opened. Please choose a valid PNG.";
    };

    image.src = previewUrl;
  }

  function convertToJpg() {
    if (conversionInProgress) {
      return;
    }

    if (!selectedFile || !loadedImage) {
      statusMessage.textContent =
        "Please wait for the PNG image to load before converting.";
      return;
    }

    conversionInProgress = true;
    convertButton.disabled = true;
    convertButton.textContent = "Converting...";
    statusMessage.textContent = "Converting your image to JPG...";
    clearDownload();

    try {
      const canvas = document.createElement("canvas");
      canvas.width = loadedImage.naturalWidth;
      canvas.height = loadedImage.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported by this browser.");
      }

      // JPG has no transparency, so fill the canvas first.
      context.fillStyle = backgroundColor.value;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.drawImage(
        loadedImage,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const quality = Number(qualityInput.value) / 100;
      const currentSelection = selectionNumber;
      const originalName = selectedFile.name.replace(/\.png$/i, "");
      const outputName = (originalName || "converted-image") + ".jpg";

      canvas.toBlob(
        (blob) => {
          if (currentSelection !== selectionNumber) {
            canvas.width = 0;
            canvas.height = 0;
            return;
          }

          conversionInProgress = false;
          convertButton.disabled = false;
          convertButton.textContent = "Convert to JPG";

          if (!blob) {
            statusMessage.textContent =
              "Conversion failed. Please try another PNG image.";
            canvas.width = 0;
            canvas.height = 0;
            return;
          }

          downloadUrl = URL.createObjectURL(blob);
          downloadLink.href = downloadUrl;
          downloadLink.download = outputName;

          resultDetails.textContent =
            "File: " +
            outputName +
            " · JPG size: " +
            formatBytes(blob.size) +
            " · Quality: " +
            qualityInput.value +
            "%";

          resultArea.hidden = false;
          statusMessage.textContent =
            "Success! Your PNG image has been converted to JPG.";

          canvas.width = 0;
          canvas.height = 0;
        },
        "image/jpeg",
        quality
      );
    } catch (error) {
      conversionInProgress = false;
      convertButton.disabled = false;
      convertButton.textContent = "Convert to JPG";

      statusMessage.textContent =
        "Conversion failed. Please try a different image.";

      console.error("PNG to JPG conversion error:", error);
    }
  }

  qualityInput.addEventListener("input", () => {
    qualityValue.textContent = qualityInput.value + "%";
    clearDownload();
  });

  backgroundColor.addEventListener("input", () => {
    backgroundLabel.textContent =
      backgroundColor.value.toUpperCase();
    clearDownload();
  });

  imageInput.addEventListener("change", handleFileSelection);
  changeImageButton.addEventListener("click", openFilePicker);
  convertButton.addEventListener("click", convertToJpg);
  resetButton.addEventListener("click", resetTool);

  window.addEventListener("beforeunload", () => {
    clearDownload();
    clearPreview();
  });
});
