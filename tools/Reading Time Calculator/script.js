
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");
  const readingSpeed = document.getElementById("readingSpeed");
  const calculateButton = document.getElementById("calculateButton");
  const clearButton = document.getElementById("clearButton");
  const sampleButton = document.getElementById("sampleButton");
  const copyButton = document.getElementById("copyButton");

  const readingTime = document.getElementById("readingTime");
  const wordCount = document.getElementById("wordCount");
  const characterCount = document.getElementById("characterCount");
  const speedDisplay = document.getElementById("speedDisplay");
  const statusMessage = document.getElementById("statusMessage");

  const sampleText =
    "Reading regularly can improve vocabulary, focus and understanding. " +
    "Choose a comfortable reading speed and practise every day. " +
    "This tool estimates how long your text may take to read. " +
    "Remember that difficult material can take longer than simple text.";

  let latestResults = {
    time: "0 sec",
    words: 0,
    characters: 0,
    speed: 200
  };

  function getWords(text) {
    const trimmed = text.trim();

    if (!trimmed) {
      return [];
    }

    const matches = trimmed.match(
      /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu
    );

    return matches || [];
  }

  function formatReadingTime(words, wpm) {
    if (words === 0) {
      return "0 sec";
    }

    const totalSeconds = Math.ceil((words / wpm) * 60);

    if (totalSeconds < 60) {
      return `${totalSeconds} sec`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (seconds === 0) {
      return `${minutes} min`;
    }

    return `${minutes} min ${seconds} sec`;
  }

  function updateResults() {
    const text = textInput.value;
    const words = getWords(text).length;
    const characters = text.length;
    const speed = Number(readingSpeed.value) || 200;
    const time = formatReadingTime(words, speed);

    latestResults = {
      time,
      words,
      characters,
      speed
    };

    readingTime.textContent = time;
    wordCount.textContent = words.toLocaleString();
    characterCount.textContent = characters.toLocaleString();
    speedDisplay.textContent = `${speed} WPM`;

    statusMessage.textContent = text.trim()
      ? "Reading time estimate updated."
      : "Enter some text to calculate reading time.";
  }

  function clearText() {
    textInput.value = "";
    updateResults();
    textInput.focus();
  }

  async function copyResults() {
    const resultText = [
      "UtilityHub - Reading Time Calculator",
      `Estimated reading time: ${latestResults.time}`,
      `Total words: ${latestResults.words}`,
      `Characters: ${latestResults.characters}`,
      `Reading speed: ${latestResults.speed} words per minute`
    ].join("\n");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(resultText);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = resultText;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();

        const copied = document.execCommand("copy");
        temporary.remove();

        if (!copied) {
          throw new Error("Copy command was unsuccessful.");
        }
      }

      statusMessage.textContent = "Results copied to clipboard.";
    } catch (error) {
      statusMessage.textContent =
        "Could not copy automatically. Please copy the results manually.";
    }
  }

  calculateButton.addEventListener("click", updateResults);
  clearButton.addEventListener("click", clearText);

  sampleButton.addEventListener("click", () => {
    textInput.value = sampleText;
    updateResults();
    textInput.focus();
  });

  copyButton.addEventListener("click", copyResults);

  textInput.addEventListener("input", updateResults);
  readingSpeed.addEventListener("change", updateResults);

  updateResults();
});
