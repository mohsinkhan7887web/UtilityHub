
document.addEventListener("DOMContentLoaded", function () {
    const uploadArea = document.getElementById("uploadArea");
    const workspace = document.getElementById("workspace");
    const pdfInput = document.getElementById("pdfInput");
    const choosePdfButton = document.getElementById("choosePdfButton");
    const changePdfButton = document.getElementById("changePdfButton");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const pageCount = document.getElementById("pageCount");
    const rotationAngle = document.getElementById("rotationAngle");
    const rotationMode = document.getElementById("rotationMode");
    const pageSelectionArea = document.getElementById("pageSelectionArea");
    const pageSelection = document.getElementById("pageSelection");
    const clearButton = document.getElementById("clearButton");
    const rotateButton = document.getElementById("rotateButton");
    const statusMessage = document.getElementById("statusMessage");
    const resultArea = document.getElementById("resultArea");
    const resultDetails = document.getElementById("resultDetails");
    const downloadLink = document.getElementById("downloadLink");
    const rotateAnotherButton = document.getElementById("rotateAnotherButton");

    let selectedPdf = null;
    let totalPages = 0;
    let generatedPdfUrl = null;
    let isProcessing = false;

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function setStatus(message, isError) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "#c93649" : "";
    }

    function clearGeneratedPdf() {
        if (generatedPdfUrl) {
            URL.revokeObjectURL(generatedPdfUrl);
            generatedPdfUrl = null;
        }

        downloadLink.removeAttribute("href");
        resultArea.hidden = true;
    }

    function updateView() {
        uploadArea.hidden = Boolean(selectedPdf);
        workspace.hidden = !selectedPdf;
    }

    function updateRotationMode() {
        pageSelectionArea.hidden = rotationMode.value !== "selected";
    }

    function showSelectedPdf(file) {
        const isPdf = file.type === "application/pdf" ||
            /\.pdf$/i.test(file.name);

        if (!isPdf) {
            setStatus("Please select a valid PDF file.", true);
            return;
        }

        if (file.size === 0) {
            setStatus("This file is empty. Please select another PDF.", true);
            return;
        }

        clearGeneratedPdf();
        selectedPdf = file;
        totalPages = 0;
        fileName.textContent = file.name;
        fileSize.textContent = "File size: " + formatBytes(file.size);
        pageCount.textContent = "Checking page count...";

        updateView();
        setStatus("PDF selected. Reading document information...", false);

        readPageCount(file);
    }

    async function readPageCount(file) {
        try {
            if (!window.PDFLib) {
                pageCount.textContent = "Page count unavailable";
                setStatus(
                    "PDF library could not load. Check your internet connection and refresh the page.",
                    true
                );
                return;
            }

            const pdfDoc = await window.PDFLib.PDFDocument.load(
                await file.arrayBuffer()
            );

            if (selectedPdf !== file) return;

            totalPages = pdfDoc.getPageCount();
            pageCount.textContent = "Total pages: " + totalPages;
            setStatus("PDF loaded successfully.", false);
        } catch (error) {
            console.error("PDF loading error:", error);
            if (selectedPdf === file) {
                totalPages = 0;
                pageCount.textContent = "Could not read page count";
                setStatus(
                    "Unable to read this PDF. It may be damaged, encrypted or unsupported.",
                    true
                );
            }
        }
    }

    function openFilePicker() {
        if (isProcessing) return;
        pdfInput.click();
    }

    choosePdfButton.addEventListener("click", openFilePicker);
    changePdfButton.addEventListener("click", openFilePicker);

    pdfInput.addEventListener("change", function () {
        const file = pdfInput.files && pdfInput.files[0];
        if (file) showSelectedPdf(file);
        pdfInput.value = "";
    });

    rotationMode.addEventListener("change", function () {
        updateRotationMode();
        clearGeneratedPdf();
    });

    rotationAngle.addEventListener("change", clearGeneratedPdf);
    pageSelection.addEventListener("input", clearGeneratedPdf);

    function parsePageSelection(input, total) {
        const value = input.trim();

        if (!value) {
            throw new Error("Enter the page numbers you want to rotate.");
        }

        const parts = value.split(",");
        const pages = new Set();

        for (const part of parts) {
            const item = part.trim();

            if (!item) {
                throw new Error("Check the page list. There is an empty entry.");
            }

            if (/^\d+$/.test(item)) {
                const page = Number(item);

                if (page < 1 || page > total) {
                    throw new Error("Page numbers must be between 1 and " + total + ".");
                }

                pages.add(page - 1);
            } else if (/^\d+\s*-\s*\d+$/.test(item)) {
                const range = item.split("-").map(function (number) {
                    return Number(number.trim());
                });

                const start = range[0];
                const end = range[1];

                if (start < 1 || end > total || start > end) {
                    throw new Error("Check your page range. Use valid ranges from 1 to " + total + ".");
                }

                for (let page = start; page <= end; page++) {
                    pages.add(page - 1);
                }
            } else {
                throw new Error(
                    'Invalid page format. Example: "1,3,5-7".'
                );
            }
        }

        return pages;
    }

    async function rotatePdf() {
        if (isProcessing) return;

        if (!selectedPdf) {
            setStatus("Please choose a PDF file first.", true);
            return;
        }

        if (!window.PDFLib) {
            setStatus(
                "PDF library could not load. Check your internet connection and refresh the page.",
                true
            );
            return;
        }

        isProcessing = true;
        rotateButton.disabled = true;
        rotateButton.textContent = "Rotating...";
        changePdfButton.disabled = true;
        clearButton.disabled = true;
        choosePdfButton.disabled = true;
        setStatus("Preparing your PDF...", false);
        clearGeneratedPdf();

        try {
            const pdfDoc = await window.PDFLib.PDFDocument.load(
                await selectedPdf.arrayBuffer()
            );

            const pages = pdfDoc.getPages();
            const total = pages.length;

            let targetPages;

            if (rotationMode.value === "selected") {
                targetPages = parsePageSelection(pageSelection.value, total);
            } else {
                targetPages = new Set(
                    pages.map(function (_, index) {
                        return index;
                    })
                );
            }

            if (targetPages.size === 0) {
                throw new Error("No pages were selected to rotate.");
            }

            const angle = Number(rotationAngle.value);

            for (const index of targetPages) {
                const page = pages[index];
                const currentAngle = page.getRotation().angle;
                const newAngle = ((currentAngle + angle) % 360 + 360) % 360;

                page.setRotation(window.PDFLib.degrees(newAngle));
            }

            setStatus("Saving your rotated PDF...", false);

            const pdfBytes = await pdfDoc.save();
            const pdfBlob = new Blob([pdfBytes], {
                type: "application/pdf"
            });

            generatedPdfUrl = URL.createObjectURL(pdfBlob);
            downloadLink.href = generatedPdfUrl;
            downloadLink.download = "utilityhub-rotated.pdf";

            resultDetails.textContent =
                targetPages.size + (targetPages.size === 1 ? " page rotated" : " pages rotated") +
                " · " + formatBytes(pdfBlob.size);

            resultArea.hidden = false;
            setStatus("PDF rotated successfully!", false);

            resultArea.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        } catch (error) {
            console.error("PDF rotation error:", error);
            setStatus(
                error.message || "Could not rotate this PDF. Please try another file.",
                true
            );
        } finally {
            isProcessing = false;
            rotateButton.disabled = false;
            rotateButton.textContent = "Rotate PDF";
            changePdfButton.disabled = false;
            clearButton.disabled = false;
            choosePdfButton.disabled = false;
        }
    }

    rotateButton.addEventListener("click", rotatePdf);

    clearButton.addEventListener("click", function () {
        if (isProcessing) return;

        clearGeneratedPdf();
        selectedPdf = null;
        totalPages = 0;
        pdfInput.value = "";
        pageSelection.value = "";
        pageSelectionArea.hidden = true;
        rotationMode.value = "all";
        rotationAngle.value = "90";

        updateView();
        setStatus("PDF cleared. Choose another file to begin.", false);
    });

    rotateAnotherButton.addEventListener("click", function () {
        clearGeneratedPdf();
        selectedPdf = null;
        totalPages = 0;
        pdfInput.value = "";
        pageSelection.value = "";
        rotationMode.value = "all";
        rotationAngle.value = "90";

        updateRotationMode();
        updateView();
        setStatus("Choose a PDF to rotate another document.", false);
        uploadArea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    updateRotationMode();
    updateView();
});
