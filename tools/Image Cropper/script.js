
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const imageInput = $("imageInput");
  const workspace = $("workspace");
  const fileName = $("fileName");
  const fileSize = $("fileSize");
  const imageDimensions = $("imageDimensions");
  const changeImageButton = $("changeImageButton");

  const aspectRatioSelect = $("aspectRatio");
  const cropCanvas = $("cropCanvas");
  const cropStage = $("cropStage");
  const centerCropButton = $("centerCropButton");
  const resetCropButton = $("resetCropButton");
  const outputFormat = $("outputFormat");

  const cropButton = $("cropButton");
  const resetToolButton = $("resetToolButton");
  const statusMessage = $("statusMessage");

  const resultArea = $("resultArea");
  const resultDetails = $("resultDetails");
  const resultPreview = $("resultPreview");
  const downloadLink = $("downloadLink");

  const ctx = cropCanvas.getContext("2d");

  let selectedFile = null;
  let loadedImage = null;
  let previewUrl = null;
  let resultUrl = null;

  let sourceWidth = 0;
  let sourceHeight = 0;
  let scale = 1;
  let crop = { x: 0, y: 0, width: 0, height: 0 };

  let pointerMode = null;
  let pointerStart = null;
  let cropStart = null;
  let activePointer = null;
  let selectionId = 0;

  const MIN_SIZE = 2;
  const HANDLE_RADIUS = 12;

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
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

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    loadedImage = null;
  }

  function resetTool() {
    selectionId++;

    clearResult();
    clearPreview();

    selectedFile = null;
    sourceWidth = 0;
    sourceHeight = 0;
    scale = 1;
    crop = { x: 0, y: 0, width: 0, height: 0 };

    imageInput.value = "";
    workspace.hidden = true;
    statusMessage.textContent = "";

    pointerMode = null;
    pointerStart = null;
    cropStart = null;
    activePointer = null;

    cropButton.disabled = false;
    cropButton.textContent = "Crop Image";
  }

  function getRatio() {
    const value = aspectRatioSelect.value;

    if (value === "free") return null;

    const [w, h] = value.split(":").map(Number);
    return w / h;
  }

  function clampCrop() {
    crop.width = Math.max(0, Math.min(crop.width, sourceWidth));
    crop.height = Math.max(0, Math.min(crop.height, sourceHeight));
    crop.x = Math.max(0, Math.min(crop.x, sourceWidth - crop.width));
    crop.y = Math.max(0, Math.min(crop.y, sourceHeight - crop.height));
  }

  function setCenteredCrop() {
    if (!loadedImage) return;

    const ratio = getRatio();
    let width = sourceWidth;
    let height = sourceHeight;

    if (ratio !== null) {
      if (sourceWidth / sourceHeight > ratio) {
        width = sourceHeight * ratio;
      } else {
        height = sourceWidth / ratio;
      }
    }

    crop = {
      x: (sourceWidth - width) / 2,
      y: (sourceHeight - height) / 2,
      width,
      height
    };

    drawCropCanvas();
  }

  function drawCropCanvas() {
    if (!loadedImage || !ctx) return;

    ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    ctx.drawImage(
      loadedImage,
      0, 0,
      cropCanvas.width,
      cropCanvas.height
    );

    const x = crop.x * scale;
    const y = crop.y * scale;
    const w = crop.width * scale;
    const h = crop.height * scale;

    // Darken the area outside the crop selection.
    ctx.fillStyle = "rgba(15, 23, 42, 0.58)";
    ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

    if (w > 0 && h > 0) {
      ctx.clearRect(x, y, w, h);

      ctx.drawImage(
        loadedImage,
        crop.x, crop.y, crop.width, crop.height,
        x, y, w, h
      );

      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      const points = [
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
        [x + w / 2, y],
        [x + w / 2, y + h],
        [x, y + h / 2],
        [x + w, y + h / 2]
      ];

      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1.5;

      points.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.rect(
          px - HANDLE_RADIUS / 2,
          py - HANDLE_RADIUS / 2,
          HANDLE_RADIUS,
          HANDLE_RADIUS
        );
        ctx.fill();
        ctx.stroke();
      });
    }
  }

  function fitCanvas() {
    if (!loadedImage) return;

    const maxWidth = Math.max(200, cropStage.clientWidth - 26);
    const maxHeight = 480;

    scale = Math.min(
      1,
      maxWidth / sourceWidth,
      maxHeight / sourceHeight
    );

    cropCanvas.width = Math.max(1, Math.round(sourceWidth * scale));
    cropCanvas.height = Math.max(1, Math.round(sourceHeight * scale));

    cropCanvas.style.width = cropCanvas.width + "px";
    cropCanvas.style.height = cropCanvas.height + "px";

    drawCropCanvas();
  }

  function canvasPoint(event) {
    const rect = cropCanvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * cropCanvas.width / rect.width,
      y: (event.clientY - rect.top) * cropCanvas.height / rect.height
    };
  }

  function getHandle(point) {
    const x = crop.x * scale;
    const y = crop.y * scale;
    const w = crop.width * scale;
    const h = crop.height * scale;
    const tolerance = HANDLE_RADIUS + 4;

    const nearLeft = Math.abs(point.x - x) <= tolerance;
    const nearRight = Math.abs(point.x - x - w) <= tolerance;
    const nearTop = Math.abs(point.y - y) <= tolerance;
    const nearBottom = Math.abs(point.y - y - h) <= tolerance;

    if (nearLeft && nearTop) return "nw";
    if (nearRight && nearTop) return "ne";
    if (nearLeft && nearBottom) return "sw";
    if (nearRight && nearBottom) return "se";
    if (nearTop && point.x >= x && point.x <= x + w) return "n";
    if (nearBottom && point.x >= x && point.x <= x + w) return "s";
    if (nearLeft && point.y >= y && point.y <= y + h) return "w";
    if (nearRight && point.y >= y && point.y <= y + h) return "e";

    if (point.x >= x && point.x <= x + w &&
        point.y >= y && point.y <= y + h) {
      return "move";
    }

    return null;
  }

  function onPointerDown(event) {
    if (!loadedImage) return;

    event.preventDefault();

    const point = canvasPoint(event);
    const handle = getHandle(point);

    pointerMode = handle || "new";
    pointerStart = point;
    cropStart = { ...crop };
    activePointer = event.pointerId;

    cropCanvas.setPointerCapture(event.pointerId);

    if (pointerMode === "new") {
      crop = {
        x: point.x / scale,
        y: point.y / scale,
        width: 0,
        height: 0
      };
      drawCropCanvas();
    }
  }

  function onPointerMove(event) {
    if (!loadedImage) return;

    const point = canvasPoint(event);

    if (!pointerMode || activePointer !== event.pointerId) {
      const handle = getHandle(point);
      const cursors = {
        nw: "nwse-resize",
        se: "nwse-resize",
        ne: "nesw-resize",
        sw: "nesw-resize",
        n: "ns-resize",
        s: "ns-resize",
        e: "ew-resize",
        w: "ew-resize",
        move: "move"
      };

      cropCanvas.style.cursor = cursors[handle] || "crosshair";
      return;
    }

    event.preventDefault();

    const dx = (point.x - pointerStart.x) / scale;
    const dy = (point.y - pointerStart.y) / scale;

    if (pointerMode === "move") {
      crop.x = cropStart.x + dx;
      crop.y = cropStart.y + dy;
      clampCrop();
      drawCropCanvas();
      return;
    }

    let left = cropStart.x;
    let top = cropStart.y;
    let right = cropStart.x + cropStart.width;
    let bottom = cropStart.y + cropStart.height;

    if (pointerMode === "new") {
      left = Math.min(pointerStart.x, point.x) / scale;
      top = Math.min(pointerStart.y, point.y) / scale;
      right = Math.max(pointerStart.x, point.x) / scale;
      bottom = Math.max(pointerStart.y, point.y) / scale;
    } else {
      if (pointerMode.includes("w")) {
        left = Math.max(0, Math.min(right - MIN_SIZE, left + dx));
      }
      if (pointerMode.includes("e")) {
        right = Math.min(sourceWidth, Math.max(left + MIN_SIZE, right + dx));
      }
      if (pointerMode.includes("n")) {
        top = Math.max(0, Math.min(bottom - MIN_SIZE, top + dy));
      }
      if (pointerMode.includes("s")) {
        bottom = Math.min(sourceHeight, Math.max(top + MIN_SIZE, bottom + dy));
      }
    }

    let width = right - left;
    let height = bottom - top;
    const ratio = getRatio();

    // Keep fixed ratios while drawing a new selection.
    if (pointerMode === "new" && ratio !== null) {
      if (width / Math.max(height, 0.001) > ratio) {
        width = height * ratio;
      } else {
        height = width / ratio;
      }

      right = Math.min(sourceWidth, left + width);
      bottom = Math.min(sourceHeight, top + height);
      width = right - left;
      height = bottom - top;
    }

    crop = { x: left, y: top, width, height };
    clampCrop();
    drawCropCanvas();
  }

  function onPointerUp(event) {
    if (activePointer !== event.pointerId) return;

    if (pointerMode === "new" &&
        (crop.width < MIN_SIZE || crop.height < MIN_SIZE)) {
      setCenteredCrop();
    }

    pointerMode = null;
    pointerStart = null;
    cropStart = null;
    activePointer = null;
  }

  function handleFileSelection() {
    const file = imageInput.files && imageInput.files[0];
    if (!file) return;

    resetTool();

    const currentId = selectionId;
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);

    fileName.textContent = file.name;
    fileSize.textContent = "File size: " + formatBytes(file.size);
    imageDimensions.textContent = "Loading dimensions...";
    workspace.hidden = false;
    statusMessage.textContent = "Loading selected image...";

    const image = new Image();

    image.onload = () => {
      if (currentId !== selectionId || selectedFile !== file) return;

      loadedImage = image;
      sourceWidth = image.naturalWidth;
      sourceHeight = image.naturalHeight;

      imageDimensions.textContent =
        "Dimensions: " + sourceWidth + " × " + sourceHeight + " pixels";

      fitCanvas();
      setCenteredCrop();

      statusMessage.textContent =
        "Image loaded. Drag inside the selection to move it, or drag a handle to resize.";
    };

    image.onerror = () => {
      if (currentId !== selectionId) return;

      statusMessage.textContent =
        "The selected file could not be opened as an image. Try another JPG, PNG or WebP file.";
    };

    image.src = previewUrl;
  }

  function cropImage() {
    if (!loadedImage) {
      statusMessage.textContent = "Please select an image first.";
      return;
    }

    if (crop.width < 1 || crop.height < 1) {
      statusMessage.textContent = "Please select a valid crop area.";
      return;
    }

    const x = Math.max(0, Math.floor(crop.x));
    const y = Math.max(0, Math.floor(crop.y));
    const width = Math.min(sourceWidth - x, Math.max(1, Math.round(crop.width)));
    const height = Math.min(sourceHeight - y, Math.max(1, Math.round(crop.height)));

    const mime = outputFormat.value;
    const currentId = selectionId;

    clearResult();

    cropButton.disabled = true;
    cropButton.textContent = "Cropping...";
    statusMessage.textContent = "Cropping your image...";

    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const outputContext = canvas.getContext("2d");
      if (!outputContext) throw new Error("Canvas is unavailable.");

      if (mime === "image/jpeg") {
        outputContext.fillStyle = "#ffffff";
        outputContext.fillRect(0, 0, width, height);
      }

      outputContext.drawImage(
        loadedImage,
        x, y, width, height,
        0, 0, width, height
      );

      canvas.toBlob((blob) => {
        canvas.width = 0;
        canvas.height = 0;

        cropButton.disabled = false;
        cropButton.textContent = "Crop Image";

        if (currentId !== selectionId) return;

        if (!blob) {
          statusMessage.textContent = "Cropping failed. Please try again.";
          return;
        }

        resultUrl = URL.createObjectURL(blob);

        const base = selectedFile.name.replace(/\.[^.]+$/, "") || "image";
        const extension = mime === "image/jpeg" ? "jpg" :
          mime === "image/webp" ? "webp" : "png";
        const outputName = base + "-cropped." + extension;

        resultPreview.src = resultUrl;
        resultDetails.textContent =
          outputName + " · " + width + " × " + height +
          " pixels · " + formatBytes(blob.size);

        downloadLink.href = resultUrl;
        downloadLink.download = outputName;
        resultArea.hidden = false;

        statusMessage.textContent =
          "Success! Your cropped image is ready to download.";
      }, mime);
    } catch (error) {
      cropButton.disabled = false;
      cropButton.textContent = "Crop Image";
      statusMessage.textContent = "Cropping failed. Please try another image.";
      console.error("Image Cropper error:", error);
    }
  }

  imageInput.addEventListener("change", handleFileSelection);
  changeImageButton.addEventListener("click", () => imageInput.click());

  aspectRatioSelect.addEventListener("change", () => {
    setCenteredCrop();
    clearResult();
  });

  centerCropButton.addEventListener("click", () => {
    setCenteredCrop();
    clearResult();
    statusMessage.textContent = "Crop selection centered.";
  });

  resetCropButton.addEventListener("click", () => {
    setCenteredCrop();
    clearResult();
    statusMessage.textContent = "Crop selection reset.";
  });

  outputFormat.addEventListener("change", clearResult);

  cropCanvas.addEventListener("pointerdown", onPointerDown);
  cropCanvas.addEventListener("pointermove", onPointerMove);
  cropCanvas.addEventListener("pointerup", onPointerUp);
  cropCanvas.addEventListener("pointercancel", onPointerUp);

  cropButton.addEventListener("click", cropImage);
  resetToolButton.addEventListener("click", resetTool);

  window.addEventListener("resize", () => {
    if (loadedImage) fitCanvas();
  });

  window.addEventListener("beforeunload", () => {
    clearResult();
    clearPreview();
  });
});
