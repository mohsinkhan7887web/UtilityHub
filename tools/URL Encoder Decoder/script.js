"use strict";

const urlInput = document.getElementById("urlInput");
const urlOutput = document.getElementById("urlOutput");

const encodeButton = document.getElementById("encodeButton");
const decodeButton = document.getElementById("decodeButton");
const sampleButton = document.getElementById("sampleButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const useOutputButton = document.getElementById("useOutputButton");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const urlStatus = document.getElementById("urlStatus");
const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");

const sampleText =
  "https://example.com/search?q=hello world&category=books";

function updateCounts() {
  inputCount.textContent = urlInput.value.length.toLocaleString();
  outputCount.textContent = urlOutput.value.length.toLocaleString();
}

function showStatus(type, title, message) {
  statusBox.className = "status-box";

  if (type) {
    statusBox.classList.add(type);
  }

  statusTitle.textContent = title;
  statusMessage.textContent = message;
}

function convertURL(action) {
  const input = urlInput.value;

  if (!input.trim()) {
    urlOutput.value = "";
    urlStatus.textContent = "No input";
    updateCounts();

    showStatus(
      "warning",
      "Input required",
      "Enter some text or a URL before converting."
    );
    return;
  }

  try {
    if (action === "encode") {
      // Encodes text for use as a URL component.
      urlOutput.value = encodeURIComponent(input);

      urlStatus.textContent = "Encoded";

      showStatus(
        "success",
        "Encoding complete",
        "Special characters have been encoded for use as a URL component."
      );
    } else {
      // Decodes percent-encoded text.
      urlOutput.value = decodeURIComponent(input);

      urlStatus.textContent = "Decoded";

      showStatus(
        "success",
        "Decoding complete",
        "The encoded text has been decoded successfully."
      );
    }

    updateCounts();
  } catch (error) {
    urlOutput.value = "";
    urlStatus.textContent = "Error";
    updateCounts();

    showStatus(
      "error",
      action === "decode" ? "Invalid encoded text" : "Conversion failed",
      action === "decode"
        ? "The input contains an invalid percent-encoding sequence. Check the text and try again."
        : "Unable to encode this input."
    );
  }
}

function loadSample() {
  urlInput.value = sampleText;
  urlOutput.value = "";
  urlStatus.textContent = "Sample loaded";

  updateCounts();

  showStatus(
    "",
    "Sample loaded",
    "Click Encode URL to encode the sample, or Decode URL to decode encoded text."
  );

  urlInput.focus();
}

function clearAll() {
  urlInput.value = "";
  urlOutput.value = "";
  urlStatus.textContent = "Waiting for input";

  updateCounts();

  showStatus(
    "",
    "Cleared",
    "Enter some text or a URL to get started."
  );

  urlInput.focus();
}

async function copyOutput() {
  if (!urlOutput.value) {
    showStatus(
      "warning",
      "Nothing to copy",
      "Encode or decode some text first."
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(urlOutput.value);

    showStatus(
      "success",
      "Copied",
      "Output copied to your clipboard."
    );
  } catch (error) {
    urlOutput.focus();
    urlOutput.select();

    const copied = document.execCommand("copy");

    showStatus(
      copied ? "success" : "error",
      copied ? "Copied" : "Copy failed",
      copied
        ? "Output copied to your clipboard."
        : "Clipboard access failed. Select the output and copy it manually."
    );
  }
}

function useOutputAsInput() {
  if (!urlOutput.value) {
    showStatus(
      "warning",
      "No output",
      "Generate an output before using it as input."
    );
    return;
  }

  urlInput.value = urlOutput.value;

  updateCounts();

  showStatus(
    "",
    "Input updated",
    "Output has been copied into the input field."
  );

  urlInput.focus();
}

encodeButton.addEventListener("click", () => {
  convertURL("encode");
});

decodeButton.addEventListener("click", () => {
  convertURL("decode");
});

sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);

urlInput.addEventListener("input", updateCounts);

updateCounts();