
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const imageInput = $("imageInput");
  const uploadArea = $("uploadArea");
  const workspace = $("workspace");
  const fileName = $("fileName");
  const fileSize = $("fileSize");
  const imageDimensions = $("imageDimensions");
  const sourceFormat = $("sourceFormat");
  const imagePreview = $("imagePreview");
  const changeImageButton = $("changeImageButton");

  const outputFormat = $("outputFormat");
  const qualityGroup = $("qualityGroup");
  const quality = $("quality");
  const qualityValue = $("qualityValue");
  const backgroundGroup = $("backgroundGroup");
  const backgroundColor = $("backgroundColor");

  const convertButton = $("convertButton");
  const resetButton = $("resetButton");
  const statusMessage = $("statusMessage");

  const resultArea = $("resultArea");
  const resultDetails = $("resultDetails");
  const downloadLink = $("downloadLink");

  let selectedFile = null;
  let loadedImage = null;
  let previewUrl = null;
  let resultUrl = null;
  let imageWidth = 0;
  let imageHeight = 0;
  let loadId = 0;
  let conversionId = 0;

  const MIME_EXTENSIONS = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/bmp": "bmp"
  };

  const FORMAT_NAMES = {
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/webp": "WebP",
    "image/avif": "AVIF",
    "image/bmp": "BMP"
  };

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function showStatus(message) {
    statusMessage.textContent = message;
  }

  function clearResult() {
    conversionId++;

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }

    downloadLink.removeAttribute("href");
    downloadLink.removeAttribute("download");
    resultArea.hidden = true;
  }

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    imagePreview.removeAttribute("src");
  }

  function resetTool() {
    loadId++;
    clearResult();
    clearPreview();

    selectedFile = null;
    loadedImage = null;
    imageWidth = 0;
    imageHeight = 0;

    imageInput.value = "";
    workspace.hidden = true;
    uploadArea.hidden = false;

    convertButton.disabled = false;
    convertButton.textContent = "Convert Image";

    showStatus("");
  }

  function getSourceType(file) {
    if (file.type && file.type.startsWith("image/")) {
      return file.type.toLowerCase();
    }

    const extension = file.name.split(".").pop().toLowerCase();

    const extensionTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      avif: "image/avif",
      bmp: "image/bmp",
      tif: "image/tiff",
      tiff: "image/tiff",
      ico: "image/x-icon",
      svg: "image/svg+xml",
      heic: "image/heic",
      heif: "image/heif"
    };

    return extensionTypes[extension] || "";
  }

  function updateSettings() {
    const type = outputFormat.value;
    const lossy = ["image/jpeg", "image/webp", "image/avif"].includes(type);

    qualityGroup.hidden = !lossy;
    backgroundGroup.hidden = type !== "image/jpeg";

    qualityValue.textContent = quality.value + "%";
  }

  function loadSelectedFile() {
    const file = imageInput.files && imageInput.files[0];

    if (!file) return;

    resetTool();

    const thisLoad = loadId;
    selectedFile = file;

    const type = getSourceType(file);

    if (!type || !type.startsWith("image/")) {
      showStatus("Please select a valid image file.");
      return;
    }

    previewUrl = URL.createObjectURL(file);

    fileName.textContent = file.name;
    fileSize.textContent = "File size: " + formatBytes(file.size);
    imageDimensions.textContent = "Reading image dimensions...";
    sourceFormat.textContent = "Source format: " + type.replace("image/", "").toUpperCase();

    uploadArea.hidden = true;
    workspace.hidden = false;
    imagePreview.alt = "Preview of " + file.name;
    imagePreview.src = previewUrl;

    showStatus("Loading image...");

    const image = new Image();

    image.onload = () => {
      if (thisLoad !== loadId || selectedFile !== file) return;

      loadedImage = image;
      imageWidth = image.naturalWidth;
      imageHeight = image.naturalHeight;

      if (!imageWidth || !imageHeight) {
        showStatus("Could not read the image dimensions. Try another file.");
        return;
      }

      imageDimensions.textContent =
        "Dimensions: " + imageWidth + " × " + imageHeight + " pixels";

      showStatus(
        "Image loaded. Choose an output format and click Convert Image."
      );
    };

    image.onerror = () => {
      if (thisLoad !== loadId || selectedFile !== file) return;

      loadedImage = null;

      showStatus(
        "This image format cannot be decoded by your browser. " +
        "Try a JPG, PNG, WebP or another browser-supported image."
      );
    };

    image.src = previewUrl;
  }

  function convertImage() {
    if (!selectedFile || !loadedImage) {
      showStatus("Please select a supported image first.");
      return;
    }

    clearResult();

    const requestedType = outputFormat.value;
    const requestedQuality = Number(quality.value) / 100;
    const background = backgroundColor.value;
    const thisConversion = conversionId;

    convertButton.disabled = true;
    convertButton.textContent = "Converting...";
    showStatus("Converting your image...");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = imageWidth;
      canvas.height = imageHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }

      // JPG cannot contain transparency. Fill its background first.
      if (requestedType === "image/jpeg") {
        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(loadedImage, 0, 0);

      const supportsQuality = [
        "image/jpeg",
        "image/webp",
        "image/avif"
      ].includes(requestedType);

      canvas.toBlob(
        (blob) => {
          canvas.width = 0;
          canvas.height = 0;

          convertButton.disabled = false;
          convertButton.textContent = "Convert Image";

          if (thisConversion !== conversionId) return;

          if (!blob) {
            showStatus(
              "Conversion failed. This output format may not be supported."
            );
            return;
          }

          // Some browsers silently export PNG when a requested
          // format is unsupported. Never mislabel that PNG as JPG.
          if (blob.type !== requestedType) {
            showStatus(
              FORMAT_NAMES[requestedType] +
              " export is not supported by this browser. " +
              "Please select PNG, JPG or WebP instead."
            );
            return;
          }

          resultUrl = URL.createObjectURL(blob);

          const originalBase = selectedFile.name.replace(/\.[^.]+$/, "");
          const extension = MIME_EXTENSIONS[blob.type];

          if (!extension) {
            URL.revokeObjectURL(resultUrl);
            resultUrl = null;
            showStatus("The browser returned an unsupported output format.");
            return;
          }

          const outputName =
            (originalBase || "image") + "-converted." + extension;

          resultDetails.textContent =
            outputName +
            " · " +
            FORMAT_NAMES[blob.type] +
            " · " +
            imageWidth +
            " × " +
            imageHeight +
            " pixels · " +
            formatBytes(blob.size) +
            (supportsQuality
              ? " · Quality " + quality.value + "%"
              : "");

          downloadLink.href = resultUrl;
          downloadLink.download = outputName;
          resultArea.hidden = false;

          showStatus("Conversion complete. Your image is ready to download.");
        },
        requestedType,
        supportsQuality ? requestedQuality : undefined
      );
    } catch (error) {
      convertButton.disabled = false;
      convertButton.textContent = "Convert Image";

      console.error("Image conversion error:", error);

      showStatus("Conversion failed. Please try another image or format.");
    }
  }

  imageInput.addEventListener("change", loadSelectedFile);

  changeImageButton.addEventListener("click", () => {
    imageInput.click();
  });

  outputFormat.addEventListener("change", () => {
    clearResult();
    updateSettings();
  });

  quality.addEventListener("input", () => {
    qualityValue.textContent = quality.value + "%";
    clearResult();
  });

  backgroundColor.addEventListener("input", clearResult);

  convertButton.addEventListener("click", convertImage);
  resetButton.addEventListener("click", resetTool);

  updateSettings();
});
