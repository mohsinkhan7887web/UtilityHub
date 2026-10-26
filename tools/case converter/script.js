document.addEventListener("DOMContentLoaded", function () {

    const textInput = document.getElementById("textInput");
    const clearButton = document.getElementById("clearButton");
    const copyButton = document.getElementById("copyButton");
    const characterCount = document.getElementById("characterCount");

    const caseButtons = document.querySelectorAll(".case-button");


    // ==========================================
    // UPDATE CHARACTER COUNT
    // ==========================================

    function updateCharacterCount() {

        const count = textInput.value.length;

        characterCount.textContent =
            count + (count === 1 ? " character" : " characters");
    }


    // ==========================================
    // UPPERCASE
    // ==========================================

    function convertToUppercase(text) {

        return text.toUpperCase();
    }


    // ==========================================
    // LOWERCASE
    // ==========================================

    function convertToLowercase(text) {

        return text.toLowerCase();
    }


    // ==========================================
    // TITLE CASE
    // ==========================================

    function convertToTitleCase(text) {

        return text
            .toLowerCase()
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });
    }


    // ==========================================
    // SENTENCE CASE
    // ==========================================

    function convertToSentenceCase(text) {

        return text
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s+\w)/g, function (match) {
                return match.toUpperCase();
            });
    }


    // ==========================================
    // CASE BUTTONS
    // ==========================================

    caseButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selectedCase = button.dataset.case;
            const currentText = textInput.value;


            if (currentText.trim() === "") {

                textInput.focus();
                return;
            }


            if (selectedCase === "upper") {

                textInput.value =
                    convertToUppercase(currentText);

            }


            else if (selectedCase === "lower") {

                textInput.value =
                    convertToLowercase(currentText);

            }


            else if (selectedCase === "title") {

                textInput.value =
                    convertToTitleCase(currentText);

            }


            else if (selectedCase === "sentence") {

                textInput.value =
                    convertToSentenceCase(currentText);

            }


            updateCharacterCount();

        });

    });


    // ==========================================
    // CLEAR BUTTON
    // ==========================================

    clearButton.addEventListener("click", function () {

        textInput.value = "";

        updateCharacterCount();

        textInput.focus();

    });


    // ==========================================
    // COPY BUTTON
    // ==========================================

    copyButton.addEventListener("click", async function () {

        const text = textInput.value;


        if (text.trim() === "") {

            textInput.focus();
            return;

        }


        try {

            await navigator.clipboard.writeText(text);

            const originalText =
                copyButton.textContent;

            copyButton.textContent =
                "Copied ✓";


            setTimeout(function () {

                copyButton.textContent =
                    originalText;

            }, 1500);


        } catch (error) {

            // Fallback for older browsers

            textInput.select();

            document.execCommand("copy");

            const originalText =
                copyButton.textContent;

            copyButton.textContent =
                "Copied ✓";


            setTimeout(function () {

                copyButton.textContent =
                    originalText;

            }, 1500);

        }

    });


    // ==========================================
    // LIVE CHARACTER COUNT
    // ==========================================

    textInput.addEventListener("input", function () {

        updateCharacterCount();

    });


    // ==========================================
    // INITIAL COUNT
    // ==========================================

    updateCharacterCount();

});