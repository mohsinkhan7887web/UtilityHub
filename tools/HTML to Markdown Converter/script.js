
const htmlInput = document.getElementById("htmlInput");
const markdownOutput = document.getElementById("markdownOutput");
const convertButton = document.getElementById("convertButton");
const sampleButton = document.getElementById("sampleButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const downloadButton = document.getElementById("downloadButton");
const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");
const statusBadge = document.getElementById("statusBadge");
const statusMessage = document.getElementById("statusMessage");

function updateCounts() {
  inputCount.textContent = `${htmlInput.value.length} characters`;
  outputCount.textContent = `${markdownOutput.value.length} characters`;
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
  statusBadge.textContent = isError ? "Error" : "Ready";
}

function decodeEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function escapeMarkdownText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/([`*_{}\[\]<>])/g, "\\$1");
}

function htmlToMarkdown(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if (doc.querySelector("parsererror")) {
    throw new Error("The HTML could not be parsed.");
  }

  // Remove elements that do not normally translate to Markdown.
  doc.querySelectorAll(
    "script, style, noscript, iframe, object, svg, template"
  ).forEach((element) => element.remove());

  function convertNode(node, listDepth = 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = node.tagName.toLowerCase();
    const children = () =>
      Array.from(node.childNodes)
        .map((child) => convertNode(child, listDepth))
        .join("");

    if (tag === "br") return "\n";

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      const content = children().trim();
      return content ? `${"#".repeat(level)} ${content}\n\n` : "";
    }

    if (tag === "p") {
      const content = children().trim();
      return content ? `${content}\n\n` : "";
    }

    if (tag === "strong" || tag === "b") {
      const content = children().trim();
      return content ? `**${content}**` : "";
    }

    if (tag === "em" || tag === "i") {
      const content = children().trim();
      return content ? `*${content}*` : "";
    }

    if (tag === "del" || tag === "s" || tag === "strike") {
      const content = children().trim();
      return content ? `~~${content}~~` : "";
    }

    if (tag === "code") {
      const content = children();
      return content ? `\`${content.replace(/`/g, "\\`")}\`` : "";
    }

    if (tag === "pre") {
      const code = node.textContent.replace(/\n+$/, "");
      return code ? `\n\`\`\`\n${code}\n\`\`\`\n\n` : "";
    }

    if (tag === "a") {
      const content = children().trim();
      const href = node.getAttribute("href");

      if (!content) return href ? `<${href}>` : "";
      if (!href) return content;

      return `[${content}](${href})`;
    }

    if (tag === "img") {
      const alt = (node.getAttribute("alt") || "")
        .replace(/([\\[\]])/g, "\\$1");
      const src = node.getAttribute("src") || "";
      return src ? `![${alt}](${src})` : alt;
    }

    if (tag === "blockquote") {
      const content = children().trim();
      if (!content) return "";
      return content
        .split("\n")
        .map((line) => line.trim() ? `> ${line.trim()}` : ">")
        .join("\n") + "\n\n";
    }

    if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.children).filter(
        (child) => child.tagName.toLowerCase() === "li"
      );

      const lines = items.map((item, index) => {
        const marker = tag === "ol" ? `${index + 1}.` : "-";
        const content = Array.from(item.childNodes)
          .map((child) => convertNode(child, listDepth + 1))
          .join("")
          .trim()
          .replace(/\n{2,}/g, "\n");

        const indent = "  ".repeat(listDepth);
        return content
          .split("\n")
          .map((line, lineIndex) =>
            lineIndex === 0
              ? `${indent}${marker} ${line}`
              : `${indent}  ${line}`
          )
          .join("\n");
      });

      return lines.length ? `${lines.join("\n")}\n\n` : "";
    }

    if (tag === "li") {
      return children();
    }

    if (tag === "hr") {
      return "\n---\n\n";
    }

    if (tag === "table") {
      const rows = Array.from(node.querySelectorAll("tr"));
      const tableRows = rows.map((row) =>
        Array.from(row.children)
          .filter((cell) => /^(TH|TD)$/.test(cell.tagName))
          .map((cell) =>
            convertNode(cell).trim().replace(/\|/g, "\\|").replace(/\s+/g, " ")
          )
      ).filter((row) => row.length);

      if (!tableRows.length) return "";

      const columnCount = Math.max(...tableRows.map((row) => row.length));
      const normalized = tableRows.map((row) =>
        Array.from({ length: columnCount }, (_, index) => row[index] || "")
      );

      const headerIndex = rows.findIndex((row) =>
        row.querySelector("th")
      );

      let header;
      let body;

      if (headerIndex >= 0) {
        header = normalized[headerIndex];
        body = normalized.filter((_, index) => index !== headerIndex);
      } else {
        header = normalized[0];
        body = normalized.slice(1);
      }

      const separator = header.map(() => "---");
      const formatRow = (row) => `| ${row.join(" | ")} |`;

      return [
        formatRow(header),
        formatRow(separator),
        ...body.map(formatRow)
      ].join("\n") + "\n\n";
    }

    if (tag === "div" || tag === "section" || tag === "article" ||
        tag === "main" || tag === "header" || tag === "footer") {
      return `${children()}\n`;
    }

    return children();
  }

  let markdown = Array.from(doc.body.childNodes)
    .map((node) => convertNode(node))
    .join("");

  markdown = decodeEntities(markdown)
    .replace(/[ \t+\u00a0]+$/gm, "")
    .replace(/\n[ \t]*\n[ \t]*\n+/g, "\n\n")
    .trim();

  return markdown ? `${markdown}\n` : "";
}

