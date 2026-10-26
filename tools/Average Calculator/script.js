
const averageForm = document.getElementById("averageForm");
const numbersInput = document.getElementById("numbers");
const message = document.getElementById("message");
const result = document.getElementById("result");

const averageValue = document.getElementById("averageValue");
const sumValue = document.getElementById("sumValue");
const countValue = document.getElementById("countValue");
const rangeValue = document.getElementById("rangeValue");

function formatNumber(number) {
  return Number(number.toFixed(8)).toLocaleString("en-US", {
    maximumFractionDigits: 8
  });
}

averageForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  const input = numbersInput.value.trim();

  if (!input) {
    message.textContent = "Please enter at least one number.";
    return;
  }

  // Accept commas, spaces, new lines and semicolons as separators.
  const parts = input.split(/[\s,;]+/).filter(Boolean);
  const numbers = parts.map(Number);

  if (numbers.some((number) => !Number.isFinite(number))) {
    message.textContent =
      "Invalid input. Please enter numbers only, separated by commas, spaces or new lines.";
    return;
  }

  if (numbers.length === 0) {
    message.textContent = "Please enter at least one valid number.";
    return;
  }

  const sum = numbers.reduce((total, number) => total + number, 0);

  if (!Number.isFinite(sum)) {
    message.textContent =
      "These numbers are too large to calculate safely. Please try smaller numbers.";
    return;
  }

  const average = sum / numbers.length;
  const smallest = Math.min(...numbers);
  const largest = Math.max(...numbers);

  averageValue.textContent = formatNumber(average);
  sumValue.textContent = formatNumber(sum);
  countValue.textContent = numbers.length.toLocaleString("en-US");

  rangeValue.textContent =
    `Smallest number: ${formatNumber(smallest)} | Largest number: ${formatNumber(largest)}`;

  result.hidden = false;
});

averageForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;
});
