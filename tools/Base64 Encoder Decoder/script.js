
const inputBox = document.getElementById("base64Input");
const outputBox = document.getElementById("base64Output");

const encodeButton = document.getElementById("encodeButton");
const decodeButton = document.getElementById("decodeButton");
const sampleButton = document.getElementById("sampleButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const useOutputButton = document.getElementById("useOutputButton");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const base64Status = document.getElementById("base64Status");

const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");

function updateCounts() {
  inputCount.textContent = inputBox.value.length;
  outputCount.textContent = outputBox.value.length;
}

function showStatus(type, title, message) {
  statusBox.classList.remove("success", "error", "warning");
  statusBox.classList.add(type);

  statusTitle.textContent = title;
  statusMessage.textContent = message;
  base64Status.textContent = title;
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function decodeBase64(base64) {
  const cleaned = base64.replace(/\s/g, "");

  if (!cleaned) {
    throw new Error("Please enter some Base64 text.");
  }

  const validBase64 =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (!validBase64.test(cleaned)) {
    throw new Error("Invalid Base64 format. Please check your input.");
  }

  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(
      "The Base64 data is not valid UTF-8 text. It may contain binary data."
    );
  }
}

function convertBase64(action) {
  const text = inputBox.value;

  if (!text.trim()) {
    outputBox.value = "";
    updateCounts();
    showStatus(
      "warning",
      "Input required",
      "Please enter text or Base64 data before converting."
    );
    return;
  }

  try {
    if (action === "encode") {
      outputBox.value = encodeBase64(text);
      showStatus(
        "success",
        "Encoding successful",
        "Your text has been converted into Base64."
      );
    } else {
      outputBox.value = decodeBase64(text);
      showStatus(
        "success",
        "Decoding successful",
        "Your Base64 data has been converted into readable text."
      );
    }

    updateCounts();
  } catch (error) {
    outputBox.value = "";
    updateCounts();
    showStatus(
      "error",
      "Conversion failed",
      error.message || "Something went wrong. Please check your input."
    );
  }
}

function loadSample() {
  inputBox.value = "Hello, UtilityHub! 🌍";
  outputBox.value = "";
  updateCounts();

  showStatus(
    "success",
    "Sample loaded",
    "Sample text loaded. Click Encode to convert it into Base64."
  );
}

function clearAll() {
  inputBox.value = "";
  outputBox.value = "";
  updateCounts();

  showStatus(
    "warning",
    "Ready to use",
    "Enter text or Base64 data to get started."
  );

  inputBox.focus();
}

async function copyOutput() {
  const text = outputBox.value;

  if (!text) {
    showStatus(
      "warning",
      "Nothing to copy",
      "Convert some text first, then copy the result."
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    showStatus(
      "success",
      "Copied successfully",
      "The output has been copied to your clipboard."
    );
  } catch {
    outputBox.focus();
    outputBox.select();

    const copied = document.execCommand("copy");

    if (copied) {
      showStatus(
        "success",
        "Copied successfully",
        "The output has been copied to your clipboard."
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
  if (!outputBox.value) {
    showStatus(
      "warning",
      "No output available",
      "Convert some text first to use the output as new input."
    );
    return;
  }

  inputBox.value = outputBox.value;
  outputBox.value = "";
  updateCounts();

  showStatus(
    "success",
    "Output moved",
    "The previous output is now your input. Choose Encode or Decode."
  );

  inputBox.focus();
}

encodeButton.addEventListener("click", () => convertBase64("encode"));
decodeButton.addEventListener("click", () => convertBase64("decode"));
sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);

inputBox.addEventListener("input", updateCounts);
outputBox.addEventListener("input", updateCounts);

updateCounts();

showStatus(
  "warning",
  "Ready to use",
  "Enter text or Base64 data to get started."
);
