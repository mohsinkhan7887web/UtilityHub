
const form = document.getElementById("writingForm");
const contentType = document.getElementById("contentType");
const topic = document.getElementById("topic");
const details = document.getElementById("details");
const tone = document.getElementById("tone");
const length = document.getElementById("length");
const detailsCount = document.getElementById("detailsCount");
const characterCount = document.getElementById("characterCount");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const statusMessage = document.getElementById("status");
const resultSection = document.getElementById("resultSection");
const outputText = document.getElementById("outputText");
const resultCount = document.getElementById("resultCount");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

document.getElementById("year").textContent = new Date().getFullYear();

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function updateCounts() {
  detailsCount.textContent = `${countWords(details.value)} words`;
  characterCount.textContent =
    `${details.value.length.toLocaleString()} / 3,000 characters`;
}

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function cleanText(text) {
  return text.trim().replace(/\s+/g, " ");
}

function capitalizeFirst(text) {
  if (!text) return text;

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getGreeting(selectedTone) {
  if (selectedTone === "casual") return "Hi!";
  if (selectedTone === "friendly") return "Hello!";
  return "Hello,";
}

function buildDraft() {
  const subject = cleanText(topic.value);
  const extraDetails = cleanText(details.value);
  const selectedType = contentType.value;
  const selectedTone = tone.value;
  const selectedLength = length.value;

  const friendly = selectedTone === "friendly";
  const persuasive = selectedTone === "persuasive";
  const casual = selectedTone === "casual";

  const opening = friendly
    ? "I hope you're doing well."
    : casual
      ? "Hope you're doing great!"
      : "I am writing to share the following information.";

  const detailSentence = extraDetails
    ? `\n\nKey details:\n${extraDetails}`
    : "";

  let draft = "";

  if (selectedType === "email") {
    const greeting = getGreeting(selectedTone);

    draft =
      `Subject: ${capitalizeFirst(subject)}\n\n` +
      `${greeting}\n\n${opening}\n\n` +
      `I wanted to reach out regarding ${subject}.` +
      detailSentence +
      "\n\nPlease let me know if you have any questions." +
      "\n\nBest regards,\n[Your Name]";
  } else if (selectedType === "social") {
    draft =
      `${capitalizeFirst(subject)}\n\n` +
      (persuasive
        ? "Discover the possibilities and take the next step today!"
        : friendly
          ? "We're excited to share this with you!"
          : casual
            ? "Here's something worth checking out!"
            : "Here is something to know about this topic.") +
      (extraDetails ? `\n\n${extraDetails}` : "") +
      "\n\nWhat do you think? Share your thoughts below!";
  } else if (selectedType === "product") {
    draft =
      `${capitalizeFirst(subject)}\n\n` +
      (persuasive
        ? `Discover how ${subject} could be a useful addition to your routine.`
        : friendly
          ? `Meet ${subject}, designed with your needs in mind.`
          : `Learn more about ${subject} and its potential uses.`) +
      (extraDetails ? `\n\nDetails:\n${extraDetails}` : "") +
      "\n\nReview the specifications and choose the option that best suits your needs.";
  } else if (selectedType === "blog") {
    draft =
      `Introduction: ${capitalizeFirst(subject)}\n\n` +
      `Understanding ${subject} can help readers explore the topic more clearly.` +
      (extraDetails
        ? ` This article will cover ${extraDetails}.`
        : " In this introduction, we will outline the main ideas and explain why the topic matters.") +
      "\n\nThe following sections explore key points, practical considerations, and useful takeaways.";
  } else {
    draft =
      `${capitalizeFirst(subject)}\n\n` +
      (persuasive
        ? `There are several reasons to pay attention to ${subject}.`
        : friendly
          ? `Let's take a closer look at ${subject}.`
          : casual
            ? `Let's talk about ${subject}.`
            : `This paragraph introduces the topic of ${subject}.`) +
      (extraDetails ? `\n\n${extraDetails}` : "") +
      "\n\nConsider these points carefully and adapt them to your specific needs.";
  }

  if (selectedLength === "medium") {
    draft +=
      "\n\nWhen developing this content further, include relevant examples, " +
      "specific information, and details that are useful to your intended audience.";
  } else if (selectedLength === "long") {
    draft +=
      "\n\nTo expand this draft, explain the main points in greater depth, " +
      "provide practical examples, and address questions your audience may have." +
      "\n\nFinish by summarizing the key message and identifying any useful next steps.";
  }

  return draft;
}

details.addEventListener("input", function () {
  updateCounts();
  resultSection.hidden = true;
  showStatus("");
});

topic.addEventListener("input", function () {
  resultSection.hidden = true;
  showStatus("");
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!topic.value.trim()) {
    showStatus("Please enter a topic or purpose.", "error");
    topic.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Creating Draft...";

  try {
    const draft = buildDraft();

    outputText.value = draft;
    resultCount.textContent = `${countWords(draft)} words`;
    resultSection.hidden = false;

    showStatus(
      "Draft created from a template. Edit it to add accurate, specific information.",
      "success"
    );

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    showStatus("Could not create the draft. Please try again.", "error");
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Create Draft";
  }
});

clearBtn.addEventListener("click", function () {
  form.reset();
  topic.value = "";
  details.value = "";
  outputText.value = "";
  resultSection.hidden = true;
  resultCount.textContent = "0 words";

  updateCounts();
  showStatus("");
  topic.focus();
});

copyBtn.addEventListener("click", async function () {
  if (!outputText.value) {
    showStatus("There is no draft to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(outputText.value);
    showStatus("Draft copied to clipboard.", "success");
  } catch (error) {
    outputText.focus();
    outputText.select();

    const copied = document.execCommand("copy");

    showStatus(
      copied
        ? "Draft copied to clipboard."
        : "Copy failed. Select the draft and copy it manually.",
      copied ? "success" : "error"
    );
  }
});

downloadBtn.addEventListener("click", function () {
  if (!outputText.value) {
    showStatus("There is no draft to download.", "error");
    return;
  }

  const blob = new Blob([outputText.value], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "utilityhub-writing-draft.txt";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);

  showStatus("Draft downloaded as a TXT file.", "success");
});

updateCounts();
