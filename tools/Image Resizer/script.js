
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const workspace = document.getElementById("workspace");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const originalDimensions = document.getElementById("originalDimensions");
  const imagePreview = document.getElementById("imagePreview");
  const changeImageButton = document.getElementById("changeImageButton");

  const widthInput = document.getElementById("widthInput");
  const heightInput = document.getElementById("heightInput");
  const aspectRatio = document.getElementById("aspectRatio");
  const outputFormat = document.getElementById("outputFormat");
  const qualitySection = document.getElementById("qualitySection");
  const qualityInput = document.getElementById("qualityInput");
  const qualityValue = document.getElementById("qualityValue");

  const resizeButton = document.getElementById("resizeButton");
  const resetButton = document.getElementById("resetButton");
  const statusMessage = document.getElementById("statusMessage");

  const resultArea = document.getElementById("resultArea");
  const resultDimensions = document.getElementById("resultDimensions");
  const resultDetails = document.getElementById("resultDetails");
  const resultPreview = document.getElementById("resultPreview");
  const downloadLink = document.getElementById("downloadLink");

  let selectedFile = null;
  let loadedImage = null;
  let previewUrl = null;
  let resultUrl = null;
  let conversionInProgress = false;
  let selectionNumber = 0;
  let originalWidth = 0;
  let originalHeight = 0;
  let updatingDimensions = false;

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " bytes";
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function clearResult() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }

    resultPreview.removeAttribute("src");
    downloadLink.removeAttribute("href");
    resultArea.hidden = true;
  }

  function clearOriginalPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    imagePreview.removeAttribute("src");
    loadedImage = null;
  }

  function resetTool() {
    selectionNumber++;

    clearResult();
    clearOriginalPreview();

    selectedFile = null;
    originalWidth = 0;
    originalHeight = 0;

    imageInput.value = "";
    widthInput.value = "";
    heightInput.value = "";

    workspace.hidden = true;
    statusMessage.textContent = "";

    resizeButton.disabled = false;
    resizeButton.textContent = "Resize Image";
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

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    const extensionIsAllowed = /\.(jpe?g|png|webp)$/i.test(file.name);
    const typeIsAllowed = allowedTypes.includes(file.type);

    if (!typeIsAllowed && !extensionIsAllowed) {
      imageInput.value = "";
      statusMessage.textContent =
        "Please select a JPG, PNG or WebP image.";
      return;
    }

    if (file.size === 0) {
      imageInput.value = "";
      statusMessage.textContent =
        "This file is empty. Please choose another image.";
      return;
    }

    resetTool();

    const currentSelection = selectionNumber;
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);

    fileName.textContent = file.name;
    fileSize.textContent = "File size: " + formatBytes(file.size);
    originalDimensions.textContent = "Loading dimensions...";

    imagePreview.alt = "Original image preview: " + file.name;
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
      originalWidth = image.naturalWidth;
      originalHeight = image.naturalHeight;

      widthInput.value = originalWidth;
      heightInput.value = originalHeight;

      originalDimensions.textContent =
        "Original: " + originalWidth + " × " + originalHeight + " pixels";

      statusMessage.textContent =
        "Image ready. Enter your preferred dimensions and resize.";

      updateQualityVisibility();
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
        "Could not open this image. Please select a valid image file.";
    };

    image.src = previewUrl;
  }

  function updateWidthFromHeight() {
    if (
      updatingDimensions ||
      !aspectRatio.checked ||
      !originalWidth ||
      !originalHeight
    ) {
      return;
    }

    const height = Number(heightInput.value);

    if (Number.isFinite(height) && height > 0) {
      updatingDimensions = true;
      widthInput.value = Math.max(
        1,
        Math.round(height * originalWidth / originalHeight)
      );
      updatingDimensions = false;
    }
  }

  function updateHeightFromWidth() {
    if (
      updatingDimensions ||
      !aspectRatio.checked ||
      !originalWidth ||
      !originalHeight
    ) {
      return;
    }

    const width = Number(widthInput.value);

    if (Number.isFinite(width) && width > 0) {
      updatingDimensions = true;
      heightInput.value = Math.max(
        1,
        Math.round(width * originalHeight / originalWidth)
      );
      updatingDimensions = false;
    }
  }

  function updateQualityVisibility() {
    const usesQuality = outputFormat.value !== "image/png";
    qualitySection.hidden = !usesQuality;
  }

  function validateDimensions() {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (
      !widthInput.value.trim() ||
      !heightInput.value.trim() ||
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width > 10000 ||
      height > 10000
    ) {
      statusMessage.textContent =
        "Enter whole-number width and height values between 1 and 10,000 pixels.";
      return null;
    }

    return { width, height };
  }

  function getOutputExtension(mimeType) {
    if (mimeType === "image/jpeg") {
      return "jpg";
    }

    if (mimeType === "image/webp") {
      return "webp";
    }

    return "png";
  }

  function resizeImage() {
    if (conversionInProgress) {
      return;
    }

    if (!selectedFile || !loadedImage) {
      statusMessage.textContent =
        "Please select an image and wait for it to load.";
      return;
    }

    const dimensions = validateDimensions();

    if (!dimensions) {
      return;
    }

    const { width, height } = dimensions;
    const mimeType = outputFormat.value;
    const quality = Number(qualityInput.value) / 100;
    const currentSelection = selectionNumber;

    conversionInProgress = true;
    resizeButton.disabled = true;
    resizeButton.textContent = "Resizing...";
    statusMessage.textContent = "Resizing your image...";
    clearResult();

    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported by this browser.");
      }

      if (mimeType === "image/jpeg") {
        // JPG cannot preserve transparency.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(loadedImage, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          canvas.width = 0;
          canvas.height = 0;

          if (currentSelection !== selectionNumber) {
            return;
          }

          conversionInProgress = false;
          resizeButton.disabled = false;
          resizeButton.textContent = "Resize Image";

          if (!blob) {
            statusMessage.textContent =
              "Resizing failed. Try a different image or smaller dimensions.";
            return;
          }

          resultUrl = URL.createObjectURL(blob);

          const originalBaseName = selectedFile.name.replace(
            /\.(jpe?g|png|webp)$/i,
            ""
          );

          const extension = getOutputExtension(mimeType);
          const outputName =
            (originalBaseName || "resized-image") +
            "-resized." +
            extension;

          resultPreview.src = resultUrl;
          resultPreview.alt =
            "Resized image preview: " + outputName;

          resultDimensions.textContent =
            "New dimensions: " + width + " × " + height + " pixels";

          resultDetails.textContent =
            "File: " + outputName +
            " · Size: " + formatBytes(blob.size) +
            (mimeType !== "image/png"
              ? " · Quality: " + qualityInput.value + "%"
              : "");

          downloadLink.href = resultUrl;
          downloadLink.download = outputName;

          resultArea.hidden = false;
          statusMessage.textContent =
            "Success! Your resized image is ready to download.";
        },
        mimeType,
        mimeType === "image/png" ? undefined : quality
      );
    } catch (error) {
      conversionInProgress = false;
      resizeButton.disabled = false;
      resizeButton.textContent = "Resize Image";

      statusMessage.textContent =
        "Resizing failed. Try a different image or smaller dimensions.";

      console.error("Image resizing error:", error);
    }
  }

  widthInput.addEventListener("input", () => {
    updateHeightFromWidth();
    clearResult();
  });

  heightInput.addEventListener("input", () => {
    updateWidthFromHeight();
    clearResult();
  });

  aspectRatio.addEventListener("change", () => {
    if (aspectRatio.checked) {
      updateHeightFromWidth();
    }
    clearResult();
  });

  outputFormat.addEventListener("change", () => {
    updateQualityVisibility();
    clearResult();
  });

  qualityInput.addEventListener("input", () => {
    qualityValue.textContent = qualityInput.value + "%";
    clearResult();
  });

  imageInput.addEventListener("change", handleFileSelection);
  changeImageButton.addEventListener("click", openFilePicker);
  resizeButton.addEventListener("click", resizeImage);
  resetButton.addEventListener("click", resetTool);

  updateQualityVisibility();

  window.addEventListener("beforeunload", () => {
    clearResult();
    clearOriginalPreview();
  });
});
