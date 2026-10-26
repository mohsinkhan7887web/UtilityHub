
const interestForm = document.getElementById("interestForm");
const interestTypeInput = document.getElementById("interestType");
const principalInput = document.getElementById("principal");
const annualRateInput = document.getElementById("annualRate");
const timePeriodInput = document.getElementById("timePeriod");
const frequencyInput = document.getElementById("frequency");
const frequencyField = document.getElementById("frequencyField");

const message = document.getElementById("message");
const result = document.getElementById("result");

const finalAmountElement = document.getElementById("finalAmount");
const totalInterestElement = document.getElementById("totalInterest");
const principalResultElement = document.getElementById("principalResult");
const typeResultElement = document.getElementById("typeResult");

const interestPercentageElement = document.getElementById("interestPercentage");
const principalBar = document.getElementById("principalBar");
const interestBar = document.getElementById("interestBar");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateInterestType() {
  const isCompound = interestTypeInput.value === "compound";
  frequencyField.hidden = !isCompound;
  frequencyInput.required = isCompound;
}

interestTypeInput.addEventListener("change", updateInterestType);
updateInterestType();

interestForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  const principalText = principalInput.value.trim();
  const rateText = annualRateInput.value.trim();
  const timeText = timePeriodInput.value.trim();

  if (!principalText || !rateText || !timeText) {
    message.textContent = "Please fill in all required fields.";
    return;
  }

  const principal = Number(principalText);
  const annualRate = Number(rateText);
  const years = Number(timeText);
  const frequency = Number(frequencyInput.value);
  const type = interestTypeInput.value;

  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(years) ||
    principal <= 0 ||
    annualRate < 0 ||
    annualRate > 1000 ||
    years <= 0 ||
    years > 1000
  ) {
    message.textContent =
      "Enter a principal above zero, a rate from 0% to 1000%, and a period above zero up to 1000 years.";
    return;
  }

  let finalAmount;

  if (type === "simple") {
    finalAmount = principal * (1 + (annualRate / 100) * years);
  } else {
    if (!Number.isFinite(frequency) || frequency <= 0) {
      message.textContent = "Please select a valid compounding frequency.";
      return;
    }

    const totalPeriods = frequency * years;

    if (!Number.isFinite(totalPeriods) || totalPeriods > 1000000) {
      message.textContent = "These values are too large to calculate.";
      return;
    }

    finalAmount = principal * Math.pow(
      1 + annualRate / 100 / frequency,
      totalPeriods
    );
  }

  const totalInterest = finalAmount - principal;

  if (
    !Number.isFinite(finalAmount) ||
    !Number.isFinite(totalInterest) ||
    finalAmount <= 0
  ) {
    message.textContent =
      "These values are too large to calculate. Please try smaller values.";
    return;
  }

  const safeInterest = Math.max(0, totalInterest);
  const total = principal + safeInterest;
  const principalPercent = (principal / total) * 100;
  const interestPercent = 100 - principalPercent;

  finalAmountElement.textContent = formatCurrency(finalAmount);
  totalInterestElement.textContent = formatCurrency(safeInterest);
  principalResultElement.textContent = formatCurrency(principal);

  typeResultElement.textContent =
    type === "simple" ? "Simple Interest" : "Compound Interest";

  interestPercentageElement.textContent =
    interestPercent.toFixed(1) + "%";

  principalBar.style.width = principalPercent + "%";
  interestBar.style.width = interestPercent + "%";

  result.hidden = false;
});

interestForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;

  principalBar.style.width = "50%";
  interestBar.style.width = "50%";
  interestPercentageElement.textContent = "0%";

  requestAnimationFrame(updateInterestType);
});
