
const codeType = document.getElementById("codeType");
const codeInput = document.getElementById("codeInput");
const codeOutput = document.getElementById("codeOutput");

const minifyButton = document.getElementById("minifyButton");
const sampleButton = document.getElementById("sampleButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const useOutputButton = document.getElementById("useOutputButton");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const codeStatus = document.getElementById("codeStatus");

const originalSize = document.getElementById("originalSize");
const minifiedSize = document.getElementById("minifiedSize");
const spaceSaved = document.getElementById("spaceSaved");

function byteSize(text) {
  return new TextEncoder().encode(text).length;
}

function formatBytes(bytes) {
  return bytes < 1024
    ? `${bytes} bytes`
    : `${(bytes / 1024).toFixed(2)} KB`;
}

function updateStats() {
  const original = byteSize(codeInput.value);
  const compact = byteSize(codeOutput.value);

  originalSize.textContent = formatBytes(original);
  minifiedSize.textContent = formatBytes(compact);

  if (original === 0 || compact === 0) {
    spaceSaved.textContent = "0%";
  } else {
    const saved = ((original - compact) / original) * 100;
    spaceSaved.textContent = `${saved.toFixed(1)}%`;
  }
}

function showStatus(type, title, message) {
  statusBox.classList.remove("success", "error", "warning");
  statusBox.classList.add(type);

  statusTitle.textContent = title;
  statusMessage.textContent = message;
  codeStatus.textContent = title;
}

/*
  HTML minifier:
  Removes comments except conditional comments and
  collapses whitespace between tags and repeated spaces.
*/
function minifyHTML(source) {
  return source
    .replace(/<!--(?!\[if\b)[\s\S]*?-->/gi, "")
    .replace(/>\s+</g, "><")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/*
  CSS minifier:
  Removes comments, collapses whitespace and strips
  spaces around common CSS punctuation.
*/
function minifyCSS(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

/*
  JavaScript fallback:
  Removes simple comments and collapses whitespace.
  This is intentionally conservative; it is not a full
  JavaScript parser and may not safely minify every script.
*/
function minifyJS(source) {
  let result = "";
  let quote = "";
  let escaped = false;
  let pendingSpace = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (quote) {
      result += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      if (pendingSpace && needsSpace(result[result.length - 1], char)) {
        result += " ";
      }

      pendingSpace = false;
      quote = char;
      result += char;
      continue;
    }

    if (char === "/" && next === "/") {
      i += 2;

      while (i < source.length && source[i] !== "\n" && source[i] !== "\r") {
        i++;
      }

      pendingSpace = true;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);

      if (end === -1) {
        throw new Error("Unclosed JavaScript block comment.");
      }

      i = end + 1;
      pendingSpace = true;
      continue;
    }

    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }

    if (pendingSpace && needsSpace(result[result.length - 1], char)) {
      result += " ";
    }

    pendingSpace = false;
    result += char;
  }

  if (quote) {
    throw new Error("Unclosed string or template literal in JavaScript.");
  }

  return result.trim();
}

function needsSpace(previous, current) {
  if (!previous || !current) return false;

  return /[A-Za-z0-9_$]/.test(previous) &&
         /[A-Za-z0-9_$]/.test(current);
}

function minifyCode() {
  const source = codeInput.value;

  if (!source.trim()) {
    codeOutput.value = "";
    updateStats();

    showStatus(
      "warning",
      "Input required",
      "Please paste your code before minifying."
    );
    return;
  }

  try {
    let result;

    switch (codeType.value) {
      case "html":
        result = minifyHTML(source);
        break;
      case "css":
        result = minifyCSS(source);
        break;
      case "js":
        result = minifyJS(source);
        break;
      default:
        throw new Error("Please select a valid code type.");
    }

    codeOutput.value = result;
    updateStats();

    showStatus(
      "success",
      "Minification complete",
      "Review the output carefully before using it in a live project."
    );
  } catch (error) {
    codeOutput.value = "";
    updateStats();

    showStatus(
      "error",
      "Minification failed",
      error.message || "Please check your source code."
    );
  }
}

function loadSample() {
  const samples = {
    html: `<div class="card">
  <!-- Sample card -->
  <h1>Hello UtilityHub</h1>
  <p>Welcome to our website.</p>
</div>`,
    css: `/* Sample styles */
.card {
  color: #2563eb;
  padding: 20px;
  margin: 10px;
}`,
    js: `// Sample JavaScript
function greet(name) {
  const message = "Hello " + name;
  return message;
}
console.log(greet("UtilityHub"));`
  };

  codeInput.value = samples[codeType.value];
  codeOutput.value = "";
  updateStats();

  showStatus(
    "success",
    "Sample loaded",
    "Example code loaded. Click Minify Code to continue."
  );
}

function clearAll() {
  codeInput.value = "";
  codeOutput.value = "";
  updateStats();

  showStatus(
    "warning",
    "Ready to use",
    "Choose a code type and enter your code."
  );

  codeInput.focus();
}

async function copyOutput() {
  if (!codeOutput.value) {
    showStatus(
      "warning",
      "Nothing to copy",
      "Minify your code first, then copy the output."
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(codeOutput.value);

    showStatus(
      "success",
      "Copied successfully",
      "Minified code has been copied to your clipboard."
    );
  } catch {
    codeOutput.focus();
    codeOutput.select();

    const copied = document.execCommand("copy");

    showStatus(
      copied ? "success" : "error",
      copied ? "Copied successfully" : "Copy failed",
      copied
        ? "Minified code has been copied to your clipboard."
        : "Select the output and copy it manually."
    );
  }
}

function useOutputAsInput() {
  if (!codeOutput.value) {
    showStatus(
      "warning",
      "No output available",
      "Minify code first to use the result as input."
    );
    return;
  }

  codeInput.value = codeOutput.value;
  codeOutput.value = "";
  updateStats();

  showStatus(
    "success",
    "Output moved",
    "The previous output is now your input."
  );

  codeInput.focus();
}

minifyButton.addEventListener("click", minifyCode);
sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);

codeType.addEventListener("change", () => {
  showStatus(
    "warning",
    "Code type changed",
    "Choose or paste the matching code type before minifying."
  );
});

codeInput.addEventListener("input", updateStats);
codeOutput.addEventListener("input", updateStats);

updateStats();

showStatus(
  "warning",
  "Ready to use",
  "Choose a code type and enter your code."
);
