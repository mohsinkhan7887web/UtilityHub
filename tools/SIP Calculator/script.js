
const sipForm = document.getElementById("sipForm");

const monthlyInvestmentInput = document.getElementById("monthlyInvestment");
const annualReturnInput = document.getElementById("annualReturn");
const investmentYearsInput = document.getElementById("investmentYears");

const message = document.getElementById("message");
const result = document.getElementById("result");

const futureValueElement = document.getElementById("futureValue");
const totalInvestedElement = document.getElementById("totalInvested");
const estimatedReturnsElement = document.getElementById("estimatedReturns");
const paymentCountElement = document.getElementById("paymentCount");

const investedPercentageElement = document.getElementById("investedPercentage");
const investedBar = document.getElementById("investedBar");
const returnsBar = document.getElementById("returnsBar");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

sipForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  const monthlyText = monthlyInvestmentInput.value.trim();
  const returnText = annualReturnInput.value.trim();
  const yearsText = investmentYearsInput.value.trim();

  if (!monthlyText || !returnText || !yearsText) {
    message.textContent = "Please fill in all three fields.";
    return;
  }

  const monthlyInvestment = Number(monthlyText);
  const annualReturn = Number(returnText);
  const investmentYears = Number(yearsText);

  if (
    !Number.isFinite(monthlyInvestment) ||
    !Number.isFinite(annualReturn) ||
    !Number.isFinite(investmentYears) ||
    monthlyInvestment <= 0 ||
    annualReturn < 0 ||
    annualReturn > 100 ||
    investmentYears <= 0 ||
    investmentYears > 100
  ) {
    message.textContent =
      "Enter a monthly investment above zero, a return rate from 0% to 100%, and a period above zero up to 100 years.";
    return;
  }

  const rawMonths = investmentYears * 12;

  if (!Number.isFinite(rawMonths) || rawMonths > 1200) {
    message.textContent = "Please enter an investment period of 100 years or less.";
    return;
  }

  const months = Math.round(rawMonths);

  if (months < 1) {
    message.textContent = "Investment period must be at least one month.";
    return;
  }

  const totalInvested = monthlyInvestment * months;
  const monthlyRate = annualReturn / 100 / 12;

  let futureValue;

  if (monthlyRate === 0) {
    futureValue = totalInvested;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);

    // Assumes each monthly investment is made at the end of the month.
    futureValue = monthlyInvestment * (factor - 1) / monthlyRate;
  }

  const estimatedReturns = futureValue - totalInvested;

  if (
    !Number.isFinite(totalInvested) ||
    !Number.isFinite(futureValue) ||
    !Number.isFinite(estimatedReturns)
  ) {
    message.textContent =
      "These values are too large to calculate. Please try smaller values.";
    return;
  }

  const safeReturns = Math.max(0, estimatedReturns);
  const totalValue = totalInvested + safeReturns;

  const investedPercent =
    totalValue > 0 ? (totalInvested / totalValue) * 100 : 100;

  const returnsPercent = 100 - investedPercent;

  futureValueElement.textContent = formatCurrency(futureValue);
  totalInvestedElement.textContent = formatCurrency(totalInvested);
  estimatedReturnsElement.textContent = formatCurrency(safeReturns);
  paymentCountElement.textContent = months.toLocaleString("en-IN");

  investedPercentageElement.textContent =
    investedPercent.toFixed(1) + "%";

  investedBar.style.width = investedPercent + "%";
  returnsBar.style.width = returnsPercent + "%";

  result.hidden = false;
});

sipForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;

  investedBar.style.width = "50%";
  returnsBar.style.width = "50%";
  investedPercentageElement.textContent = "0%";
});
