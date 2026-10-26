const textInput = document.getElementById("textInput");

const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");
const characterNoSpaceCount = document.getElementById("characterNoSpaceCount");
const paragraphCount = document.getElementById("paragraphCount");

const clearButton = document.getElementById("clearButton");

function updateCounts() {
    const text = textInput.value;

    // Characters
    characterCount.textContent = text.length;

    // Characters without spaces
    characterNoSpaceCount.textContent = text.replace(/\s/g, "").length;

    // Words
    const words = text.trim()
        ? text.trim().split(/\s+/).length
        : 0;

    wordCount.textContent = words;

    // Paragraphs
    const paragraphs = text.trim()
        ? text.trim().split(/\n\s*\n/).length
        : 0;

    paragraphCount.textContent = paragraphs;
}

// Live counting while typing
textInput.addEventListener("input", updateCounts);

// Clear button
clearButton.addEventListener("click", function () {
    textInput.value = "";
    updateCounts();
    textInput.focus();
});

// Initial state
updateCounts();