
const jsonInput = document.getElementById("jsonInput");
const jsonOutput = document.getElementById("jsonOutput");

const minifyButton = document.getElementById("minifyButton");
const sampleButton = document.getElementById("sampleButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const useOutputButton = document.getElementById("useOutputButton");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const jsonStatus = document.getElementById("jsonStatus");

const originalSize = document.getElementById("originalSize");
const minifiedSize = document.getElementById("minifiedSize");
const spaceSaved = document.getElementById("spaceSaved");

function getByteSize(text) {
  return new TextEncoder().encode(text).length;
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  return `${(bytes / 1024).toFixed(2)} KB`;
}

function showStatus(type, title, message) {
  statusBox.classList.remove("success", "error", "warning");
  statusBox.classList.add(type);

  statusTitle.textContent = title;
  statusMessage.textContent = message;
  jsonStatus.textContent = title;
}

function updateStats() {
  const input = jsonInput.value;
  const output = jsonOutput.value;

  const inputBytes = getByteSize(input);
  const outputBytes = getByteSize(output);

  originalSize.textContent = formatBytes(inputBytes);
  minifiedSize.textContent = formatBytes(outputBytes);

  if (inputBytes === 0 || outputBytes === 0) {
    spaceSaved.textContent = "0%";
    return;
  }

  const saved = ((inputBytes - outputBytes) / inputBytes) * 100;
  spaceSaved.textContent = `${saved.toFixed(1)}%`;
}

function minifyJSON() {
  const input = jsonInput.value.trim();

  if (!input) {
    jsonOutput.value = "";
    updateStats();

    showStatus(
      "warning",
      "Input required",
      "Please paste valid JSON before minifying."
    );
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const compact = JSON.stringify(parsed);

    jsonOutput.value = compact;
    updateStats();

    showStatus(
      "success",
      "Minification successful",
      "Your JSON is valid and unnecessary whitespace has been removed."
    );
  } catch (error) {
    jsonOutput.value = "";
    updateStats();

    showStatus(
      "error",
      "Invalid JSON",
      `Please check your JSON syntax. ${error.message}`
    );
  }
}

function loadSample() {
  jsonInput.value = JSON.stringify(
    {
      name: "UtilityHub",
      tool: "JSON Minifier",
      free: true,
      features: ["Fast", "Simple", "Browser-based"],
      stats: {
        users: 1000,
        rating: 4.8
      }
    },
    null,
    2
  );

  jsonOutput.value = "";
  updateStats();

  showStatus(
    "success",
    "Sample loaded",
    "Example JSON loaded. Click Minify JSON to compress it."
  );
}

function clearAll() {
  jsonInput.value = "";
  jsonOutput.value = "";
  updateStats();

  showStatus(
    "warning",
    "Ready to use",
    "Paste JSON into the input box to get started."
  );

  jsonInput.focus();
}

async function copyOutput() {
  if (!jsonOutput.value) {
    showStatus(
      "warning",
      "Nothing to copy",
      "Minify some JSON first, then copy the result."
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(jsonOutput.value);

    showStatus(
      "success",
      "Copied successfully",
      "Minified JSON has been copied to your clipboard."
    );
  } catch {
    jsonOutput.focus();
    jsonOutput.select();

    const copied = document.execCommand("copy");

    if (copied) {
      showStatus(
        "success",
        "Copied successfully",
        "Minified JSON has been copied to your clipboard."
      );
    } else {
      showStatus(
        "error",
        "Copy failed",
        "Please select the output and copy it manually."
      );
    }
  }
}

function useOutputAsInput() {
  if (!jsonOutput.value) {
    showStatus(
      "warning",
      "No output available",
      "Minify JSON first to use the result as new input."
    );
    return;
  }

  jsonInput.value = jsonOutput.value;
  jsonOutput.value = "";
  updateStats();

  showStatus(
    "success",
    "Output moved",
    "Minified JSON is now in the input box."
  );

  jsonInput.focus();
}

minifyButton.addEventListener("click", minifyJSON);
sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);

jsonInput.addEventListener("input", updateStats);
jsonOutput.addEventListener("input", updateStats);

updateStats();

showStatus(
  "warning",
  "Ready to use",
  "Paste JSON into the input box to get started."
);