convertButton.addEventListener("click", () => {
  const html = htmlInput.value;

  if (!html.trim()) {
    markdownOutput.value = "";
    updateCounts();
    showStatus("Please paste some HTML code first.", true);
    return;
  }

  try {
    markdownOutput.value = htmlToMarkdown(html);
    updateCounts();
    statusBadge.textContent = "Converted";
    statusMessage.classList.remove("error");
    statusMessage.textContent = "Conversion completed successfully.";
  } catch (error) {
    showStatus(error.message || "Conversion failed.", true);
  }
});

sampleButton.addEventListener("click", () => {
  htmlInput.value = `<h1>Welcome to UtilityHub</h1>
<p>This is a <strong>free HTML to Markdown converter</strong>.</p>
<h2>Features</h2>
<ul>
  <li>Simple conversion</li>
  <li>Easy to use</li>
</ul>
<p>Visit <a href="https://example.com">Example</a> for more information.</p>`;

  markdownOutput.value = "";
  updateCounts();
  showStatus("Sample HTML loaded. Click Convert to Markdown.");
});

clearButton.addEventListener("click", () => {
  htmlInput.value = "";
  markdownOutput.value = "";
  updateCounts();
  showStatus("Both boxes cleared.");
  htmlInput.focus();
});

copyButton.addEventListener("click", async () => {
  const output = markdownOutput.value;

  if (!output.trim()) {
    showStatus("Convert some HTML before copying.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(output);
    showStatus("Markdown copied to clipboard.");
  } catch {
    markdownOutput.focus();
    markdownOutput.select();

    try {
      const copied = document.execCommand("copy");
      showStatus(
        copied ? "Markdown copied to clipboard." : "Copy failed. Select and copy manually.",
        !copied
      );
    } catch {
      showStatus("Copy failed. Select and copy manually.", true);
    }
  }
});

downloadButton.addEventListener("click", () => {
  const output = markdownOutput.value;

  if (!output.trim()) {
    showStatus("Convert some HTML before downloading.", true);
    return;
  }

  const blob = new Blob([output], {
    type: "text/markdown;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "converted-markdown.md";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showStatus("Markdown file download started.");
});

htmlInput.addEventListener("input", updateCounts);

updateCounts();
