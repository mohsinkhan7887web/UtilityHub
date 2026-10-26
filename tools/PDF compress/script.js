document.addEventListener("DOMContentLoaded", function () {
    const pdfInput = document.getElementById("pdfInput");
    const uploadArea = document.getElementById("uploadArea");
    const workspace = document.getElementById("workspace");
    const resultArea = document.getElementById("resultArea");

    const fileName = document.getElementById("fileName");
    const originalSize = document.getElementById("originalSize");

    const changeFileButton = document.getElementById("changeFileButton");
    const clearButton = document.getElementById("clearButton");
    const compressButton = document.getElementById("compressButton");

    const resultOriginalSize = document.getElementById("resultOriginalSize");
    const resultCompressedSize = document.getElementById("resultCompressedSize");
    const resultMessage = document.getElementById("resultMessage");
    const savingMessage = document.getElementById("savingMessage");

    const downloadButton = document.getElementById("downloadButton");
    const compressAnotherButton = document.getElementById("compressAnotherButton");

    let selectedFile = null;
    let compressedUrl = null;

    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function resetTool() {
        selectedFile = null;

        if (compressedUrl) {
            URL.revokeObjectURL(compressedUrl);
            compressedUrl = null;
        }

        pdfInput.value = "";

        uploadArea.hidden = false;
        workspace.hidden = true;
        resultArea.hidden = true;

        downloadButton.removeAttribute("href");

        compressButton.disabled = false;
        compressButton.textContent = "Compress PDF";
    }

    function showWorkspace(file) {
        selectedFile = file;

        fileName.textContent = file.name;
        originalSize.textContent = formatFileSize(file.size);

        uploadArea.hidden = true;
        workspace.hidden = false;
        resultArea.hidden = true;
    }

    pdfInput.addEventListener("change", function () {
        const file = pdfInput.files[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Please select a PDF file.");
            pdfInput.value = "";
            return;
        }

        showWorkspace(file);
    });

    changeFileButton.addEventListener("click", function () {
        pdfInput.click();
    });

    clearButton.addEventListener("click", function () {
        resetTool();
    });

    compressAnotherButton.addEventListener("click", function () {
        resetTool();
        pdfInput.click();
    });

    uploadArea.addEventListener("dragover", function (event) {
        event.preventDefault();
        uploadArea.style.borderColor = "#4f46e5";
        uploadArea.style.background = "#f8f9ff";
    });

    uploadArea.addEventListener("dragleave", function () {
        uploadArea.style.borderColor = "";
        uploadArea.style.background = "";
    });

    uploadArea.addEventListener("drop", function (event) {
        event.preventDefault();

        uploadArea.style.borderColor = "";
        uploadArea.style.background = "";

        const file = event.dataTransfer.files[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Please drop a PDF file.");
            return;
        }

        showWorkspace(file);
    });

    compressButton.addEventListener("click", async function () {
        if (!selectedFile) {
            alert("Please select a PDF file first.");
            return;
        }

        if (typeof PDFLib === "undefined") {
            alert("PDF processing library could not be loaded. Please check your internet connection and try again.");
            return;
        }

        compressButton.disabled = true;
        compressButton.textContent = "Compressing...";

        try {
            const fileBytes = await selectedFile.arrayBuffer();

            const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);

            /*
             * Important:
             * pdf-lib does not provide true image recompression.
             * We therefore rebuild the PDF structure and remove
             * unused objects where possible.
             *
             * The resulting file may be smaller, similar in size,
             * or occasionally larger depending on the source PDF.
             */

            const compressionLevel = document.querySelector(
                'input[name="compressionLevel"]:checked'
            );

            const level = compressionLevel
                ? compressionLevel.value
                : "medium";

            const copiedPdf = await PDFLib.PDFDocument.create();

            const pageCount = pdfDoc.getPageCount();

            const pageIndexes = [];

            for (let i = 0; i < pageCount; i++) {
                pageIndexes.push(i);
            }

            const copiedPages = await copiedPdf.copyPages(
                pdfDoc,
                pageIndexes
            );

            copiedPages.forEach(function (page) {
                copiedPdf.addPage(page);
            });

            /*
             * Compression levels mainly control whether metadata
             * is preserved. The actual PDF compression capability
             * depends on the original PDF contents.
             */

            if (level === "high") {
                try {
                    copiedPdf.setTitle("");
                    copiedPdf.setAuthor("");
                    copiedPdf.setSubject("");
                    copiedPdf.setKeywords([]);
                    copiedPdf.setCreator("UtilityHub");
                    copiedPdf.setProducer("UtilityHub");
                } catch (metadataError) {
                    console.log("Metadata cleanup skipped.");
                }
            }

            const compressedBytes = await copiedPdf.save({
                useObjectStreams: level !== "low",
                addDefaultPage: false
            });

            const compressedBlob = new Blob(
                [compressedBytes],
                {
                    type: "application/pdf"
                }
            );

            const compressedSize = compressedBlob.size;
            const originalFileSize = selectedFile.size;

            if (compressedUrl) {
                URL.revokeObjectURL(compressedUrl);
            }

            compressedUrl = URL.createObjectURL(compressedBlob);

            resultOriginalSize.textContent =
                formatFileSize(originalFileSize);

            resultCompressedSize.textContent =
                formatFileSize(compressedSize);

            const difference =
                originalFileSize - compressedSize;

            const percentage =
                originalFileSize > 0
                    ? (Math.abs(difference) / originalFileSize) * 100
                    : 0;

            if (compressedSize < originalFileSize) {
                resultMessage.textContent =
                    "Your PDF was optimized successfully.";

                savingMessage.textContent =
                    "Reduced by " +
                    percentage.toFixed(1) +
                    "%";
            } else if (compressedSize === originalFileSize) {
                resultMessage.textContent =
                    "The PDF was processed, but its size did not change.";

                savingMessage.textContent =
                    "No size reduction";
            } else {
                resultMessage.textContent =
                    "The PDF was processed, but this file could not be made smaller.";

                savingMessage.textContent =
                    "Original file was smaller";
            }

            const safeBaseName =
                selectedFile.name
                    .replace(/\.pdf$/i, "")
                    .replace(/[^\w\-]+/g, "-")
                    .replace(/^-+|-+$/g, "") || "document";

            downloadButton.href = compressedUrl;
            downloadButton.download =
                safeBaseName + "-compressed.pdf";

            workspace.hidden = true;
            resultArea.hidden = false;

        } catch (error) {
            console.error(error);

            alert(
                "Unable to process this PDF. The file may be damaged, encrypted, or unsupported."
            );

            compressButton.disabled = false;
            compressButton.textContent = "Compress PDF";
        }
    });

    resetTool();
});