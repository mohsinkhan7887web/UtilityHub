
const discountForm = document.getElementById("discountForm");

const originalPriceInput = document.getElementById("originalPrice");
const discountPercentInput = document.getElementById("discountPercent");

const message = document.getElementById("message");
const result = document.getElementById("result");

const finalPriceElement = document.getElementById("finalPrice");
const savingsElement = document.getElementById("savings");
const shownOriginalPriceElement = document.getElementById("shownOriginalPrice");
const summaryText = document.getElementById("summaryText");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

discountForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  const originalPrice = Number(originalPriceInput.value);
  const discountPercent = Number(discountPercentInput.value);

  if (
    originalPriceInput.value.trim() === "" ||
    discountPercentInput.value.trim() === ""
  ) {
    message.textContent = "Please enter both the original price and discount percentage.";
    return;
  }

  if (!Number.isFinite(originalPrice) || originalPrice < 0) {
    message.textContent = "Please enter a valid price of zero or more.";
    return;
  }

  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    message.textContent = "Discount must be between 0% and 100%.";
    return;
  }

  const savings = originalPrice * discountPercent / 100;
  const finalPrice = originalPrice - savings;

  if (!Number.isFinite(savings) || !Number.isFinite(finalPrice)) {
    message.textContent = "The entered value is too large. Please try a smaller price.";
    return;
  }

  finalPriceElement.textContent = formatCurrency(finalPrice);
  savingsElement.textContent = formatCurrency(savings);
  shownOriginalPriceElement.textContent = formatCurrency(originalPrice);

  summaryText.textContent =
    `You save ${discountPercent}% (${formatCurrency(savings)}) on this purchase.`;

  result.hidden = false;
});

discountForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;
});
