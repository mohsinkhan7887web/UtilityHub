"use strict";

const xmlInput = document.getElementById("xmlInput");
const xmlOutput = document.getElementById("xmlOutput");
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
const xmlStatus = document.getElementById("xmlStatus");
const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");

const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
<book id="1">
<title>Learning XML</title>
<author>John Smith</author>
<price>299</price>
</book>
<book id="2">
<title>Web Development</title>
<author>Jane Doe</author>
<price>399</price>
</book>
</catalog>`;

function getIndentation() {
  const value = indentSize.value;
  return value === "tab" ? "\t" : " ".repeat(Number(value) || 4);
}

function updateCounts() {
  inputCount.textContent = xmlInput.value.length.toLocaleString();
  outputCount.textContent = xmlOutput.value.length.toLocaleString();
}

function showStatus(type, title, message) {
  statusBox.className = "status-box";
  if (type) {
    statusBox.classList.add(type);
  }

  statusTitle.textContent = title;
  statusMessage.textContent = message;
}

function getParserError(xmlText) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(xmlText, "application/xml");
  const errors = documentNode.getElementsByTagName("parsererror");

  if (errors.length > 0) {
    return errors[0].textContent.trim().split("\n")[0] ||
      "The XML contains a syntax error.";
  }

  return "";
}

function parseXML(xmlText) {
  const error = getParserError(xmlText);

  if (error) {
    throw new Error(error);
  }

  return new DOMParser().parseFromString(xmlText, "application/xml");
}

function getSerializedXML(xmlDocument) {
  return new XMLSerializer().serializeToString(xmlDocument);
}

function formatXMLText(xmlText) {
  const documentNode = parseXML(xmlText);
  const serialized = getSerializedXML(documentNode);
  const tokens = serialized.match(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE[\s\S]*?>|<\/?[^>]+>|[^<]+/gi);

  if (!tokens) {
    throw new Error("No XML content was found.");
  }

  const indent = getIndentation();
  let depth = 0;
  const lines = [];

  for (const rawToken of tokens) {
    const token = rawToken.trim();

    if (!token) {
      continue;
    }

    const isClosingTag = /^<\//.test(token);
    const isDeclaration = /^<\?/.test(token);
    const isComment = /^<!--/.test(token);
    const isDoctype = /^<!DOCTYPE/i.test(token);
    const isCData = /^<!\[CDATA\[/i.test(token);
    const isSelfClosing = /\/\s*>$/.test(token);
    const isOpeningTag =
      /^<[^!?/][^>]*>$/.test(token) && !isSelfClosing;

    if (isClosingTag) {
      depth = Math.max(0, depth - 1);
      lines.push(indent.repeat(depth) + token);
    } else {
      lines.push(indent.repeat(depth) + token);

      if (
        isOpeningTag &&
        !isDeclaration &&
        !isComment &&
        !isDoctype &&
        !isCData
      ) {
        depth++;
      }
    }
  }

  return lines.join("\n");
}

function minifyXMLText(xmlText) {
  const documentNode = parseXML(xmlText);
  return getSerializedXML(documentNode);
}

function processXML(action) {
  const source = xmlInput.value.trim();

  if (!source) {
    xmlOutput.value = "";
    xmlStatus.textContent = "No input";
    updateCounts();
    showStatus("warning", "Input required", "Paste XML or click Load Sample first.");
    return;
  }

  try {
    if (action === "validate") {
      parseXML(source);
      xmlOutput.value = source;
      xmlStatus.textContent = "Valid XML";
      showStatus(
        "success",
        "XML is valid",
        "The browser XML parser did not find a syntax error."
      );
    } else if (action === "format") {
      xmlOutput.value = formatXMLText(source);
      xmlStatus.textContent = "Formatted";
      showStatus(
        "success",
        "Formatting complete",
        "Your XML has been formatted using the selected indentation."
      );
    } else if (action === "minify") {
      xmlOutput.value = minifyXMLText(source);
      xmlStatus.textContent = "Minified";
      showStatus(
        "success",
        "Minification complete",
        "XML whitespace between elements may be normalized. Review text-sensitive XML before using the result."
      );
    }

    updateCounts();
  } catch (error) {
    xmlOutput.value = "";
    xmlStatus.textContent = "Error";
    updateCounts();
    showStatus(
      "error",
      "XML error",
      error.message || "Unable to process this XML."
    );
  }
}

function loadSample() {
  xmlInput.value = sampleXML;
  xmlOutput.value = "";
  xmlStatus.textContent = "Sample loaded";
  updateCounts();
  showStatus(
    "",
    "Sample loaded",
    "Click Format XML or Validate XML to test the sample."
  );
  xmlInput.focus();
}

function clearAll() {
  xmlInput.value = "";
  xmlOutput.value = "";
  xmlStatus.textContent = "Waiting for input";
  updateCounts();
  showStatus("", "Cleared", "Paste XML or load the sample to get started.");
  xmlInput.focus();
}

async function copyOutput() {
  if (!xmlOutput.value) {
    showStatus("warning", "Nothing to copy", "Format or validate XML first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(xmlOutput.value);
    showStatus("success", "Copied", "Output XML copied to your clipboard.");
  } catch (error) {
    xmlOutput.focus();
    xmlOutput.select();

    const copied = document.execCommand("copy");
    showStatus(
      copied ? "success" : "error",
      copied ? "Copied" : "Copy failed",
      copied
        ? "Output XML copied to your clipboard."
        : "Clipboard access failed. Select the output and copy it manually."
    );
  }
}

function useOutputAsInput() {
  if (!xmlOutput.value) {
    showStatus("warning", "No output", "Generate output before using it as input.");
    return;
  }

  xmlInput.value = xmlOutput.value;
  updateCounts();
  showStatus("", "Input updated", "The output has been copied into the input editor.");
  xmlInput.focus();
}

function downloadXML() {
  if (!xmlOutput.value) {
    showStatus("warning", "No output", "Generate XML output before downloading.");
    return;
  }

  const blob = new Blob([xmlOutput.value], {
    type: "application/xml;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "formatted.xml";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showStatus("success", "Download started", "Your XML file should now be downloading.");
}

formatButton.addEventListener("click", () => processXML("format"));
validateButton.addEventListener("click", () => processXML("validate"));
minifyButton.addEventListener("click", () => processXML("minify"));
sampleButton.addEventListener("click", loadSample);
clearButton.addEventListener("click", clearAll);
copyButton.addEventListener("click", copyOutput);
useOutputButton.addEventListener("click", useOutputAsInput);
downloadButton.addEventListener("click", downloadXML);

xmlInput.addEventListener("input", updateCounts);
xmlOutput.addEventListener("input", updateCounts);

updateCounts();