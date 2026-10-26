"use strict";

const htmlInput = document.getElementById("htmlInput");
const htmlOutput = document.getElementById("htmlOutput");
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
const htmlStatus = document.getElementById("htmlStatus");

const sampleHTML = `<!DOCTYPE html>
<html lang="en"><head><title>My Page</title></head><body><main><h1>Hello World</h1><p>Welcome to my website.</p><img src="photo.jpg" alt="Sample photo"></main></body></html>`;

function getIndentation() {
  if (indentSize.value === "tab") {
    return "\t";
  }

  return Number(indentSize.value) === 4 ? 4 : 2;
}

function updateCounts() {
  inputCount.textContent = htmlInput.value.length.toLocaleString();
  outputCount.textContent = htmlOutput.value.length.toLocaleString();
}

function showStatus(type, title, message) {
  statusBox.classList.remove("success", "error");

  if (type === "success" || type === "error") {
    statusBox.classList.add(type);
  }

  statusTitle.textContent = title;
  statusMessage.textContent = message;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenizeHTML(source) {
  const tokens = [];
  const pattern = /<!--[\s\S]*?-->|<!DOCTYPE\b[^>]*>|<\/?[A-Za-z][^>]*>|[^<]+|</gi;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    tokens.push(match[0]);
  }

  return tokens;
}

function formatHTML(source, indentation) {
  const tokens = tokenizeHTML(source);
  const unit = typeof indentation === "number"
    ? " ".repeat(indentation)
    : indentation;

  const lines = [];
  let depth = 0;
  let preserveWhitespace = false;
  let rawTag = null;

  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "param", "source", "track", "wbr"
  ]);

  const preserveTags = new Set([
    "pre", "textarea", "script", "style"
  ]);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    if (!token.trim()) {
      continue;
    }

    if (rawTag) {
      const closePattern = new RegExp(
        `<\\s*\\/\\s*${escapeRegExp(rawTag)}\\s*>`,
        "i"
      );

      const closeMatch = closePattern.exec(token);

      if (!closeMatch) {
        if (lines.length === 0) {
          lines.push("");
        }

        lines[lines.length - 1] += token;
        continue;
      }

      const beforeClose = token.slice(0, closeMatch.index);
      const closeToken = closeMatch[0];

      if (beforeClose) {
        if (lines.length === 0) {
          lines.push("");
        }

        lines[lines.length - 1] += beforeClose;
      }

      preserveWhitespace = false;
      rawTag = null;

      lines.push(unit.repeat(Math.max(0, depth - 1)) + closeToken);
      depth = Math.max(0, depth - 1);

      const afterClose = token.slice(
        closeMatch.index + closeToken.length
      );

      if (afterClose.trim()) {
        tokens.splice(i + 1, 0, afterClose);
      }

      continue;
    }

    if (preserveWhitespace) {
      lines.push(unit.repeat(depth) + token);
      continue;
    }

    if (/^<!--/.test(token) || /^<!DOCTYPE/i.test(token)) {
      lines.push(unit.repeat(depth) + token.trim());
      continue;
    }

    if (/^<\s*\//.test(token)) {
      depth = Math.max(0, depth - 1);
      lines.push(unit.repeat(depth) + token.trim());
      continue;
    }

    if (/^<[A-Za-z]/.test(token)) {
      const tagMatch = token.match(/^<\s*([A-Za-z][\w:-]*)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";

      const isSelfClosing = /\/\s*>$/.test(token);
      const isVoid = voidTags.has(tagName);

      lines.push(unit.repeat(depth) + token.trim());

      if (preserveTags.has(tagName) && !isSelfClosing && !isVoid) {
        rawTag = tagName;
        depth++;
        preserveWhitespace = true;
        continue;
      }

      if (!isSelfClosing && !isVoid) {
        depth++;
      }

      continue;
    }

    const text = token.trim();

    if (text) {
      lines.push(unit.repeat(depth) + text);
    }
  }

  return lines.join("\n").trim();
}

function minifyHTML(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .trim();
}

