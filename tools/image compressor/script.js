document.addEventListener("DOMContentLoaded", function () {

    const imageInput = document.getElementById("imageInput");
    const uploadArea = document.getElementById("uploadArea");

    const settingsArea = document.getElementById("settingsArea");
    const resultArea = document.getElementById("resultArea");

    const qualityRange = document.getElementById("qualityRange");
    const qualityValue = document.getElementById("qualityValue");

    const formatSelect = document.getElementById("formatSelect");

    const compressButton = document.getElementById("compressButton");
    const resetButton = document.getElementById("resetButton");

    const previewImage = document.getElementById("previewImage");

    const originalSize = document.getElementById("originalSize");
    const compressedSize = document.getElementById("compressedSize");

    const savingMessage = document.getElementById("savingMessage");
    const downloadButton = document.getElementById("downloadButton");


    let selectedFile = null;
    let compressedUrl = null;


    /* Format file size */

    function formatFileSize(bytes) {

        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }


    /* Show selected image */

    imageInput.addEventListener("change", function () {

        const file = imageInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please choose a valid image file.");
            imageInput.value = "";
            return;
        }

        selectedFile = file;

        originalSize.textContent = formatFileSize(file.size);

        settingsArea.hidden = false;
        resultArea.hidden = true;

        uploadArea.style.display = "none";
    });


    /* Quality slider */

    qualityRange.addEventListener("input", function () {

        qualityValue.textContent = qualityRange.value + "%";

    });


    /* Compress image */

    compressButton.addEventListener("click", function () {

        if (!selectedFile) {
            alert("Please choose an image first.");
            return;
        }


        compressButton.disabled = true;
        compressButton.textContent = "Compressing...";


        const reader = new FileReader();


        reader.onload = function (event) {

            const image = new Image();


            image.onload = function () {

                const canvas = document.createElement("canvas");

                const context = canvas.getContext("2d");


                canvas.width = image.width;
                canvas.height = image.height;


                /*
                 * White background prevents transparent PNG images
                 * from becoming black when converted to JPG.
                 */

                const selectedFormat = formatSelect.value;

                if (selectedFormat === "image/jpeg") {

                    context.fillStyle = "#ffffff";

                    context.fillRect(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                }


                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                const quality =
                    Number(qualityRange.value) / 100;


                canvas.toBlob(
                    function (blob) {

                        if (!blob) {

                            alert("Compression failed. Please try another image.");

                            compressButton.disabled = false;
                            compressButton.textContent = "Compress Image";

                            return;
                        }


                        /* Remove previous object URL */

                        if (compressedUrl) {
                            URL.revokeObjectURL(compressedUrl);
                        }


                        compressedUrl = URL.createObjectURL(blob);


                        /* Preview */

                        previewImage.src = compressedUrl;


                        /* Sizes */

                        compressedSize.textContent =
                            formatFileSize(blob.size);


                        const originalBytes = selectedFile.size;
                        const compressedBytes = blob.size;


                        if (compressedBytes < originalBytes) {

                            const saved =
                                ((originalBytes - compressedBytes) /
                                originalBytes) * 100;


                            savingMessage.textContent =
                                "Great! Your image is " +
                                saved.toFixed(1) +
                                "% smaller.";

                        } else {

                            savingMessage.textContent =
                                "The compressed file is not smaller. Try a lower quality.";

                        }


                        /* Download */

                        let extension = "jpg";

                        if (selectedFormat === "image/png") {
                            extension = "png";
                        }

                        if (selectedFormat === "image/webp") {
                            extension = "webp";
                        }


                        downloadButton.href = compressedUrl;

                        downloadButton.download =
                            "utilityhub-compressed-image." + extension;


                        resultArea.hidden = false;


                        compressButton.disabled = false;
                        compressButton.textContent = "Compress Image";


                        /* Scroll to result */

                        resultArea.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    },

                    selectedFormat,

                    quality

                );

            };


            image.onerror = function () {

                alert("Could not read this image. Please try another file.");

                compressButton.disabled = false;
                compressButton.textContent = "Compress Image";

            };


            image.src = event.target.result;

        };


        reader.onerror = function () {

            alert("Could not read the selected file.");

            compressButton.disabled = false;
            compressButton.textContent = "Compress Image";

        };


        reader.readAsDataURL(selectedFile);

    });


    /* Choose another image */

    resetButton.addEventListener("click", function () {

        if (compressedUrl) {
            URL.revokeObjectURL(compressedUrl);
            compressedUrl = null;
        }


        selectedFile = null;

        imageInput.value = "";

        previewImage.src = "";

        settingsArea.hidden = true;
        resultArea.hidden = true;

        uploadArea.style.display = "";

        qualityRange.value = 75;
        qualityValue.textContent = "75%";

        originalSize.textContent = "0 KB";
        compressedSize.textContent = "0 KB";

        savingMessage.textContent =
            "Your image has been compressed.";

        downloadButton.removeAttribute("href");

        uploadArea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });

});