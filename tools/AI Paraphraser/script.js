
const form = document.getElementById("paraphraserForm");
const inputText = document.getElementById("inputText");
const writingStyle = document.getElementById("writingStyle");
const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");
const rewriteBtn = document.getElementById("rewriteBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("status");
const resultSection = document.getElementById("resultSection");
const outputText = document.getElementById("outputText");
const resultWordCount = document.getElementById("resultWordCount");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

document.getElementById("year").textContent = new Date().getFullYear();

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function updateCounts() {
  wordCount.textContent = `${countWords(inputText.value)} words`;
  characterCount.textContent =
    `${inputText.value.length.toLocaleString()} / 10,000 characters`;
}

function showStatus(message, type = "") {
  status.textContent = message;
  status.className = "status";

  if (type) {
    status.classList.add(type);
  }
}

const replacements = {
  standard: [
    [/\buse\b/gi, "utilize"],
    [/\bhelp\b/gi, "assist"],
    [/\bshow\b/gi, "display"],
    [/\bstart\b/gi, "begin"],
    [/\bend\b/gi, "finish"],
    [/\babout\b/gi, "regarding"],
    [/\bneed\b/gi, "require"],
    [/\bget\b/gi, "obtain"],
    [/\bmake\b/gi, "create"],
    [/\bimportant\b/gi, "significant"]
  ],
  formal: [
    [/\ba lot of\b/gi, "a considerable amount of"],
    [/\bhelp\b/gi, "assist"],
    [/\bshow\b/gi, "demonstrate"],
    [/\bstart\b/gi, "commence"],
    [/\bend\b/gi, "conclude"],
    [/\babout\b/gi, "regarding"],
    [/\bget\b/gi, "obtain"],
    [/\bneed\b/gi, "require"],
    [/\bso\b/gi, "therefore"],
    [/\bbut\b/gi, "however"]
  ],
  simple: [
    [/\butilize\b/gi, "use"],
    [/\bcommence\b/gi, "start"],
    [/\bconclude\b/gi, "finish"],
    [/\bapproximately\b/gi, "about"],
    [/\bdemonstrate\b/gi, "show"],
    [/\bassistance\b/gi, "help"],
    [/\brequire\b/gi, "need"],
    [/\bobtain\b/gi, "get"],
    [/\bpurchase\b/gi, "buy"],
    [/\badditional\b/gi, "extra"]
  ],
  casual: [
    [/\butilize\b/gi, "use"],
    [/\bassist\b/gi, "help"],
    [/\bdemonstrate\b/gi, "show"],
    [/\bcommence\b/gi, "start"],
    [/\bconclude\b/gi, "finish"],
    [/\bregarding\b/gi, "about"],
    [/\bobtain\b/gi, "get"],
    [/\brequire\b/gi, "need"],
    [/\bpurchase\b/gi, "buy"],
    [/\btherefore\b/gi, "so"]
  ]
};

function matchCase(original, replacement) {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }

  if (
    original.length > 0 &&
    original[0] === original[0].toUpperCase()
  ) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function paraphrase(text, style) {
  let result = text;
  const rules = replacements[style] || replacements.standard;

  rules.forEach(function ([pattern, replacement]) {
    result = result.replace(pattern, function (match) {
      return matchCase(match, replacement);
    });
  });

  return result;
}

inputText.addEventListener("input", function () {
  updateCounts();
  resultSection.hidden = true;
  showStatus("");
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const original = inputText.value.trim();

  if (!original) {
    showStatus("Please enter some text first.", "error");
    inputText.focus();
    return;
  }

  if (countWords(original) < 5) {
    showStatus("Please enter at least 5 words.", "error");
    return;
  }

  rewriteBtn.disabled = true;
  rewriteBtn.textContent = "Rewriting...";

  try {
    const result = paraphrase(original, writingStyle.value);

    outputText.value = result;
    resultWordCount.textContent = `${countWords(result)} words`;
    resultSection.hidden = false;

    if (result === original) {
      showStatus(
        "No matching words were found for this style. The text remains unchanged.",
        "success"
      );
    } else {
      showStatus(
        "Text rewritten using basic word substitutions. Review the meaning before using it.",
        "success"
      );
    }

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    showStatus("Something went wrong. Please try again.", "error");
  } finally {
    rewriteBtn.disabled = false;
    rewriteBtn.textContent = "Rewrite Text";
  }
});

clearBtn.addEventListener("click", function () {
  form.reset();
  inputText.value = "";
  outputText.value = "";
  resultSection.hidden = true;
  resultWordCount.textContent = "0 words";

  updateCounts();
  showStatus("");
  inputText.focus();
});

copyBtn.addEventListener("click", async function () {
  const text = outputText.value;

  if (!text) {
    showStatus("There is no rewritten text to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showStatus("Rewritten text copied.", "success");
  } catch (error) {
    outputText.focus();
    outputText.select();

    const copied = document.execCommand("copy");

    showStatus(
      copied
        ? "Rewritten text copied."
        : "Copy failed. Select the text and copy it manually.",
      copied ? "success" : "error"
    );
  }
});

downloadBtn.addEventListener("click", function () {
  if (!outputText.value) {
    showStatus("There is no text to download.", "error");
    return;
  }

  const blob = new Blob([outputText.value], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "utilityhub-paraphrased-text.txt";

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showStatus("Text downloaded as a TXT file.", "success");
});

updateCounts();
