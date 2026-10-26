document.addEventListener("DOMContentLoaded", function () {

    const textInput = document.getElementById("textInput");

    const characterCount = document.getElementById("characterCount");
    const characterNoSpaceCount = document.getElementById("characterNoSpaceCount");
    const wordCount = document.getElementById("wordCount");
    const lineCount = document.getElementById("lineCount");
    const sentenceCount = document.getElementById("sentenceCount");

    const copyButton = document.getElementById("copyButton");
    const clearButton = document.getElementById("clearButton");


    /* Update all counters */

    function updateCounters() {

        const text = textInput.value;


        /* Characters */

        characterCount.textContent = text.length;


        /* Characters without spaces */

        characterNoSpaceCount.textContent =
            text.replace(/\s/g, "").length;


        /* Words */

        const trimmedText = text.trim();

        const words = trimmedText
            ? trimmedText.split(/\s+/).length
            : 0;

        wordCount.textContent = words;


        /* Lines */

        const lines = text
            ? text.split(/\r?\n/).length
            : 0;

        lineCount.textContent = lines;


        /* Sentences */

        const sentences = trimmedText
            ? trimmedText
                .split(/[.!?]+(?:\s+|$)/)
                .filter(function (sentence) {
                    return sentence.trim() !== "";
                }).length
            : 0;

        sentenceCount.textContent = sentences;
    }


    /* Live counting */

    textInput.addEventListener("input", function () {
        updateCounters();
    });


    /* Copy text */

    copyButton.addEventListener("click", async function () {

        const text = textInput.value;


        if (text.trim() === "") {

            textInput.focus();

            return;
        }


        try {

            await navigator.clipboard.writeText(text);

            const originalText = copyButton.textContent;

            copyButton.textContent = "Copied ✓";


            setTimeout(function () {

                copyButton.textContent = originalText;

            }, 1500);


        } catch (error) {

            textInput.select();

            document.execCommand("copy");

            const originalText = copyButton.textContent;

            copyButton.textContent = "Copied ✓";


            setTimeout(function () {

                copyButton.textContent = originalText;

            }, 1500);

        }

    });


    /* Clear */

    clearButton.addEventListener("click", function () {

        textInput.value = "";

        updateCounters();

        textInput.focus();

    });


    /* Initial state */

    updateCounters();

});