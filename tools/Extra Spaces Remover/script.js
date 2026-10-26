document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");
  const outputText = document.getElementById("outputText");
  const trimLines = document.getElementById("trimLines");
  const removeBlankLines = document.getElementById("removeBlankLines");

  const cleanButton = document.getElementById("cleanButton");
  const clearButton = document.getElementById("clearButton");
  const sampleButton = document.getElementById("sampleButton");
  const copyButton = document.getElementById("copyButton");
  const useOutputButton = document.getElementById("useOutputButton");

  const originalCount = document.getElementById("originalCount");
  const cleanedCount = document.getElementById("cleanedCount");
  const removedCount = document.getElementById("removedCount");
  const statusMessage = document.getElementById("statusMessage");

  const sampleText =
    "   Welcome   to   UtilityHub!   \n\n" +
    "   This   is   an   example   of   messy text.   \n" +
    "Extra     spaces make text   harder to read.   \n\n" +
    "   Clean your text   in just a few clicks!   ";

  function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type) {
      statusMessage.classList.add(type);
    }
  }

  function updateCounts() {
    const original = textInput.value;
    const cleaned = outputText.value;

    originalCount.textContent = original.length;
    cleanedCount.textContent = cleaned.length;
    removedCount.textContent = Math.max(0, original.length - cleaned.length);
  }

  function cleanText() {
    const original = textInput.value;

    if (!original.trim()) {
      outputText.value = "";
      updateCounts();
      showStatus("Please enter some text first.", "error");
      return;
    }

    let cleaned = original;

    // Replace consecutive spaces and tabs with a single space.
    cleaned = cleaned.replace(/[^\S\r\n]+/g, " ");

    // Optionally trim whitespace at the beginning and end of each line.
    if (trimLines.checked) {
      cleaned = cleaned
        .split(/\r\n|\n|\r/)
        .map((line) => line.trim())
        .join("\n");
    }

    // Optionally remove lines that contain only whitespace.
    if (removeBlankLines.checked) {
      cleaned = cleaned
        .split(/\r\n|\n|\r/)
        .filter((line) => line.trim() !== "")
        .join("\n");
    }

    outputText.value = cleaned;
    updateCounts();

    if (cleaned === original) {
      showStatus("Your text is already clean. No changes were needed.", "success");
    } else {
      showStatus("Text cleaned successfully!", "success");
    }
  }

  function clearAll() {
    textInput.value = "";
    outputText.value = "";
    updateCounts();
    showStatus("Text cleared. Paste new text to get started.");
    textInput.focus();
  }

  function loadSample() {
    textInput.value = sampleText;
    cleanText();
    showStatus("Sample text loaded and cleaned.", "success");
  }

  async function copyCleanedText() {
    const text = outputText.value;

    if (!text) {
      showStatus("There is no cleaned text to copy. Clean some text first.", "error");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporaryTextarea = document.createElement("textarea");
        temporaryTextarea.value = text;
        temporaryTextarea.style.position = "fixed";
        temporaryTextarea.style.left = "-9999px";
        document.body.appendChild(temporaryTextarea);
        temporaryTextarea.select();

        const copied = document.execCommand("copy");
        temporaryTextarea.remove();

        if (!copied) {
          throw new Error("Copy command failed");
        }
      }

      showStatus("Cleaned text copied to clipboard!", "success");
    } catch (error) {
      showStatus("Copy failed. Please select and copy the cleaned text manually.", "error");
    }
  }

  function useOutputAsInput() {
    if (!outputText.value) {
      showStatus("No cleaned text available yet.", "error");
      return;
    }

    textInput.value = outputText.value;
    updateCounts();
    showStatus("Cleaned text moved to the input box.", "success");
    textInput.focus();
  }

  cleanButton.addEventListener("click", cleanText);
  clearButton.addEventListener("click", clearAll);
  sampleButton.addEventListener("click", loadSample);
  copyButton.addEventListener("click", copyCleanedText);
  useOutputButton.addEventListener("click", useOutputAsInput);

  textInput.addEventListener("input", () => {
    updateCounts();
    showStatus("Text changed. Click Remove Extra Spaces to update the output.");
  });

  trimLines.addEventListener("change", () => {
    showStatus("Settings changed. Click Remove Extra Spaces to apply them.");
  });

  removeBlankLines.addEventListener("change", () => {
    showStatus("Settings changed. Click Remove Extra Spaces to apply them.");
  });

  updateCounts();
});