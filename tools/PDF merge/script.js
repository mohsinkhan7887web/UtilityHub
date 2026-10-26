document.addEventListener("DOMContentLoaded", function () {

    const pdfInput = document.getElementById("pdfInput");

    const uploadArea = document.getElementById("uploadArea");

    const fileSection = document.getElementById("fileSection");

    const fileList = document.getElementById("fileList");

    const fileCount = document.getElementById("fileCount");

    const addMoreButton = document.getElementById("addMoreButton");

    const clearButton = document.getElementById("clearButton");

    const mergeButton = document.getElementById("mergeButton");

    const resultArea = document.getElementById("resultArea");

    const resultMessage = document.getElementById("resultMessage");

    const downloadButton = document.getElementById("downloadButton");

    const mergeAnotherButton =
        document.getElementById("mergeAnotherButton");


    let selectedFiles = [];

    let mergedPdfUrl = null;



    /* =========================
       FILE SIZE FORMAT
    ========================= */

    function formatFileSize(bytes) {

        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }



    /* =========================
       CHECK PDF
    ========================= */

    function isPdfFile(file) {

        return (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
        );

    }



    /* =========================
       ADD FILES
    ========================= */

    function addFiles(files) {

        const newFiles = Array.from(files);

        let added = 0;


        newFiles.forEach(function (file) {

            if (!isPdfFile(file)) {
                return;
            }


            /*
             * Prevent duplicate file selection
             */

            const alreadyAdded = selectedFiles.some(function (existingFile) {

                return (
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified === file.lastModified
                );

            });


            if (alreadyAdded) {
                return;
            }


            selectedFiles.push(file);

            added++;

        });


        if (added === 0 && newFiles.length > 0) {

            alert(
                "Please select PDF files. Duplicate files are ignored."
            );

        }


        renderFileList();

    }



    /* =========================
       RENDER FILE LIST
    ========================= */

    function renderFileList() {

        fileList.innerHTML = "";


        if (selectedFiles.length === 0) {

            fileSection.hidden = true;

            uploadArea.style.display = "";

            fileCount.textContent = "0 files selected";

            return;
        }


        fileSection.hidden = false;

        uploadArea.style.display = "none";


        fileCount.textContent =
            selectedFiles.length +
            (selectedFiles.length === 1
                ? " file selected"
                : " files selected");


        selectedFiles.forEach(function (file, index) {

            const fileItem = document.createElement("div");

            fileItem.className = "file-item";


            const number = document.createElement("div");

            number.className = "file-number";

            number.textContent = index + 1;


            const fileInfo = document.createElement("div");

            fileInfo.className = "file-info";


            const fileName = document.createElement("span");

            fileName.className = "file-name";

            fileName.textContent = file.name;


            const fileSize = document.createElement("span");

            fileSize.className = "file-size";

            fileSize.textContent = formatFileSize(file.size);


            fileInfo.appendChild(fileName);

            fileInfo.appendChild(fileSize);


            const removeButton = document.createElement("button");

            removeButton.type = "button";

            removeButton.className = "remove-file";

            removeButton.textContent = "×";

            removeButton.setAttribute(
                "aria-label",
                "Remove " + file.name
            );


            removeButton.addEventListener("click", function () {

                selectedFiles.splice(index, 1);

                renderFileList();

            });


            fileItem.appendChild(number);

            fileItem.appendChild(fileInfo);

            fileItem.appendChild(removeButton);


            fileList.appendChild(fileItem);

        });


        /*
         * Need at least two PDFs to merge
         */

        mergeButton.disabled = selectedFiles.length < 2;

    }



    /* =========================
       FILE INPUT
    ========================= */

    pdfInput.addEventListener("change", function () {

        if (pdfInput.files.length > 0) {

            addFiles(pdfInput.files);

        }


        /*
         * Reset input so the same file
         * can be selected again later.
         */

        pdfInput.value = "";

    });



    /* =========================
       ADD MORE
    ========================= */

    addMoreButton.addEventListener("click", function () {

        pdfInput.click();

    });



    /* =========================
       MERGE PDFS
    ========================= */

    mergeButton.addEventListener("click", async function () {

        if (selectedFiles.length < 2) {

            alert("Please select at least two PDF files.");

            return;

        }


        if (
            typeof PDFLib === "undefined" ||
            !PDFLib.PDFDocument
        ) {

            alert(
                "PDF engine could not load. Please check your internet connection and refresh the page."
            );

            return;

        }


        mergeButton.disabled = true;

        mergeButton.textContent = "Merging PDFs...";


        try {

            const mergedPdf =
                await PDFLib.PDFDocument.create();


            /*
             * Process files in the exact order
             * shown in the list.
             */

            for (const file of selectedFiles) {

                const fileBytes =
                    await file.arrayBuffer();


                const sourcePdf =
                    await PDFLib.PDFDocument.load(fileBytes);


                const pageIndices =
                    sourcePdf.getPageIndices();


                const copiedPages =
                    await mergedPdf.copyPages(
                        sourcePdf,
                        pageIndices
                    );


                copiedPages.forEach(function (page) {

                    mergedPdf.addPage(page);

                });

            }


            /*
             * Create final PDF
             */

            const mergedPdfBytes =
                await mergedPdf.save();


            /*
             * Remove previous download URL
             */

            if (mergedPdfUrl) {

                URL.revokeObjectURL(mergedPdfUrl);

            }


            const mergedBlob =
                new Blob(
                    [mergedPdfBytes],
                    {
                        type: "application/pdf"
                    }
                );


            mergedPdfUrl =
                URL.createObjectURL(mergedBlob);


            /*
             * Download link
             */

            downloadButton.href =
                mergedPdfUrl;


            downloadButton.download =
                "utilityhub-merged.pdf";


            resultMessage.textContent =
                selectedFiles.length +
                " PDF files were successfully merged into one PDF.";


            resultArea.hidden = false;


            mergeButton.disabled = false;

            mergeButton.textContent =
                "Merge PDFs";


            resultArea.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        } catch (error) {

            console.error(error);


            alert(
                "Could not merge the PDF files. Please make sure the PDFs are valid and not password protected."
            );


            mergeButton.disabled = false;

            mergeButton.textContent =
                "Merge PDFs";

        }

    });



    /* =========================
       CLEAR ALL
    ========================= */

    clearButton.addEventListener("click", function () {

        selectedFiles = [];


        renderFileList();


        resultArea.hidden = true;


        if (mergedPdfUrl) {

            URL.revokeObjectURL(mergedPdfUrl);

            mergedPdfUrl = null;

        }


        downloadButton.removeAttribute("href");

    });



    /* =========================
       MERGE ANOTHER
    ========================= */

    mergeAnotherButton.addEventListener("click", function () {

        selectedFiles = [];


        renderFileList();


        resultArea.hidden = true;


        if (mergedPdfUrl) {

            URL.revokeObjectURL(mergedPdfUrl);

            mergedPdfUrl = null;

        }


        downloadButton.removeAttribute("href");


        uploadArea.style.display = "";

        fileSection.hidden = true;


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });



    /* =========================
       DRAG & DROP
    ========================= */

    uploadArea.addEventListener("dragover", function (event) {

        event.preventDefault();

        uploadArea.style.borderColor = "#2563eb";

        uploadArea.style.background = "#eff6ff";

    });


    uploadArea.addEventListener("dragleave", function () {

        uploadArea.style.borderColor = "";

        uploadArea.style.background = "";

    });


    uploadArea.addEventListener("drop", function (event) {

        event.preventDefault();


        uploadArea.style.borderColor = "";

        uploadArea.style.background = "";


        if (event.dataTransfer.files.length > 0) {

            addFiles(event.dataTransfer.files);

        }

    });


});