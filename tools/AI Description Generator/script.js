
const descriptionForm = document.getElementById("descriptionForm");
const topicInput = document.getElementById("topic");
const contentTypeSelect = document.getElementById("contentType");
const toneSelect = document.getElementById("tone");
const keywordsInput = document.getElementById("keywords");
const detailsInput = document.getElementById("details");

const statusMessage = document.getElementById("status");
const resultSection = document.getElementById("resultSection");
const descriptionOutput = document.getElementById("descriptionOutput");
const resultCount = document.getElementById("resultCount");

const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

document.getElementById("year").textContent = new Date().getFullYear();

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function makeDescription(topic, type, tone, keywords, details) {
  const keywordText = keywords
    ? ` Key topics include ${keywords}.`
    : "";

  const detailsText = details
    ? ` ${details}`
    : "";

  const descriptions = {
    youtube: {
      friendly:
        `Welcome! In this video, we're exploring ${topic}. Join us as we share useful insights, practical tips, and ideas to help you learn more. ${detailsText}${keywordText} Watch until the end and share your thoughts in the comments!`,
      professional:
        `This video provides an overview of ${topic}, highlighting key information, useful insights, and practical considerations. ${detailsText}${keywordText} Watch the full video for a clear introduction to the subject.`,
      informative:
        `Discover the important details about ${topic} in this informative video. Learn the basics, explore helpful points, and understand what matters most. ${detailsText}${keywordText} Watch to learn more.`,
      persuasive:
        `Looking to learn more about ${topic}? This video brings together useful information and practical ideas to help you get started. ${detailsText}${keywordText} Watch now and discover ideas you can put into practice.`
    },

    blog: {
      friendly:
        `Curious about ${topic}? This article breaks the subject down into easy-to-understand ideas and helpful tips. ${detailsText}${keywordText} Keep reading to explore the topic and discover useful takeaways.`,
      professional:
        `This article examines ${topic}, covering relevant considerations, key insights, and practical approaches. ${detailsText}${keywordText} Read on for an organized introduction to the subject.`,
      informative:
        `Learn more about ${topic} with this helpful article. Explore important points, understand the basics, and discover practical information to guide your next steps. ${detailsText}${keywordText} Continue reading for the complete overview.`,
      persuasive:
        `Ready to explore ${topic}? This guide brings together useful ideas and practical suggestions to help you make informed decisions. ${detailsText}${keywordText} Read the article and find the approach that works for you.`
    },

    social: {
      friendly:
        `Let's talk about ${topic}! ✨ Here are some ideas and insights worth exploring. ${detailsText}${keywordText} What do you think? Share your thoughts below!`,
      professional:
        `Exploring ${topic} through useful insights and practical ideas. ${detailsText}${keywordText} Join the conversation and share your perspective.`,
      informative:
        `Here's a closer look at ${topic}. Discover helpful information and ideas you can use. ${detailsText}${keywordText} Save this post for later and share your thoughts!`,
      persuasive:
        `It's time to discover new possibilities with ${topic}! ${detailsText}${keywordText} Take a moment to explore the idea and tell us what you think.`
    },

    product: {
      friendly:
        `Discover ${topic}, presented with a focus on its key features and potential uses. ${detailsText}${keywordText} Explore the details to see whether it suits your needs.`,
      professional:
        `${topic} is presented here with an overview of its relevant features and intended uses. ${detailsText}${keywordText} Review the available specifications and information before making a purchase decision.`,
      informative:
        `Learn more about ${topic}, including the features, uses, and considerations that may matter when choosing a product. ${detailsText}${keywordText} Check the product specifications to decide whether it meets your requirements.`,
      persuasive:
        `Considering ${topic}? Explore its features and potential benefits to see if it matches your needs. ${detailsText}${keywordText} Review the details and make the choice that's right for you.`
    }
  };

  return descriptions[type][tone]
    .replace(/\s+/g, " ")
    .trim();
}

function updateWordCount(text) {
  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  resultCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporary = document.createElement("textarea");
  temporary.value = text;
  temporary.style.position = "fixed";
  temporary.style.opacity = "0";

  document.body.appendChild(temporary);
  temporary.select();

  const copied = document.execCommand("copy");
  temporary.remove();

  if (!copied) {
    throw new Error("Copy failed");
  }
}

descriptionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const topic = cleanText(topicInput.value);
  const type = contentTypeSelect.value;
  const tone = toneSelect.value;
  const keywords = cleanText(keywordsInput.value);
  const details = cleanText(detailsInput.value);

  if (!topic) {
    showStatus("Please enter a topic or content title.", true);
    topicInput.focus();
    return;
  }

  const description = makeDescription(
    topic,
    type,
    tone,
    keywords,
    details
  );

  descriptionOutput.value = description;
  updateWordCount(description);
  resultSection.hidden = false;

  showStatus("Your description is ready! Review it before publishing.");
});

copyBtn.addEventListener("click", async () => {
  if (!descriptionOutput.value.trim()) {
    showStatus("Generate a description first.", true);
    return;
  }

  try {
    await copyText(descriptionOutput.value);
    showStatus("Description copied successfully!");
  } catch {
    showStatus("Copy failed. You can select the text and copy it manually.", true);
  }
});

downloadBtn.addEventListener("click", () => {
  const description = descriptionOutput.value.trim();

  if (!description) {
    showStatus("Generate a description first.", true);
    return;
  }

  const blob = new Blob([description], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "utilityhub-description.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showStatus("Your description download has started.");
});

clearBtn.addEventListener("click", () => {
  descriptionForm.reset();
  descriptionOutput.value = "";
  resultSection.hidden = true;
  resultCount.textContent = "";
  showStatus("All fields cleared. Enter a new topic to begin.");
  topicInput.focus();
});
