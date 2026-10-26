
const profitLossForm = document.getElementById("profitLossForm");

const costPriceInput = document.getElementById("costPrice");
const sellingPriceInput = document.getElementById("sellingPrice");

const message = document.getElementById("message");
const result = document.getElementById("result");

const statusBadge = document.getElementById("statusBadge");
const shownCostPrice = document.getElementById("shownCostPrice");
const shownSellingPrice = document.getElementById("shownSellingPrice");
const amountLabel = document.getElementById("amountLabel");
const amountValue = document.getElementById("amountValue");
const percentageLabel = document.getElementById("percentageLabel");
const percentageValue = document.getElementById("percentageValue");
const summaryText = document.getElementById("summaryText");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPercentage(value) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 4
  }) + "%";
}

profitLossForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  if (
    costPriceInput.value.trim() === "" ||
    sellingPriceInput.value.trim() === ""
  ) {
    message.textContent = "Please enter both the cost price and selling price.";
    return;
  }

  const costPrice = Number(costPriceInput.value);
  const sellingPrice = Number(sellingPriceInput.value);

  if (
    !Number.isFinite(costPrice) ||
    !Number.isFinite(sellingPrice) ||
    costPrice < 0 ||
    sellingPrice < 0
  ) {
    message.textContent = "Please enter valid prices of zero or more.";
    return;
  }

  if (!Number.isFinite(sellingPrice - costPrice)) {
    message.textContent = "These prices are too large to calculate safely.";
    return;
  }

  shownCostPrice.textContent = formatCurrency(costPrice);
  shownSellingPrice.textContent = formatCurrency(sellingPrice);

  if (sellingPrice > costPrice) {
    const profit = sellingPrice - costPrice;
    const profitPercent = costPrice > 0
      ? (profit / costPrice) * 100
      : null;

    statusBadge.textContent = "Profit";
    statusBadge.style.color = "#166534";
    statusBadge.style.backgroundColor = "#dcfce7";

    amountLabel.textContent = "Profit Amount";
    amountValue.textContent = formatCurrency(profit);
    percentageLabel.textContent = "Profit Percentage";
    percentageValue.textContent = profitPercent === null
      ? "N/A"
      : formatPercentage(profitPercent);

    summaryText.textContent = costPrice === 0
      ? "The selling price is higher than zero cost. Profit percentage is undefined because the cost price is zero."
      : `You made a profit of ${formatCurrency(profit)}.`;
  } else if (sellingPrice < costPrice) {
    const loss = costPrice - sellingPrice;
    const lossPercent = costPrice > 0
      ? (loss / costPrice) * 100
      : null;

    statusBadge.textContent = "Loss";
    statusBadge.style.color = "#991b1b";
    statusBadge.style.backgroundColor = "#fee2e2";

    amountLabel.textContent = "Loss Amount";
    amountValue.textContent = formatCurrency(loss);
    percentageLabel.textContent = "Loss Percentage";
    percentageValue.textContent = lossPercent === null
      ? "N/A"
      : formatPercentage(lossPercent);

    summaryText.textContent = `You made a loss of ${formatCurrency(loss)}.`;
  } else {
    statusBadge.textContent = "No Profit, No Loss";
    statusBadge.style.color = "#1e40af";
    statusBadge.style.backgroundColor = "#dbeafe";

    amountLabel.textContent = "Profit / Loss Amount";
    amountValue.textContent = formatCurrency(0);
    percentageLabel.textContent = "Profit / Loss Percentage";
    percentageValue.textContent = "0%";

    summaryText.textContent = "Your selling price equals your cost price.";
  }

  result.hidden = false;
});

profitLossForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;
});
