
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const workspace = document.getElementById("workspace");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const imageDimensions = document.getElementById("imageDimensions");
  const imagePreview = document.getElementById("imagePreview");
  const changeImageButton = document.getElementById("changeImageButton");
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
    clearDownload();
    clearPreview();

    selectedFile = null;
    imageInput.value = "";
    workspace.hidden = true;
    statusMessage.textContent = "";
    convertButton.disabled = false;
    convertButton.textContent = "Convert to PNG";
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

    const isJpeg =
      file.type === "image/jpeg" ||
      /\.(jpe?g)$/i.test(file.name);

    if (!isJpeg) {
      imageInput.value = "";
      statusMessage.textContent =
        "Please select a JPG or JPEG image.";
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
      if (selectedFile !== file) {
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
        "Image ready. Click Convert to PNG when you're ready.";
    };

    image.onerror = () => {
      if (selectedFile !== file) {
        return;
      }

      loadedImage = null;
      statusMessage.textContent =
        "This image could not be opened. Please choose a valid JPG file.";
    };

    image.src = previewUrl;
  }

  function convertToPng() {
    if (conversionInProgress) {
      return;
    }

    if (!selectedFile || !loadedImage) {
      statusMessage.textContent =
        "Please wait for the image to load, or choose a valid JPG image.";
      return;
    }

    conversionInProgress = true;
    convertButton.disabled = true;
    convertButton.textContent = "Converting...";
    statusMessage.textContent = "Converting your image to PNG...";
    clearDownload();

    try {
      const canvas = document.createElement("canvas");

      canvas.width = loadedImage.naturalWidth;
      canvas.height = loadedImage.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported by this browser.");
      }

      context.drawImage(
        loadedImage,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          conversionInProgress = false;
          convertButton.disabled = false;
          convertButton.textContent = "Convert to PNG";

          if (!blob) {
            statusMessage.textContent =
              "Conversion failed. Please try another image.";
            return;
          }

          downloadUrl = URL.createObjectURL(blob);

          const originalName = selectedFile.name.replace(
            /\.jpe?g$/i,
            ""
          );

          const outputName =
            (originalName || "converted-image") + ".png";

          downloadLink.href = downloadUrl;
          downloadLink.download = outputName;

          resultDetails.textContent =
            "File: " +
            outputName +
            " · PNG size: " +
            formatBytes(blob.size);

          resultArea.hidden = false;
          statusMessage.textContent =
            "Success! Your image has been converted to PNG.";

          canvas.width = 0;
          canvas.height = 0;
        },
        "image/png"
      );
    } catch (error) {
      conversionInProgress = false;
      convertButton.disabled = false;
      convertButton.textContent = "Convert to PNG";

      statusMessage.textContent =
        "Conversion failed. Please try a different image.";

      console.error("JPG to PNG conversion error:", error);
    }
  }

  imageInput.addEventListener("change", handleFileSelection);
  changeImageButton.addEventListener("click", openFilePicker);
  convertButton.addEventListener("click", convertToPng);
  resetButton.addEventListener("click", resetTool);

  window.addEventListener("beforeunload", () => {
    clearDownload();
    clearPreview();
  });
});
