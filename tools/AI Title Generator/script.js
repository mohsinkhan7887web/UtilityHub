
const titleForm = document.getElementById("titleForm");
const topicInput = document.getElementById("topic");
const contentType = document.getElementById("contentType");
const toneSelect = document.getElementById("tone");
const keywordInput = document.getElementById("keyword");

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const statusMessage = document.getElementById("status");

const resultSection = document.getElementById("resultSection");
const resultCount = document.getElementById("resultCount");
const titleResults = document.getElementById("titleResults");

const copyAllBtn = document.getElementById("copyAllBtn");
const downloadBtn = document.getElementById("downloadBtn");

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

let generatedTitles = [];

const titleTemplates = {
  youtube: {
    curiosity: [
      "The Truth About {topic} Nobody Talks About",
      "I Tried {topic} — Here's What Happened",
      "What Everyone Gets Wrong About {topic}",
      "Before You Try {topic}, Watch This!",
      "The Secret to Understanding {topic}"
    ],
    informative: [
      "{topic}: A Complete Beginner's Guide",
      "How {topic} Works: Everything You Need to Know",
      "7 Important Things to Know About {topic}",
      "{topic} Explained in Simple Terms",
      "The Ultimate Guide to {topic}"
    ],
    professional: [
      "{topic}: Key Insights and Practical Tips",
      "Understanding {topic}: A Detailed Guide",
      "A Practical Approach to {topic}",
      "Essential Strategies for {topic}",
      "What You Should Know About {topic}"
    ],
    catchy: [
      "{topic} Made Easy!",
      "Stop Making These {topic} Mistakes!",
      "Your {topic} Game-Changer",
      "The Smart Way to Master {topic}",
      "{topic}: Try This Today!"
    ]
  },

  blog: {
    curiosity: [
      "What You Should Know About {topic}",
      "The Surprising Facts About {topic}",
      "Why Is Everyone Talking About {topic}?",
      "The Truth Behind {topic}",
      "What Most People Miss About {topic}"
    ],
    informative: [
      "The Complete Guide to {topic}",
      "10 Practical Tips for {topic}",
      "How to Get Started With {topic}",
      "{topic}: Benefits, Challenges, and Tips",
      "Everything Beginners Need to Know About {topic}"
    ],
    professional: [
      "A Practical Guide to Understanding {topic}",
      "Key Considerations When Exploring {topic}",
      "Best Practices for {topic}",
      "An In-Depth Look at {topic}",
      "Effective Strategies for {topic}"
    ],
    catchy: [
      "Make {topic} Easier With These Tips",
      "Your Simple Roadmap to {topic}",
      "Ready to Improve Your {topic}?",
      "Smart Ways to Approach {topic}",
      "Unlock New Possibilities With {topic}"
    ]
  },

  shorts: {
    curiosity: [
      "Wait Until You See This About {topic}!",
      "Did You Know This About {topic}?",
      "Nobody Expected This From {topic}!",
      "The Hidden Side of {topic}",
      "This Changes How You See {topic}!"
    ],
    informative: [
      "{topic} in 30 Seconds",
      "3 Quick Facts About {topic}",
      "{topic} Explained Fast",
      "Learn {topic} in Under a Minute",
      "One Simple Guide to {topic}"
    ],
    professional: [
      "A Quick Guide to {topic}",
      "Essential {topic} Tips in 60 Seconds",
      "Understanding {topic} Quickly",
      "The Basics of {topic}",
      "Quick Insights Into {topic}"
    ],
    catchy: [
      "Try This {topic} Trick!",
      "Your Quick {topic} Upgrade",
      "Stop Scrolling: Learn {topic}!",
      "One Minute, One Big {topic} Lesson",
      "Save This {topic} Tip!"
    ]
  },

  social: {
    curiosity: [
      "There's More to {topic} Than You Think",
      "Let's Talk About {topic}",
      "Have You Ever Wondered About {topic}?",
      "A Fresh Perspective on {topic}",
      "The Story Behind {topic}"
    ],
    informative: [
      "5 Things to Remember About {topic}",
      "A Quick Guide to {topic}",
      "What You Need to Know About {topic}",
      "Simple Tips for Better {topic}",
      "Let's Break Down {topic}"
    ],
    professional: [
      "Insights and Ideas on {topic}",
      "A Practical Perspective on {topic}",
      "Exploring the Value of {topic}",
      "Important Lessons About {topic}",
      "A Thoughtful Look at {topic}"
    ],
    catchy: [
      "Let's Make {topic} Happen!",
      "Your Next Big Idea: {topic}",
      "Small Changes, Better {topic}",
      "Ready for a Fresh Take on {topic}?",
      "Here's Your Sign to Explore {topic}"
    ]
  },

  product: {
    curiosity: [
      "Is {topic} Worth It? Here's What to Consider",
      "What Makes {topic} Different?",
      "Before Buying {topic}, Read This",
      "The Features of {topic} You Should Know",
      "Could {topic} Be Right for You?"
    ],
    informative: [
      "{topic}: Features and Benefits",
      "The Complete Guide to Choosing {topic}",
      "Why Consider {topic}?",
      "{topic}: What Buyers Should Know",
      "How to Choose the Right {topic}"
    ],
    professional: [
      "{topic}: A Product Overview",
      "Explore the Features of {topic}",
      "{topic}: A Practical Buying Guide",
      "Key Benefits and Considerations for {topic}",
      "An Overview of {topic}"
    ],
    catchy: [
      "Meet Your Next Favourite: {topic}",
      "Discover What {topic} Can Do",
      "Make More of Your Day With {topic}",
      "{topic}: Worth a Closer Look!",
      "Find Your Fit With {topic}"
    ]
  }
};

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function titleCase(value) {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function createTitles(topic, type, tone, keyword) {
  const templates = titleTemplates[type][tone];

  const titles = templates.map((template) => {
    let title = template.replace(/\{topic\}/g, topic);

    if (keyword) {
      title = `${title} | ${keyword}`;
    }

    return title;
  });

  // Remove duplicate titles while preserving their order.
  return [...new Set(titles)];
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function renderTitles(titles) {
  titleResults.replaceChildren();

  titles.forEach((title, index) => {
    const card = document.createElement("article");
    card.className = "title-option";

    const heading = document.createElement("p");
    heading.textContent = `${index + 1}. ${title}`;

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-one secondary-button";
    copyButton.textContent = "Copy title";

    copyButton.addEventListener("click", async () => {
      try {
        await copyText(title);
        showStatus("Title copied successfully!");
      } catch {
        showStatus("Copy failed. Please select and copy the title manually.", true);
      }
    });

    card.append(heading, copyButton);
    titleResults.appendChild(card);
  });

  resultCount.textContent = `${titles.length} title ideas`;
  resultSection.hidden = false;
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

  const successful = document.execCommand("copy");
  temporary.remove();

  if (!successful) {
    throw new Error("Copy failed");
  }
}

titleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const topic = cleanText(topicInput.value);
  const type = contentType.value;
  const tone = toneSelect.value;
  const keyword = cleanText(keywordInput.value);

  if (!topic) {
    showStatus("Please enter a topic first.", true);
    topicInput.focus();
    return;
  }

  if (!titleTemplates[type] || !titleTemplates[type][tone]) {
    showStatus("Please choose a valid content type and title style.", true);
    return;
  }

  generatedTitles = createTitles(topic, type, tone, keyword);
  renderTitles(generatedTitles);
  showStatus("Title ideas generated. Choose your favourite!");
});

clearBtn.addEventListener("click", () => {
  titleForm.reset();
  generatedTitles = [];
  titleResults.replaceChildren();
  resultSection.hidden = true;
  resultCount.textContent = "";
  showStatus("Fields cleared. Enter a new topic to begin.");
  topicInput.focus();
});

copyAllBtn.addEventListener("click", async () => {
  if (generatedTitles.length === 0) {
    showStatus("Generate some titles first.", true);
    return;
  }

  try {
    await copyText(generatedTitles.map((title, index) => `${index + 1}. ${title}`).join("\n"));
    showStatus("All title ideas copied!");
  } catch {
    showStatus("Could not copy titles. Please try again.", true);
  }
});

downloadBtn.addEventListener("click", () => {
  if (generatedTitles.length === 0) {
    showStatus("Generate some titles first.", true);
    return;
  }

  const content = generatedTitles
    .map((title, index) => `${index + 1}. ${title}`)
    .join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "utilityhub-title-ideas.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showStatus("Your title ideas download has started.");
});
