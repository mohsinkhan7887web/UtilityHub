document.addEventListener("DOMContentLoaded", function () {

    const pdfInput = document.getElementById("pdfInput");

    const uploadArea = document.getElementById("uploadArea");

    const workspace = document.getElementById("workspace");

    const fileName = document.getElementById("fileName");

    const fileSize = document.getElementById("fileSize");

    const pageCount = document.getElementById("pageCount");

    const changeFileButton =
        document.getElementById("changeFileButton");

    const rangeSection =
        document.getElementById("rangeSection");

    const pageRange =
        document.getElementById("pageRange");

    const splitButton =
        document.getElementById("splitButton");

    const clearButton =
        document.getElementById("clearButton");

    const resultArea =
        document.getElementById("resultArea");

    const resultMessage =
        document.getElementById("resultMessage");

    const downloadList =
        document.getElementById("downloadList");

    const splitAnotherButton =
        document.getElementById("splitAnotherButton");

    const splitMethodButtons =
        document.querySelectorAll(
            'input[name="splitMethod"]'
        );


    let selectedFile = null;

    let selectedPdf = null;

    let generatedUrls = [];



    /* =========================
       FORMAT FILE SIZE
    ========================= */

    function formatFileSize(bytes) {

        if (bytes < 1024) {

            return bytes + " B";

        }

        if (bytes < 1024 * 1024) {

            return (
                (bytes / 1024).toFixed(1) +
                " KB"
            );

        }

        return (
            (bytes / (1024 * 1024)).toFixed(2) +
            " MB"
        );

    }



    /* =========================
       LOAD PDF
    ========================= */

    async function loadPdf(file) {

        if (!file) {
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


        try {

            const bytes =
                await file.arrayBuffer();


            selectedPdf =
                await PDFLib.PDFDocument.load(bytes);


            selectedFile = file;


            fileName.textContent =
                file.name;


            fileSize.textContent =
                formatFileSize(file.size);


            const totalPages =
                selectedPdf.getPageCount();


            pageCount.textContent =
                totalPages +
                (totalPages === 1
                    ? " page"
                    : " pages");


            uploadArea.style.display =
                "none";


            workspace.hidden =
                false;


            resultArea.hidden =
                true;


            pageRange.value =
                "";


            splitButton.disabled =
                false;


        } catch (error) {

            console.error(error);


            alert(
                "This PDF could not be opened. It may be damaged or password protected."
            );

        }

    }



    /* =========================
       FILE INPUT
    ========================= */

    pdfInput.addEventListener(
        "change",
        function () {

            if (pdfInput.files.length > 0) {

                loadPdf(
                    pdfInput.files[0]
                );

            }


            pdfInput.value = "";

        }
    );



    /* =========================
       CHANGE PDF
    ========================= */

    changeFileButton.addEventListener(
        "click",
        function () {

            pdfInput.click();

        }
    );



    /* =========================
       SPLIT METHOD
    ========================= */

    splitMethodButtons.forEach(
        function (button) {

            button.addEventListener(
                "change",
                function () {

                    if (
                        button.value === "range" &&
                        button.checked
                    ) {

                        rangeSection.style.display =
                            "";

                    }


                    if (
                        button.value === "each" &&
                        button.checked
                    ) {

                        rangeSection.style.display =
                            "none";

                    }

                }
            );

        }
    );



    /* =========================
       PARSE PAGE RANGE
    ========================= */

    function parsePageRange(
        rangeText,
        totalPages
    ) {

        const pages = new Set();


        const parts =
            rangeText
                .split(",")
                .map(function (part) {
                    return part.trim();
                })
                .filter(function (part) {
                    return part !== "";
                });


        if (parts.length === 0) {

            throw new Error(
                "Please enter a page range."
            );

        }


        parts.forEach(function (part) {

            if (part.includes("-")) {

                const range =
                    part.split("-")
                        .map(function (value) {
                            return value.trim();
                        });


                if (range.length !== 2) {

                    throw new Error(
                        "Invalid page range: " + part
                    );

                }


                const start =
                    Number(range[0]);

                const end =
                    Number(range[1]);


                if (
                    !Number.isInteger(start) ||
                    !Number.isInteger(end) ||
                    start < 1 ||
                    end < 1 ||
                    start > totalPages ||
                    end > totalPages ||
                    start > end
                ) {

                    throw new Error(
                        "Invalid page range: " + part
                    );

                }


                for (
                    let page = start;
                    page <= end;
                    page++
                ) {

                    pages.add(page);

                }

            } else {

                const page =
                    Number(part);


                if (
                    !Number.isInteger(page) ||
                    page < 1 ||
                    page > totalPages
                ) {

                    throw new Error(
                        "Page " +
                        part +
                        " does not exist in this PDF."
                    );

                }


                pages.add(page);

            }

        });


        return Array.from(pages)
            .sort(function (a, b) {
                return a - b;
            });

    }



    /* =========================
       CREATE PDF FROM PAGES
    ========================= */

    async function createPdfFromPages(
        pageNumbers
    ) {

        const newPdf =
            await PDFLib.PDFDocument.create();


        const pageIndexes =
            pageNumbers.map(function (page) {

                return page - 1;

            });


        const copiedPages =
            await newPdf.copyPages(
                selectedPdf,
                pageIndexes
            );


        copiedPages.forEach(
            function (page) {

                newPdf.addPage(page);

            }
        );


        return await newPdf.save();

    }



    /* =========================
       CREATE DOWNLOAD ITEM
    ========================= */

    function createDownloadItem(
        blob,
        name
    ) {

        const url =
            URL.createObjectURL(blob);


        generatedUrls.push(url);


        const item =
            document.createElement("div");

        item.className =
            "download-item";


        const info =
            document.createElement("div");

        info.className =
            "download-item-info";


        const title =
            document.createElement("strong");

        title.textContent =
            name;


        const size =
            document.createElement("span");

        size.textContent =
            formatFileSize(blob.size);


        info.appendChild(title);

        info.appendChild(size);


        const link =
            document.createElement("a");

        link.className =
            "download-link";

        link.href =
            url;

        link.download =
            name;

        link.textContent =
            "Download";


        item.appendChild(info);

        item.appendChild(link);


        downloadList.appendChild(item);

    }



    /* =========================
       SPLIT PDF
    ========================= */

    splitButton.addEventListener(
        "click",
        async function () {

            if (!selectedPdf) {

                alert(
                    "Please select a PDF file first."
                );

                return;

            }


            const totalPages =
                selectedPdf.getPageCount();


            const selectedMethod =
                document.querySelector(
                    'input[name="splitMethod"]:checked'
                ).value;


            let pages;


            try {

                if (
                    selectedMethod === "range"
                ) {

                    pages =
                        parsePageRange(
                            pageRange.value,
                            totalPages
                        );

                }

            } catch (error) {

                alert(error.message);

                return;

            }


            splitButton.disabled =
                true;

            splitButton.textContent =
                "Splitting PDF...";


            try {

                clearGeneratedUrls();


                downloadList.innerHTML =
                    "";


                let outputCount = 0;


                if (
                    selectedMethod === "range"
                ) {

                    const pdfBytes =
                        await createPdfFromPages(
                            pages
                        );


                    const blob =
                        new Blob(
                            [pdfBytes],
                            {
                                type: "application/pdf"
                            }
                        );


                    createDownloadItem(
                        blob,
                        "utilityhub-pages-" +
                        pages.join("-") +
                        ".pdf"
                    );


                    outputCount = 1;

                } else {


                    for (
                        let page = 1;
                        page <= totalPages;
                        page++
                    ) {

                        const pdfBytes =
                            await createPdfFromPages(
                                [page]
                            );


                        const blob =
                            new Blob(
                                [pdfBytes],
                                {
                                    type: "application/pdf"
                                }
                            );


                        createDownloadItem(
                            blob,
                            "utilityhub-page-" +
                            page +
                            ".pdf"
                        );


                        outputCount++;

                    }

                }


                resultMessage.textContent =
                    outputCount +
                    (outputCount === 1
                        ? " PDF file was created successfully."
                        : " PDF files were created successfully.");


                resultArea.hidden =
                    false;


                splitButton.disabled =
                    false;

                splitButton.textContent =
                    "Split PDF";


                resultArea.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


            } catch (error) {

                console.error(error);


                alert(
                    "Could not split this PDF. Please make sure the PDF is valid and not password protected."
                );


                splitButton.disabled =
                    false;

                splitButton.textContent =
                    "Split PDF";

            }

        }
    );



    /* =========================
       CLEAR GENERATED URLS
    ========================= */

    function clearGeneratedUrls() {

        generatedUrls.forEach(
            function (url) {

                URL.revokeObjectURL(url);

            }
        );


        generatedUrls = [];

    }



    /* =========================
       RESET TOOL
    ========================= */

    function resetTool() {

        clearGeneratedUrls();


        selectedFile = null;

        selectedPdf = null;


        fileName.textContent =
            "document.pdf";


        fileSize.textContent =
            "0 KB";


        pageCount.textContent =
            "0 pages";


        pageRange.value =
            "";


        downloadList.innerHTML =
            "";


        resultArea.hidden =
            true;


        workspace.hidden =
            true;


        uploadArea.style.display =
            "";


        splitButton.disabled =
            false;

        splitButton.textContent =
            "Split PDF";


        document.querySelector(
            'input[name="splitMethod"][value="range"]'
        ).checked = true;


        rangeSection.style.display =
            "";

    }



    /* =========================
       CLEAR BUTTON
    ========================= */

    clearButton.addEventListener(
        "click",
        function () {

            resetTool();

        }
    );



    /* =========================
       SPLIT ANOTHER
    ========================= */

    splitAnotherButton.addEventListener(
        "click",
        function () {

            resetTool();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );



    /* =========================
       DRAG & DROP
    ========================= */

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();


            uploadArea.style.borderColor =
                "#2563eb";


            uploadArea.style.background =
                "#eff6ff";

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.style.borderColor =
                "";

            uploadArea.style.background =
                "";

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            uploadArea.style.borderColor =
                "";

            uploadArea.style.background =
                "";


            if (
                event.dataTransfer.files.length > 0
            ) {

                loadPdf(
                    event.dataTransfer.files[0]
                );

            }

        }
    );


});