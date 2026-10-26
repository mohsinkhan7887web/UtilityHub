document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // GET HTML ELEMENTS
    // ==============================

    const pdfInput = document.getElementById("pdfInput");

    const choosePdfButton =
        document.getElementById("choosePdfButton");

    const uploadArea =
        document.getElementById("uploadArea");

    const workspace =
        document.getElementById("workspace");

    const progressArea =
        document.getElementById("progressArea");

    const resultArea =
        document.getElementById("resultArea");


    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");


    const changeFileButton =
        document.getElementById("changeFileButton");

    const clearButton =
        document.getElementById("clearButton");

    const convertButton =
        document.getElementById("convertButton");

    const convertAnotherButton =
        document.getElementById("convertAnotherButton");


    const progressText =
        document.getElementById("progressText");

    const progressFill =
        document.getElementById("progressFill");


    const resultMessage =
        document.getElementById("resultMessage");

    const resultsList =
        document.getElementById("resultsList");

    const downloadAllButton =
        document.getElementById("downloadAllButton");


    // ==============================
    // VARIABLES
    // ==============================

    let selectedFile = null;

    let generatedImages = [];


    // ==============================
    // FILE SIZE FORMAT
    // ==============================

    function formatFileSize(bytes) {

        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {

            return (
                bytes / 1024
            ).toFixed(1) + " KB";

        }

        return (
            bytes / (1024 * 1024)
        ).toFixed(2) + " MB";
    }


    // ==============================
    // OPEN FILE PICKER
    // ==============================

    function openFilePicker() {

        pdfInput.click();

    }


    // Choose PDF button

    if (choosePdfButton) {

        choosePdfButton.addEventListener(
            "click",
            openFilePicker
        );

    }


    // ==============================
    // SHOW SELECTED FILE
    // ==============================

    function showSelectedFile(file) {

        selectedFile = file;


        fileName.textContent =
            file.name;


        fileSize.textContent =
            formatFileSize(file.size);


        uploadArea.hidden = true;

        workspace.hidden = false;

        progressArea.hidden = true;

        resultArea.hidden = true;


        console.log(
            "PDF selected:",
            file.name
        );

    }


    // ==============================
    // FILE SELECT
    // ==============================

    pdfInput.addEventListener(
        "change",
        function () {

            const file =
                pdfInput.files[0];


            if (!file) {

                return;

            }


            const isPDF =
                file.type === "application/pdf" ||
                file.name
                    .toLowerCase()
                    .endsWith(".pdf");


            if (!isPDF) {

                alert(
                    "Please select a PDF file."
                );

                pdfInput.value = "";

                return;

            }


            showSelectedFile(file);

        }
    );


    // ==============================
    // CHANGE PDF
    // ==============================

    if (changeFileButton) {

        changeFileButton.addEventListener(
            "click",
            function () {

                openFilePicker();

            }
        );

    }


    // ==============================
    // RESET TOOL
    // ==============================

    function resetTool() {


        generatedImages.forEach(
            function (image) {

                if (image.url) {

                    URL.revokeObjectURL(
                        image.url
                    );

                }

            }
        );


        generatedImages = [];

        selectedFile = null;


        pdfInput.value = "";


        uploadArea.hidden = false;

        workspace.hidden = true;

        progressArea.hidden = true;

        resultArea.hidden = true;


        resultsList.innerHTML = "";


        progressFill.style.width =
            "0%";


        convertButton.disabled =
            false;


        convertButton.textContent =
            "Convert to JPG";

    }


    // ==============================
    // CLEAR BUTTON
    // ==============================

    clearButton.addEventListener(
        "click",
        function () {

            resetTool();

        }
    );


    // ==============================
    // CONVERT ANOTHER
    // ==============================

    convertAnotherButton.addEventListener(
        "click",
        function () {

            resetTool();

            setTimeout(
                function () {

                    openFilePicker();

                },
                100
            );

        }
    );


    // ==============================
    // DRAG OVER
    // ==============================

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.style.borderColor =
                "#4f46e5";

            uploadArea.style.background =
                "#f8f9ff";

        }
    );


    // ==============================
    // DRAG LEAVE
    // ==============================

    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.style.borderColor =
                "";

            uploadArea.style.background =
                "";

        }
    );


    // ==============================
    // DROP PDF
    // ==============================

    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            uploadArea.style.borderColor =
                "";

            uploadArea.style.background =
                "";


            const file =
                event.dataTransfer.files[0];


            if (!file) {

                return;

            }


            const isPDF =
                file.type === "application/pdf" ||
                file.name
                    .toLowerCase()
                    .endsWith(".pdf");


            if (!isPDF) {

                alert(
                    "Please drop a PDF file."
                );

                return;

            }


            showSelectedFile(file);

        }
    );


    // ==============================
    // RENDER PDF PAGE
    // ==============================

    async function renderPDFPage(
        page,
        scale,
        quality
    ) {


        const viewport =
            page.getViewport({
                scale: scale
            });


        const canvas =
            document.createElement(
                "canvas"
            );


        const context =
            canvas.getContext(
                "2d"
            );


        canvas.width =
            Math.ceil(
                viewport.width
            );


        canvas.height =
            Math.ceil(
                viewport.height
            );


        await page.render({

            canvasContext:
                context,

            viewport:
                viewport

        }).promise;


        return new Promise(
            function (resolve) {

                canvas.toBlob(
                    function (blob) {

                        resolve({

                            blob:
                                blob,

                            width:
                                canvas.width,

                            height:
                                canvas.height

                        });

                    },

                    "image/jpeg",

                    quality

                );

            }
        );

    }


    // ==============================
    // CREATE RESULT ITEM
    // ==============================

    function createResultItem(
        imageData,
        pageNumber
    ) {


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "result-item";


        const thumbnail =
            document.createElement(
                "img"
            );


        thumbnail.className =
            "result-thumbnail";


        thumbnail.src =
            imageData.url;


        thumbnail.alt =
            "PDF Page " +
            pageNumber;


        const details =
            document.createElement(
                "div"
            );


        details.className =
            "result-details";


        const title =
            document.createElement(
                "strong"
            );


        title.textContent =
            imageData.fileName;


        const size =
            document.createElement(
                "span"
            );


        size.textContent =
            formatFileSize(
                imageData.blob.size
            ) +
            " • " +
            imageData.width +
            " × " +
            imageData.height +
            " px";


        details.appendChild(title);

        details.appendChild(size);


        const downloadLink =
            document.createElement(
                "a"
            );


        downloadLink.className =
            "download-button";


        downloadLink.href =
            imageData.url;


        downloadLink.download =
            imageData.fileName;


        downloadLink.textContent =
            "Download";


        item.appendChild(
            thumbnail
        );

        item.appendChild(
            details
        );

        item.appendChild(
            downloadLink
        );


        return item;

    }


    // ==============================
    // DOWNLOAD ALL
    // ==============================

    downloadAllButton.addEventListener(
        "click",
        async function () {


            if (
                generatedImages.length === 0
            ) {

                return;

            }


            for (
                let i = 0;
                i < generatedImages.length;
                i++
            ) {


                const image =
                    generatedImages[i];


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    image.url;


                link.download =
                    image.fileName;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                await new Promise(
                    function (resolve) {

                        setTimeout(
                            resolve,
                            300
                        );

                    }
                );

            }

        }
    );


    // ==============================
    // CONVERT PDF TO JPG
    // ==============================

    convertButton.addEventListener(
        "click",
        async function () {


            if (!selectedFile) {

                alert(
                    "Please select a PDF file first."
                );

                return;

            }


            // Check PDF.js ONLY HERE

            if (
                typeof window.pdfjsLib ===
                "undefined"
            ) {

                alert(
                    "PDF conversion library is not loaded. Please check your internet connection and refresh the page."
                );

                return;

            }


            /*
             * PDF.js worker
             */

            window.pdfjsLib
                .GlobalWorkerOptions
                .workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


            convertButton.disabled =
                true;


            convertButton.textContent =
                "Converting...";


            workspace.hidden =
                true;


            progressArea.hidden =
                false;


            resultArea.hidden =
                true;


            try {


                // Read PDF

                const arrayBuffer =
                    await selectedFile.arrayBuffer();


                // Load PDF

                const pdf =
                    await window.pdfjsLib
                        .getDocument({
                            data:
                                arrayBuffer
                        })
                        .promise;


                const totalPages =
                    pdf.numPages;


                // Quality

                const qualityInput =
                    document.querySelector(
                        'input[name="jpgQuality"]:checked'
                    );


                const quality =
                    qualityInput
                        ? Number(
                            qualityInput.value
                        )
                        : 0.9;


                // Resolution

                const scaleSelect =
                    document.getElementById(
                        "scaleSelect"
                    );


                const scale =
                    scaleSelect
                        ? Number(
                            scaleSelect.value
                        )
                        : 1.5;


                // Clear previous results

                generatedImages =
                    [];


                resultsList.innerHTML =
                    "";


                // Filename

                const baseName =
                    selectedFile.name
                        .replace(
                            /\.pdf$/i,
                            ""
                        )
                        .replace(
                            /[^\w\-]+/g,
                            "-"
                        )
                        .replace(
                            /^-+|-+$/g,
                            ""
                        ) ||
                    "document";


                // Convert every page

                for (
                    let pageNumber = 1;
                    pageNumber <= totalPages;
                    pageNumber++
                ) {


                    progressText.textContent =
                        "Converting page " +
                        pageNumber +
                        " of " +
                        totalPages;


                    progressFill.style.width =
                        (
                            (
                                pageNumber - 1
                            ) /
                            totalPages *
                            100
                        ) +
                        "%";


                    const page =
                        await pdf.getPage(
                            pageNumber
                        );


                    const imageData =
                        await renderPDFPage(
                            page,
                            scale,
                            quality
                        );


                    imageData.url =
                        URL.createObjectURL(
                            imageData.blob
                        );


                    imageData.fileName =
                        baseName +
                        "-page-" +
                        pageNumber +
                        ".jpg";


                    generatedImages.push(
                        imageData
                    );


                    progressFill.style.width =
                        (
                            pageNumber /
                            totalPages *
                            100
                        ) +
                        "%";

                }


                // Display results

                generatedImages.forEach(
                    function (
                        imageData,
                        index
                    ) {


                        const item =
                            createResultItem(
                                imageData,
                                index + 1
                            );


                        resultsList.appendChild(
                            item
                        );

                    }
                );


                resultMessage.textContent =
                    totalPages +
                    (
                        totalPages === 1
                            ? " page was converted successfully."
                            : " pages were converted successfully."
                    );


                progressArea.hidden =
                    true;


                resultArea.hidden =
                    false;


                convertButton.disabled =
                    false;


                convertButton.textContent =
                    "Convert to JPG";


            } catch (error) {


                console.error(
                    "PDF to JPG Error:",
                    error
                );


                progressArea.hidden =
                    true;


                workspace.hidden =
                    false;


                convertButton.disabled =
                    false;


                convertButton.textContent =
                    "Convert to JPG";


                alert(
                    "PDF conversion failed. Please try another PDF file."
                );

            }

        }
    );


    // ==============================
    // INITIAL STATE
    // ==============================

    resetTool();

});