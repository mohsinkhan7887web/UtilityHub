
const summarizerForm = document.getElementById("summarizerForm");
const inputText = document.getElementById("inputText");
const summaryLength = document.getElementById("summaryLength");
const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");
const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");
const statusMessage = document.getElementById("status");
const resultSection = document.getElementById("resultSection");
const summaryOutput = document.getElementById("summaryOutput");
const summaryStats = document.getElementById("summaryStats");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

document.getElementById("year").textContent =
  new Date().getFullYear();

function countWords(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

function updateCounts() {
  const text = inputText.value;

  wordCount.textContent =
    countWords(text) + (countWords(text) === 1 ? " word" : " words");

  characterCount.textContent =
    text.length.toLocaleString() + " / 30,000 characters";
}

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function splitSentences(text) {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  // Keep sentence endings with their sentences.
  const matches = normalized.match(/[^.!?]+[.!?]+["'”’)]*|[^.!?]+$/g);

  return (matches || [])
    .map(function (sentence) {
      return sentence.trim();
    })
    .filter(Boolean);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) || [];
}

function summarizeText(text, lengthChoice) {
  const sentences = splitSentences(text);

  if (sentences.length === 0) {
    throw new Error("Please enter some readable text.");
  }

  if (sentences.length === 1) {
    return sentences[0];
  }

  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "if", "then",
    "is", "am", "are", "was", "were", "be", "been", "being",
    "to", "of", "in", "on", "at", "for", "from", "by", "with",
    "as", "it", "its", "this", "that", "these", "those",
    "i", "you", "he", "she", "we", "they", "them", "his",
    "her", "our", "your", "their", "my", "me", "us",
    "do", "does", "did", "have", "has", "had", "can", "could",
    "will", "would", "should", "may", "might", "must",
    "not", "no", "so", "than", "too", "very", "also",
    "what", "which", "who", "when", "where", "why", "how"
  ]);

  const frequencies = new Map();

  sentences.forEach(function (sentence) {
    tokenize(sentence).forEach(function (word) {
      if (word.length > 1 && !stopWords.has(word)) {
        frequencies.set(
          word,
          (frequencies.get(word) || 0) + 1
        );
      }
    });
  });

  const sentenceScores = sentences.map(function (sentence, index) {
    const words = tokenize(sentence);
    let score = 0;
    let usefulWords = 0;

    words.forEach(function (word) {
      if (word.length > 1 && !stopWords.has(word)) {
        score += frequencies.get(word) || 0;
        usefulWords++;
      }
    });

    // Normalize scores so long sentences do not always win.
    score = usefulWords ? score / Math.sqrt(usefulWords) : 0;

    // Give the opening sentence a small preference.
    if (index === 0) {
      score *= 1.15;
    }

    return { index: index, score: score };
  });

  const ratioMap = {
    short: 0.20,
    medium: 0.35,
    long: 0.50
  };

  const ratio = ratioMap[lengthChoice] || 0.35;

  let targetCount = Math.ceil(sentences.length * ratio);
  targetCount = Math.max(1, targetCount);
  targetCount = Math.min(sentences.length - 1, targetCount);

  const selectedIndices = sentenceScores
    .slice()
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .slice(0, targetCount)
    .map(function (item) {
      return item.index;
    })
    .sort(function (a, b) {
      return a - b;
    });

  return selectedIndices
    .map(function (index) {
      return sentences[index];
    })
    .join(" ");
}

inputText.addEventListener("input", function () {
  updateCounts();
  resultSection.hidden = true;
  showStatus("");
});

summarizerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = inputText.value.trim();

  if (!text) {
    showStatus("Please enter some text to summarize.", "error");
    inputText.focus();
    return;
  }

  if (countWords(text) < 20) {
    showStatus(
      "Please enter at least 20 words for a more useful summary.",
      "error"
    );
    return;
  }

  summarizeBtn.disabled = true;
  summarizeBtn.textContent = "Summarizing...";

  try {
    const summary = summarizeText(text, summaryLength.value);

    summaryOutput.value = summary;

    const originalWords = countWords(text);
    const summarizedWords = countWords(summary);
    const reduction = originalWords
      ? Math.round((1 - summarizedWords / originalWords) * 100)
      : 0;

    summaryStats.textContent =
      summarizedWords + " words · " +
      reduction + "% fewer words than the original";

    resultSection.hidden = false;
    showStatus(
      "Summary generated. Review it to make sure it preserves the intended meaning.",
      "success"
    );

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    resultSection.hidden = true;
    showStatus(
      error.message || "Could not summarize this text.",
      "error"
    );
  } finally {
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = "Summarize Text";
  }
});

clearBtn.addEventListener("click", function () {
  summarizerForm.reset();
  inputText.value = "";
  summaryOutput.value = "";
  resultSection.hidden = true;
  summaryStats.textContent = "Summary ready";

  updateCounts();
  showStatus("");
  inputText.focus();
});

copyBtn.addEventListener("click", async function () {
  const text = summaryOutput.value;

  if (!text) {
    showStatus("There is no summary to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showStatus("Summary copied to clipboard.", "success");
  } catch (error) {
    summaryOutput.focus();
    summaryOutput.select();

    const copied = document.execCommand("copy");

    showStatus(
      copied
        ? "Summary copied to clipboard."
        : "Copy failed. Select the summary and copy it manually.",
      copied ? "success" : "error"
    );
  }
});

downloadBtn.addEventListener("click", function () {
  const text = summaryOutput.value;

  if (!text) {
    showStatus("There is no summary to download.", "error");
    return;
  }

  const blob = new Blob([text], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "utilityhub-summary.txt";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);

  showStatus("Summary downloaded as a TXT file.", "success");
});

updateCounts();
