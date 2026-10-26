"use strict";

const jsonInput = document.getElementById("jsonInput");
const jsonOutput = document.getElementById("jsonOutput");
const indentSize = document.getElementById("indentSize");

const formatButton = document.getElementById("formatButton");
const validateButton = document.getElementById("validateButton");
const minifyButton = document.getElementById("minifyButton");
const sampleButton = document.getElementById("sampleButton");
const clearButton = document.getElementById("clearButton");

const copyButton = document.getElementById("copyButton");
const useOutputButton = document.getElementById("useOutputButton");
const downloadButton = document.getElementById("downloadButton");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");

const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");
const jsonStatus = document.getElementById("jsonStatus");

const sampleJSON = {
  "name": "UtilityHub",
  "description": "Free online tools",
  "version": 1,
  "active": true,
  "categories": [
    "Text Tools",
    "PDF Tools",
    "Image Tools"
  ],
  "settings": {
    "theme": "light",
    "language": "en"
  }
};

function getIndentation() {
  const selectedValue = indentSize.value;

  if (selectedValue === "tab") {
    return "\t";
  }

  const spaces = Number(selectedValue);

  if (spaces === 4) {
    return 4;
  }

  return 2;
}

function updateCounts() {
  inputCount.textContent = jsonInput.value.length.toLocaleString();
  outputCount.textContent = jsonOutput.value.length.toLocaleString();
}

function showStatus(type, title, message) {
  statusBox.classList.remove("success", "error");

  if (type === "success" || type === "error") {
    statusBox.classList.add(type);
  }

  statusTitle.textContent = title;
  statusMessage.textContent = message;
}

function parseInput() {
  const source = jsonInput.value.trim();

  if (!source) {
    throw new Error("Please enter some JSON data first.");
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(getReadableJSONError(error));
  }
}

function getReadableJSONError(error) {
  const message = error.message || "Unknown JSON syntax error.";

  const positionMatch = message.match(/position\s+(\d+)/i);

  if (positionMatch) {
    const position = Number(positionMatch[1]);
    const source = jsonInput.value;
    const beforeError = source.slice(0, position);
    const lines = beforeError.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    return `${message} Check around line ${line}, column ${column}.`;
  }

  return message;
}

function runJSONAction(action) {
  try {
    const parsedData = parseInput();
    let result = "";

    if (action === "format") {
      result = JSON.stringify(parsedData, null, getIndentation());

      showStatus(
        "success",
        "JSON formatted successfully",
        "Your JSON is valid and the formatted output is ready."
      );
    } else if (action === "minify") {
      result = JSON.stringify(parsedData);

      showStatus(
        "success",
        "JSON minified successfully",
        "Extra whitespace and line breaks have been removed."
      );
    } else if (action === "validate") {
      showStatus(
        "success",
        "Valid JSON",
        "Your input follows JSON syntax rules. No syntax errors were found."
      );

      jsonStatus.textContent = "Valid";
      updateCounts();
      return;
    }

    jsonOutput.value = result;
    jsonStatus.textContent = "Valid";
    updateCounts();
  } catch (error) {
    showStatus(
      "error",
      "JSON error",
      error.message || "Something went wrong while processing the JSON."
    );

    jsonStatus.textContent = "Invalid";
  }
}

function loadSample() {
  jsonInput.value = JSON.stringify(sampleJSON, null, 2);
  jsonOutput.value = "";
  jsonStatus.textContent = "Ready";

  updateCounts();

  showStatus(
    "",
    "Sample JSON loaded",
    "Click Format JSON or Validate JSON to try the tool."
  );
}

function clearAll() {
  jsonInput.value = "";
  jsonOutput.value = "";
  jsonStatus.textContent = "Ready";

  updateCounts();

  showStatus(
    "",
    "Ready to use",
    "Paste JSON into the input box, then choose an action."
  );

  jsonInput.focus();
}

async function copyOutput() {
  const output = jsonOutput.value;

  if (!output) {
    showStatus(
      "error",
      "Nothing to copy",
      "Format or minify some JSON first."
    );
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(output);
    } else {
      jsonOutput.focus();
      jsonOutput.select();

      const copied = document.execCommand("copy");

      if (!copied) {
        throw new Error("Clipboard access is unavailable.");
      }

      jsonOutput.setSelectionRange(0, 0);
    }

    showStatus(
      "success",
      "Copied to clipboard",
      "The output JSON has been copied successfully."
    );
  } catch (error) {
    showStatus(
      "error",
      "Copy failed",
      "Your browser blocked clipboard access. Select the output and copy it manually."
    );
  }
}

function useOutputAsInput() {
  if (!jsonOutput.value.trim()) {
    showStatus(
      "error",
      "No output available",
      "Generate formatted or minified JSON first."
    );
    return;
  }

  jsonInput.value = jsonOutput.value;
  jsonOutput.value = "";
  jsonStatus.textContent = "Ready";

  updateCounts();

  showStatus(
    "",
    "Output moved to input",
    "Your previous output is now in the input box. You can edit or process it again."
  );

  jsonInput.focus();
}

function downloadJSON() {
  const output = jsonOutput.value;

  if (!output.trim()) {
    showStatus(
      "error",
      "Nothing to download",
      "Generate JSON output before downloading."
    );
    return;
  }

  try {
    const blob = new Blob([output], {
      type: "application/json;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "utilityhub-formatted.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showStatus(
      "success",
      "Download started",
      "Your JSON file should appear in your browser's downloads."
    );
  } catch (error) {
    showStatus(
      "error",
      "Download failed",
      "Your browser could not create the JSON download."
    );
  }
}

formatButton.addEventListener("click", () => {
  runJSONAction("format");
});

validateButton.addEventListener("click", () => {
  runJSONAction("validate");
});

minifyButton.addEventListener("click", () => {
  runJSONAction("minify");
});

sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);
downloadButton.addEventListener("click", downloadJSON);

jsonInput.addEventListener("input", () => {
  updateCounts();

  if (!jsonInput.value.trim()) {
    jsonStatus.textContent = "Ready";
  }
});

jsonOutput.addEventListener("input", updateCounts);

indentSize.addEventListener("change", () => {
  // The selected indentation applies the next time Format JSON is clicked.
});

updateCounts();

showStatus(
  "",
  "Ready to use",
  "Paste JSON into the input box, or load the sample to get started."
);