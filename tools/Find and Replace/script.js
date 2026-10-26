document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");
  const findInput = document.getElementById("findInput");
  const replaceInput = document.getElementById("replaceInput");
  const matchCase = document.getElementById("matchCase");
  const wholeWord = document.getElementById("wholeWord");

  const replaceAllButton = document.getElementById("replaceAllButton");
  const replaceNextButton = document.getElementById("replaceNextButton");
  const clearButton = document.getElementById("clearButton");
  const sampleButton = document.getElementById("sampleButton");
  const copyButton = document.getElementById("copyButton");
  const useOutputButton = document.getElementById("useOutputButton");

  const outputText = document.getElementById("outputText");
  const matchCount = document.getElementById("matchCount");
  const replacementCount = document.getElementById("replacementCount");
  const statusMessage = document.getElementById("statusMessage");

  let nextSearchPosition = 0;

  const sampleText =
    "UtilityHub provides useful online tools. " +
    "These tools help users work faster. " +
    "With UtilityHub tools, you can clean text and edit text easily.";

  function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type) {
      statusMessage.classList.add(type);
    }
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getSearchPattern() {
    const term = findInput.value;

    if (!term) {
      return null;
    }

    let pattern = escapeRegExp(term);

    if (wholeWord.checked) {
      pattern = `(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`;
    }

    try {
      return new RegExp(pattern, matchCase.checked ? "gu" : "giu");
    } catch (error) {
      showStatus("Could not create the search pattern. Check your search text.", "error");
      return null;
    }
  }

  function countMatches(text, pattern) {
    if (!pattern || !text) {
      return 0;
    }

    const flags = pattern.flags.includes("g")
      ? pattern.flags
      : pattern.flags + "g";

    const countingPattern = new RegExp(pattern.source, flags);
    return [...text.matchAll(countingPattern)].length;
  }

  function updateMatchCount() {
    const pattern = getSearchPattern();

    if (!pattern) {
      matchCount.textContent = "0";
      return 0;
    }

    const count = countMatches(textInput.value, pattern);
    matchCount.textContent = count;
    return count;
  }

  function replaceAll() {
    const original = textInput.value;
    const searchTerm = findInput.value;
    const replacement = replaceInput.value;

    if (!original) {
      showStatus("Please enter some text first.", "error");
      return;
    }

    if (!searchTerm) {
      showStatus("Enter the word or phrase you want to find.", "error");
      findInput.focus();
      return;
    }

    const pattern = getSearchPattern();

    if (!pattern) {
      return;
    }

    const totalMatches = countMatches(original, pattern);

    if (totalMatches === 0) {
      outputText.value = original;
      matchCount.textContent = "0";
      replacementCount.textContent = "0";
      nextSearchPosition = 0;
      showStatus("No matches found. Try changing your search settings.", "error");
      return;
    }

    // Count replacements before changing the text.
    const updated = original.replace(pattern, () => replacement);

    outputText.value = updated;
    matchCount.textContent = totalMatches;
    replacementCount.textContent = totalMatches;
    nextSearchPosition = 0;

    showStatus(
      `Done! Replaced ${totalMatches} match${totalMatches === 1 ? "" : "es"}.`,
      "success"
    );
  }

  function replaceNext() {
    const original = textInput.value;
    const searchTerm = findInput.value;
    const replacement = replaceInput.value;

    if (!original) {
      showStatus("Please enter some text first.", "error");
      return;
    }

    if (!searchTerm) {
      showStatus("Enter the word or phrase you want to find.", "error");
      findInput.focus();
      return;
    }

    const pattern = getSearchPattern();

    if (!pattern) {
      return;
    }

    const currentOutput = outputText.value || original;
    const totalMatches = countMatches(currentOutput, pattern);

    matchCount.textContent = totalMatches;

    if (totalMatches === 0) {
      showStatus("No more matches found.", "error");
      return;
    }

    const flags = pattern.flags.replace("g", "");
    const nextPattern = new RegExp(pattern.source, flags);
    const match = nextPattern.exec(currentOutput.slice(nextSearchPosition));

    if (!match) {
      nextSearchPosition = 0;
      showStatus("Reached the end. Click Replace Next to start again.", "error");
      return;
    }

    const matchStart = nextSearchPosition + match.index;
    const matchEnd = matchStart + match[0].length;

    const updated =
      currentOutput.slice(0, matchStart) +
      replacement +
      currentOutput.slice(matchEnd);

    outputText.value = updated;
    nextSearchPosition = matchStart + replacement.length;

    replacementCount.textContent =
      Number(replacementCount.textContent) + 1;

    matchCount.textContent = countMatches(updated, pattern);

    showStatus("Replaced the next matching occurrence.", "success");
  }

  function clearAll() {
    textInput.value = "";
    findInput.value = "";
    replaceInput.value = "";
    outputText.value = "";
    matchCount.textContent = "0";
    replacementCount.textContent = "0";
    nextSearchPosition = 0;

    showStatus("All fields cleared. Enter text to get started.");
    textInput.focus();
  }

  function loadSample() {
    textInput.value = sampleText;
    findInput.value = "tools";
    replaceInput.value = "utilities";
    matchCase.checked = false;
    wholeWord.checked = false;
    outputText.value = "";
    replacementCount.textContent = "0";
    nextSearchPosition = 0;

    updateMatchCount();
    showStatus('Sample loaded. Click "Replace All" to try the tool.');
  }

  async function copyUpdatedText() {
    const text = outputText.value;

    if (!text) {
      showStatus("There is no updated text to copy yet.", "error");
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

      showStatus("Updated text copied to clipboard!", "success");
    } catch (error) {
      showStatus("Copy failed. Please select and copy the updated text manually.", "error");
    }
  }

  function useOutputAsInput() {
    if (!outputText.value) {
      showStatus("There is no updated text to use yet.", "error");
      return;
    }

    textInput.value = outputText.value;
    outputText.value = "";
    replacementCount.textContent = "0";
    nextSearchPosition = 0;
    updateMatchCount();

    showStatus("Updated text moved to the input box.", "success");
    textInput.focus();
  }

  replaceAllButton.addEventListener("click", replaceAll);
  replaceNextButton.addEventListener("click", replaceNext);
  clearButton.addEventListener("click", clearAll);
  sampleButton.addEventListener("click", loadSample);
  copyButton.addEventListener("click", copyUpdatedText);
  useOutputButton.addEventListener("click", useOutputAsInput);

  findInput.addEventListener("input", () => {
    nextSearchPosition = 0;
    updateMatchCount();
  });

  textInput.addEventListener("input", () => {
    nextSearchPosition = 0;
    updateMatchCount();
  });

  matchCase.addEventListener("change", () => {
    nextSearchPosition = 0;
    updateMatchCount();
  });

  wholeWord.addEventListener("change", () => {
    nextSearchPosition = 0;
    updateMatchCount();
  });

  replaceInput.addEventListener("input", () => {
    // Replacement text does not affect the number of matches.
  });

  updateMatchCount();
});