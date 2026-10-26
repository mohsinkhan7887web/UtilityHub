
const markdownInput = document.getElementById("markdownInput");
const htmlOutput = document.getElementById("htmlOutput");
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
  inputCount.textContent = `${markdownInput.value.length} characters`;
  outputCount.textContent = `${htmlOutput.value.length} characters`;
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
  statusBadge.textContent = isError ? "Error" : "Ready";
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[char];
  });
}

function safeURL(value, image = false) {
  const url = value.trim();

  if (/^(https?:|mailto:)/i.test(url) && !image) {
    return url;
  }

  if (/^https?:/i.test(url)) {
    return url;
  }

  if (/^(\/|\.\/|\.\.\/|#)/.test(url)) {
    return url;
  }

  return "";
}

function inlineMarkdown(text) {
  const tokens = [];

  function protect(value) {
    const index = tokens.length;
    tokens.push(value);
    return `\u0000${index}\u0000`;
  }

  // Protect inline code before processing other Markdown syntax.
  text = text.replace(/`([^`\n]+)`/g, (_, code) =>
    protect(`<code>${escapeHTML(code)}</code>`)
  );

  // Escape normal text so input is not treated as raw HTML.
  text = escapeHTML(text);

  // Links and images.
  text = text.replace(
    /!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)/g,
    (_, alt, rawURL, title = "") => {
      const url = safeURL(rawURL, true);
      if (!url) return alt;

      return protect(
        `<img src="${escapeHTML(url)}" alt="${alt}"${title ? ` title="${title}"` : ""}>`
      );
    }
  );

  text = text.replace(
    /\[([^\]]+)\]\((\S+?)(?:\s+"([^"]*)")?\)/g,
    (_, label, rawURL, title = "") => {
      const url = safeURL(rawURL);
      if (!url) return label;

      return protect(
        `<a href="${escapeHTML(url)}"${title ? ` title="${title}"` : ""}>${label}</a>`
      );
    }
  );

  // Autolink plain HTTP(S) URLs.
  text = text.replace(
    /(^|[\s(])(https?:\/\/[^\s<]+)/g,
    (_, prefix, rawURL) => {
      const trailing = rawURL.match(/[.,!?;:)]*$/)?.[0] || "";
      const url = rawURL.slice(0, rawURL.length - trailing.length);

      if (!url) return prefix + rawURL;

      return prefix + protect(
        `<a href="${escapeHTML(url)}">${escapeHTML(url)}</a>`
      ) + trailing;
    }
  );

  // Strong, emphasis, and strikethrough.
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");

  return text.replace(/\u0000(\d+)\u0000/g, (_, index) =>
    tokens[Number(index)] ?? ""
  );
}

function convertMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let inCodeBlock = false;
  let codeLanguage = "";
  let codeLines = [];
  let quoteLines = [];

  function flushParagraph() {
    if (paragraph.length) {
      output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (!listType) return;

    const tag = listType === "ordered" ? "ol" : "ul";
    const items = listItems.map((item) =>
      `<li>${inlineMarkdown(item)}</li>`
    );

    output.push(`<${tag}>\n${items.join("\n")}\n</${tag}>`);
    listType = null;
    listItems = [];
  }

  function flushQuote() {
    if (!quoteLines.length) return;

    const content = convertMarkdown(quoteLines.join("\n"));
    output.push(
      `<blockquote>\n${content}\n</blockquote>`
    );
    quoteLines = [];
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inCodeBlock) {
      if (/^\s*```/.test(line)) {
        const languageClass = /^[\w+-]+$/.test(codeLanguage)
          ? ` class="language-${escapeHTML(codeLanguage)}"`
          : "";

        output.push(
          `<pre><code${languageClass}>${escapeHTML(codeLines.join("\n"))}</code></pre>`
        );

        inCodeBlock = false;
        codeLanguage = "";
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const codeMatch = line.match(/^\s*```\s*([\w+-]*)\s*$/);

    if (codeMatch) {
      flushAll();
      inCodeBlock = true;
      codeLanguage = codeMatch[1];
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    // Headings.
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);

    if (heading) {
      flushAll();
      const level = heading[1].length;
      output.push(
        `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`
      );
      continue;
    }

    // Horizontal rule.
    if (/^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) {
      flushAll();
      output.push("<hr>");
      continue;
    }

    // Blockquote.
    const quote = line.match(/^\s{0,3}>\s?(.*)$/);

    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    } else {
      flushQuote();
    }

    // Simple Markdown tables.
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1])
    ) {
      flushAll();

      const splitRow = (row) =>
        row.trim().replace(/^\|/, "").replace(/\|$/, "")
          .split("|").map((cell) => cell.trim());

      const headers = splitRow(line);
      i++;

      const rows = [];

      while (i + 1 < lines.length && lines[i + 1].includes("|") && lines[i + 1].trim()) {
        i++;
        rows.push(splitRow(lines[i]));
      }

      const headerHTML = headers.map((cell) =>
        `<th>${inlineMarkdown(cell)}</th>`
      ).join("");

      const bodyHTML = rows.map((row) => {
        const cells = headers.map((_, index) =>
          `<td>${inlineMarkdown(row[index] || "")}</td>`
        ).join("");

        return `<tr>${cells}</tr>`;
      }).join("\n");

      output.push(
        `<table>\n<thead><tr>${headerHTML}</tr></thead>\n<tbody>\n${bodyHTML}\n</tbody>\n</table>`
      );
      continue;
    }

    // Unordered and ordered lists.
    const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);

    if (unordered || ordered) {
      flushParagraph();

      const nextType = unordered ? "unordered" : "ordered";

      if (listType && listType !== nextType) {
        flushList();
      }

      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      continue;
    }

    flushList();

    // Task list items.
    const task = line.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/);

    if (task) {
      flushParagraph();

      const checked = task[1].toLowerCase() === "x";
      output.push(
        `<ul class="task-list"><li><input type="checkbox" disabled${checked ? " checked" : ""}> ${inlineMarkdown(task[2])}</li></ul>`
      );
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCodeBlock) {
    output.push(
      `<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`
    );
  }

  flushAll();

  return output.join("\n");
}

convertButton.addEventListener("click", () => {
  if (!markdownInput.value.trim()) {
    htmlOutput.value = "";
    updateCounts();
    showStatus("Please enter some Markdown first.", true);
    return;
  }

  try {
    htmlOutput.value = convertMarkdown(markdownInput.value);
    updateCounts();
    statusBadge.textContent = "Converted";
    statusMessage.classList.remove("error");
    statusMessage.textContent = "Conversion completed successfully.";
  } catch (error) {
    showStatus(error.message || "Conversion failed.", true);
  }
});

sampleButton.addEventListener("click", () => {
  markdownInput.value = `# Welcome to UtilityHub

This is a **Markdown to HTML Converter**.

## Features

- Convert Markdown to HTML
- Support *italic* and **bold** text
- Create [links](https://example.com)
- Display inline \`code\`

> This is a blockquote.

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

| Tool | Status |
| --- | --- |
| Converter | Ready |
| Output | HTML |

---

Enjoy using UtilityHub!`;

  htmlOutput.value = "";
  updateCounts();
  showStatus("Sample Markdown loaded. Click Convert to HTML.");
});

clearButton.addEventListener("click", () => {
  markdownInput.value = "";
  htmlOutput.value = "";
  updateCounts();
  showStatus("Both boxes cleared.");
  markdownInput.focus();
});

copyButton.addEventListener("click", async () => {
  if (!htmlOutput.value.trim()) {
    showStatus("Convert Markdown before copying.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(htmlOutput.value);
    showStatus("HTML copied to clipboard.");
  } catch {
    htmlOutput.focus();
    htmlOutput.select();

    try {
      const copied = document.execCommand("copy");
      showStatus(
        copied ? "HTML copied to clipboard." : "Copy failed. Select and copy manually.",
        !copied
      );
    } catch {
      showStatus("Copy failed. Select and copy manually.", true);
    }
  }
});

downloadButton.addEventListener("click", () => {
  if (!htmlOutput.value.trim()) {
    showStatus("Convert Markdown before downloading.", true);
    return;
  }

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Markdown</title>
</head>
<body>
${htmlOutput.value}
</body>
</html>`;

  const blob = new Blob([fullHTML], {
    type: "text/html;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "converted-markdown.html";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showStatus("HTML file download started.");
});

markdownInput.addEventListener("input", updateCounts);

updateCounts();
