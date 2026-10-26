
document.addEventListener("DOMContentLoaded", function () {
    const uploadArea = document.getElementById("uploadArea");
    const workspace = document.getElementById("workspace");
    const imageInput = document.getElementById("imageInput");
    const chooseImagesButton = document.getElementById("chooseImagesButton");
    const addMoreButton = document.getElementById("addMoreButton");
    const imageList = document.getElementById("imageList");
    const imageCount = document.getElementById("imageCount");
    const pageSize = document.getElementById("pageSize");
    const orientation = document.getElementById("orientation");
    const imageFit = document.getElementById("imageFit");
    const clearButton = document.getElementById("clearButton");
    const convertButton = document.getElementById("convertButton");
    const statusMessage = document.getElementById("statusMessage");
    const resultArea = document.getElementById("resultArea");
    const resultDetails = document.getElementById("resultDetails");
    const downloadLink = document.getElementById("downloadLink");
    const convertAnotherButton = document.getElementById("convertAnotherButton");

    let images = [];
    let generatedPdfUrl = null;
    let isConverting = false;

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function setStatus(message, isError) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "#c93649" : "";
    }

    function releaseImageUrls() {
        images.forEach(function (image) {
            if (image.previewUrl) {
                URL.revokeObjectURL(image.previewUrl);
            }
        });
    }

    function clearGeneratedPdf() {
        if (generatedPdfUrl) {
            URL.revokeObjectURL(generatedPdfUrl);
            generatedPdfUrl = null;
        }

        downloadLink.removeAttribute("href");
        resultArea.hidden = true;
    }

    function renderImages() {
        imageList.replaceChildren();

        images.forEach(function (image, index) {
            const item = document.createElement("div");
            item.className = "image-item";

            const preview = document.createElement("img");
            preview.src = image.previewUrl;
            preview.alt = "Preview of " + image.file.name;

            const details = document.createElement("div");
            details.className = "image-details";

            const name = document.createElement("span");
            name.className = "image-name";
            name.textContent = (index + 1) + ". " + image.file.name;

            const size = document.createElement("span");
            size.className = "image-size";
            size.textContent = formatBytes(image.file.size);

            details.append(name, size);

            const actions = document.createElement("div");
            actions.className = "image-actions";

            const upButton = document.createElement("button");
            upButton.type = "button";
            upButton.textContent = "↑";
            upButton.title = "Move image up";
            upButton.setAttribute("aria-label", "Move " + image.file.name + " up");
            upButton.disabled = index === 0;

            upButton.addEventListener("click", function () {
                if (index === 0) return;
                [images[index - 1], images[index]] = [images[index], images[index - 1]];
                clearGeneratedPdf();
                renderImages();
            });

            const downButton = document.createElement("button");
            downButton.type = "button";
            downButton.textContent = "↓";
            downButton.title = "Move image down";
            downButton.setAttribute("aria-label", "Move " + image.file.name + " down");
            downButton.disabled = index === images.length - 1;

            downButton.addEventListener("click", function () {
                if (index >= images.length - 1) return;
                [images[index], images[index + 1]] = [images[index + 1], images[index]];
                clearGeneratedPdf();
                renderImages();
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "×";
            removeButton.title = "Remove image";
            removeButton.className = "remove-button";
            removeButton.setAttribute("aria-label", "Remove " + image.file.name);

            removeButton.addEventListener("click", function () {
                URL.revokeObjectURL(image.previewUrl);
                images.splice(index, 1);
                clearGeneratedPdf();
                renderImages();
                updateView();
                setStatus("Image removed.", false);
            });

            actions.append(upButton, downButton, removeButton);
            item.append(preview, details, actions);
            imageList.appendChild(item);
        });

        imageCount.textContent = images.length +
            (images.length === 1 ? " image selected" : " images selected");
    }

    function updateView() {
        const hasImages = images.length > 0;
        uploadArea.hidden = hasImages;
        workspace.hidden = !hasImages;

        if (!hasImages) {
            resultArea.hidden = true;
        }
    }

    function addSelectedFiles(fileList) {
        const selectedFiles = Array.from(fileList || []);
        let added = 0;
        let rejected = 0;

        selectedFiles.forEach(function (file) {
            const isJpeg = file.type === "image/jpeg" || /\.(jpe?g)$/i.test(file.name);
            const isPng = file.type === "image/png" || /\.png$/i.test(file.name);

            if (!isJpeg && !isPng) {
                rejected++;
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            images.push({
                file: file,
                previewUrl: previewUrl,
                type: isPng ? "png" : "jpeg"
            });

            added++;
        });

        if (added > 0) {
            clearGeneratedPdf();
            renderImages();
            updateView();
        }

        if (added > 0 && rejected > 0) {
            setStatus(added + " image(s) added. " + rejected +
                " unsupported file(s) skipped. Use JPG or PNG.", true);
        } else if (added > 0) {
            setStatus(added + " image(s) added successfully.", false);
        } else if (rejected > 0) {
            setStatus("Please select valid JPG, JPEG or PNG images.", true);
        }
    }

    function openFilePicker() {
        if (isConverting) return;
        imageInput.click();
    }

    chooseImagesButton.addEventListener("click", openFilePicker);
    addMoreButton.addEventListener("click", openFilePicker);

    imageInput.addEventListener("change", function () {
        addSelectedFiles(imageInput.files);
        imageInput.value = "";
    });

    clearButton.addEventListener("click", function () {
        if (isConverting) return;

        releaseImageUrls();
        images = [];
        clearGeneratedPdf();
        renderImages();
        updateView();
        setStatus("All images cleared.", false);
        imageInput.value = "";
    });

    [pageSize, orientation, imageFit].forEach(function (setting) {
        setting.addEventListener("change", clearGeneratedPdf);
    });

    async function loadImageBytes(file) {
        const buffer = await file.arrayBuffer();

        if (file.type === "image/png" || /\.png$/i.test(file.name)) {
            return {
                bytes: buffer,
                type: "png"
            };
        }

        return {
            bytes: buffer,
            type: "jpeg"
        };
    }

    function getPageDimensions(imageWidth, imageHeight) {
        const selectedSize = pageSize.value;
        const selectedOrientation = orientation.value;

        if (selectedSize === "fit") {
            return {
                width: imageWidth,
                height: imageHeight
            };
        }

        let width;
        let height;

        if (selectedSize === "letter") {
            width = 612;
            height = 792;
        } else {
            width = 595.28;
            height = 841.89;
        }

        if (selectedOrientation === "landscape") {
            if (height > width) {
                [width, height] = [height, width];
            }
        } else if (selectedOrientation === "portrait") {
            if (width > height) {
                [width, height] = [height, width];
            }
        } else if (imageWidth > imageHeight) {
            if (height > width) {
                [width, height] = [height, width];
            }
        } else if (width > height) {
            [width, height] = [height, width];
        }

        return {
            width: width,
            height: height
        };
    }

    async function convertToPdf() {
        if (isConverting) return;

        if (images.length === 0) {
            setStatus("Please add at least one image first.", true);
            return;
        }

        if (!window.PDFLib) {
            setStatus("PDF library could not load. Check your internet connection, refresh the page and try again.", true);
            return;
        }

        isConverting = true;
        convertButton.disabled = true;
        convertButton.textContent = "Converting...";
        addMoreButton.disabled = true;
        clearButton.disabled = true;
        chooseImagesButton.disabled = true;
        setStatus("Preparing your images and creating the PDF. Please wait...", false);
        clearGeneratedPdf();

        try {
            const pdfDoc = await window.PDFLib.PDFDocument.create();

            for (let index = 0; index < images.length; index++) {
                setStatus("Processing image " + (index + 1) + " of " + images.length + "...", false);

                const imageData = await loadImageBytes(images[index].file);
                let embeddedImage;

                if (imageData.type === "png") {
                    embeddedImage = await pdfDoc.embedPng(imageData.bytes);
                } else {
                    embeddedImage = await pdfDoc.embedJpg(imageData.bytes);
                }

                const pageDimensions = getPageDimensions(
                    embeddedImage.width,
                    embeddedImage.height
                );

                const page = pdfDoc.addPage([
                    pageDimensions.width,
                    pageDimensions.height
                ]);

                let drawWidth = embeddedImage.width;
                let drawHeight = embeddedImage.height;

                const margin = pageSize.value === "fit" ? 0 : 24;
                const availableWidth = Math.max(1, pageDimensions.width - margin * 2);
                const availableHeight = Math.max(1, pageDimensions.height - margin * 2);

                if (imageFit.value === "fill") {
                    const scale = Math.max(
                        pageDimensions.width / embeddedImage.width,
                        pageDimensions.height / embeddedImage.height
                    );

                    drawWidth = embeddedImage.width * scale;
                    drawHeight = embeddedImage.height * scale;
                } else {
                    const scale = Math.min(
                        availableWidth / embeddedImage.width,
                        availableHeight / embeddedImage.height
                    );

                    drawWidth = embeddedImage.width * scale;
                    drawHeight = embeddedImage.height * scale;
                }

                page.drawImage(embeddedImage, {
                    x: (pageDimensions.width - drawWidth) / 2,
                    y: (pageDimensions.height - drawHeight) / 2,
                    width: drawWidth,
                    height: drawHeight
                });
            }

            const pdfBytes = await pdfDoc.save();
            const pdfBlob = new Blob([pdfBytes], {
                type: "application/pdf"
            });

            generatedPdfUrl = URL.createObjectURL(pdfBlob);
            downloadLink.href = generatedPdfUrl;
            downloadLink.download = "utilityhub-images.pdf";

            resultDetails.textContent =
                images.length + (images.length === 1 ? " image" : " images") +
                " converted into one PDF · " + formatBytes(pdfBlob.size);

            resultArea.hidden = false;
            setStatus("Conversion completed successfully.", false);
            resultArea.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        } catch (error) {
            console.error("JPG to PDF conversion error:", error);
            setStatus(
                "Conversion failed. Try a different image or a smaller file. If the problem continues, refresh and try again.",
                true
            );
        } finally {
            isConverting = false;
            convertButton.disabled = false;
            convertButton.textContent = "Convert to PDF";
            addMoreButton.disabled = false;
            clearButton.disabled = false;
            chooseImagesButton.disabled = false;
        }
    }

    convertButton.addEventListener("click", convertToPdf);

    convertAnotherButton.addEventListener("click", function () {
        clearGeneratedPdf();
        setStatus("Your images are still selected. You can change settings or convert again.", false);
        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    updateView();
    renderImages();
});