function checkHTML(source) {
  const errors = [];
  const warnings = [];
  const stack = [];

  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "param", "source", "track", "wbr"
  ]);

  const tokens = tokenizeHTML(source);
  const tagPattern = /^<\s*(\/?)\s*([A-Za-z][\w:-]*)\b([^>]*)>$/;

  for (const token of tokens) {
    if (
      token.startsWith("<!--") ||
      /^<!DOCTYPE/i.test(token) ||
      token.startsWith("<!")
    ) {
      if (token.startsWith("<!--") && !token.endsWith("-->")) {
        errors.push("An HTML comment may not be closed properly.");
      }
      continue;
    }

    const match = token.match(tagPattern);

    if (!match) {
      continue;
    }

    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const rest = match[3] || "";
    const isSelfClosing = /\/\s*$/.test(rest);

    if (!isClosing && !isSelfClosing && !voidTags.has(tagName)) {
      stack.push(tagName);
      continue;
    }

    if (isClosing && !voidTags.has(tagName)) {
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag: </${tagName}>.`);
        continue;
      }

      const lastTag = stack[stack.length - 1];

      if (lastTag === tagName) {
        stack.pop();
      } else {
        const matchingIndex = stack.lastIndexOf(tagName);

        if (matchingIndex === -1) {
          errors.push(`Closing tag </${tagName}> has no matching opening tag.`);
        } else {
          errors.push(
            `Tag <${lastTag}> appears unclosed before </${tagName}>.`
          );
          stack.splice(matchingIndex);
        }
      }
    }
  }

  if (stack.length > 0) {
    errors.push(
      `Unclosed tag(s): ${stack.slice(-5).map(tag => `<${tag}>`).join(", ")}.`
    );
  }

  if (!/<html(?:\s|>)/i.test(source)) {
    warnings.push("The document does not contain an <html> element.");
  }

  if (!/<head(?:\s|>)/i.test(source)) {
    warnings.push("The document does not contain a <head> element.");
  }

  if (!/<body(?:\s|>)/i.test(source)) {
    warnings.push("The document does not contain a <body> element.");
  }

  if (/<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(source)) {
    warnings.push("At least one image is missing an alt attribute.");
  }

  return { errors, warnings };
}

function processHTML(action) {
  const source = htmlInput.value;

  if (!source.trim()) {
    showStatus(
      "error",
      "Input is empty",
      "Paste HTML code or click Load Sample before processing."
    );

    htmlStatus.textContent = "Empty";
    return;
  }

  try {
    if (action === "validate") {
      const result = checkHTML(source);
      updateCounts();

      if (result.errors.length > 0) {
        htmlStatus.textContent = "Issues found";

        const message = [
          ...result.errors.map(error => `Error: ${error}`),
          ...result.warnings.map(warning => `Warning: ${warning}`)
        ].join(" ");

        showStatus(
          "error",
          "HTML issues found",
          message
        );
      } else if (result.warnings.length > 0) {
        htmlStatus.textContent = "Review";

        showStatus(
          "",
          "No obvious tag errors found",
          `Review these suggestions: ${result.warnings.join(" ")}`
        );
      } else {
        htmlStatus.textContent = "Passed";

        showStatus(
          "success",
          "Basic HTML checks passed",
          "No obvious unmatched HTML tags were detected. This is a basic check, not a complete standards validator."
        );
      }

      return;
    }

    let result = "";

    if (action === "format") {
      result = formatHTML(source, getIndentation());
    } else if (action === "minify") {
      result = minifyHTML(source);
    }

    htmlOutput.value = result;
    updateCounts();

    const validation = checkHTML(source);

    if (validation.errors.length > 0) {
      htmlStatus.textContent = "Issues found";

      showStatus(
        "",
        action === "format" ? "HTML formatted with warnings" : "HTML minified with warnings",
        `Output generated, but the input has possible issues: ${validation.errors.join(" ")}`
      );
    } else {
      htmlStatus.textContent = "Processed";

      showStatus(
        "success",
        action === "format" ? "HTML formatted" : "HTML minified",
        action === "format"
          ? "Your HTML output is ready. Review it before using it in a website."
          : "Whitespace and HTML comments were removed where supported. Review the result before using it."
      );
    }
  } catch (error) {
    htmlStatus.textContent = "Error";

    showStatus(
      "error",
      "Processing failed",
      error.message || "An unexpected error occurred."
    );
  }
}

function loadSample() {
  htmlInput.value = sampleHTML;
  htmlOutput.value = "";
  htmlStatus.textContent = "Ready";

  updateCounts();

  showStatus(
    "",
    "Sample HTML loaded",
    "Click Format HTML or Check HTML to try the tool."
  );
}

function clearAll() {
  htmlInput.value = "";
  htmlOutput.value = "";
  htmlStatus.textContent = "Ready";

  updateCounts();

  showStatus(
    "",
    "Ready to use",
    "Paste HTML code into the input box to get started."
  );

  htmlInput.focus();
}

async function copyOutput() {
  if (!htmlOutput.value) {
    showStatus(
      "error",
      "Nothing to copy",
      "Format or minify HTML first."
    );
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(htmlOutput.value);
    } else {
      htmlOutput.focus();
      htmlOutput.select();

      const copied = document.execCommand("copy");

      if (!copied) {
        throw new Error("Clipboard access is unavailable.");
      }

      htmlOutput.setSelectionRange(0, 0);
    }

    showStatus(
      "success",
      "Copied to clipboard",
      "The HTML output has been copied."
    );
  } catch (error) {
    showStatus(
      "error",
      "Copy failed",
      "Select the output and copy it manually if clipboard access is blocked."
    );
  }
}

function useOutputAsInput() {
  if (!htmlOutput.value.trim()) {
    showStatus(
      "error",
      "No output available",
      "Generate HTML output before using it as input."
    );
    return;
  }

  htmlInput.value = htmlOutput.value;
  htmlOutput.value = "";
  htmlStatus.textContent = "Ready";

  updateCounts();

  showStatus(
    "",
    "Output moved to input",
    "The output is now in the input editor and ready for another action."
  );

  htmlInput.focus();
}

function downloadHTML() {
  if (!htmlOutput.value.trim()) {
    showStatus(
      "error",
      "Nothing to download",
      "Generate HTML output before downloading."
    );
    return;
  }

  const blob = new Blob([htmlOutput.value], {
    type: "text/html;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "utilityhub-formatted.html";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showStatus(
    "success",
    "Download started",
    "Check your browser's downloads for utilityhub-formatted.html."
  );
}

formatButton.addEventListener("click", () => processHTML("format"));
validateButton.addEventListener("click", () => processHTML("validate"));
minifyButton.addEventListener("click", () => processHTML("minify"));

sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);
downloadButton.addEventListener("click", downloadHTML);

htmlInput.addEventListener("input", updateCounts);
htmlOutput.addEventListener("input", updateCounts);

indentSize.addEventListener("change", () => {
  // The selected indentation applies when Format HTML is clicked.
});

updateCounts();

showStatus(
  "",
  "Ready to use",
  "Paste HTML code or load the sample to get started."
);