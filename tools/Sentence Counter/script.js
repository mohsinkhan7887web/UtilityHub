
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");
  const countButton = document.getElementById("countButton");
  const clearButton = document.getElementById("clearButton");
  const sampleButton = document.getElementById("sampleButton");

  const sentenceCount = document.getElementById("sentenceCount");
  const wordCount = document.getElementById("wordCount");
  const characterCount = document.getElementById("characterCount");
  const noSpaceCount = document.getElementById("noSpaceCount");
  const averageWords = document.getElementById("averageWords");
  const statusMessage = document.getElementById("statusMessage");

  const sampleText =
    "UtilityHub provides free online tools. This Sentence Counter is easy to use! " +
    "Paste your text here, and check your results. How many sentences are in this sample?";

  function countSentences(text) {
    const trimmed = text.trim();

    if (!trimmed) {
      return 0;
    }

    // Count sentence-ending punctuation, including repeated marks such as ?!
    const matches = trimmed.match(/[.!?]+(?=\s|["'”’)\]]*$)/g);

    if (matches) {
      return matches.length;
    }

    // Text without terminal punctuation is treated as one sentence.
    return 1;
  }

  function countWords(text) {
    const trimmed = text.trim();

    if (!trimmed) {
      return 0;
    }

    // Count groups of letters or numbers, allowing internal apostrophes
    // and hyphens (for example, "don't" and "well-known").
    const matches = trimmed.match(
      /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu
    );

    return matches ? matches.length : 0;
  }

  function updateCounts() {
    const text = textInput.value;
    const sentences = countSentences(text);
    const words = countWords(text);
    const characters = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, "").length;
    const average = sentences > 0
      ? (words / sentences).toFixed(2)
      : "0";

    sentenceCount.textContent = sentences.toLocaleString();
    wordCount.textContent = words.toLocaleString();
    characterCount.textContent = characters.toLocaleString();
    noSpaceCount.textContent =
      charactersWithoutSpaces.toLocaleString();
    averageWords.textContent = average;

    if (text.trim()) {
      statusMessage.textContent = "Your text has been counted.";
    } else {
      statusMessage.textContent = "Enter some text to see your results.";
    }
  }

  function clearText() {
    textInput.value = "";
    updateCounts();
    textInput.focus();
  }

  countButton.addEventListener("click", updateCounts);

  clearButton.addEventListener("click", clearText);

  sampleButton.addEventListener("click", () => {
    textInput.value = sampleText;
    updateCounts();
    textInput.focus();
  });

  // Update results as the user types or edits the text.
  textInput.addEventListener("input", updateCounts);

  // Initialize all result cards.
  updateCounts();
});
