
const loanForm = document.getElementById("loanForm");
const loanAmountInput = document.getElementById("loanAmount");
const interestRateInput = document.getElementById("interestRate");
const loanTenureInput = document.getElementById("loanTenure");

const message = document.getElementById("message");
const result = document.getElementById("result");

const monthlyPaymentElement = document.getElementById("monthlyPayment");
const totalInterestElement = document.getElementById("totalInterest");
const totalPaymentElement = document.getElementById("totalPayment");
const paymentCountElement = document.getElementById("paymentCount");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

loanForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  const amountText = loanAmountInput.value.trim();
  const rateText = interestRateInput.value.trim();
  const tenureText = loanTenureInput.value.trim();

  if (!amountText || !rateText || !tenureText) {
    message.textContent = "Please fill in all three fields.";
    return;
  }

  const principal = Number(amountText);
  const annualRate = Number(rateText);
  const tenureYears = Number(tenureText);

  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(tenureYears) ||
    principal <= 0 ||
    annualRate < 0 ||
    tenureYears <= 0
  ) {
    message.textContent =
      "Enter a loan amount above zero, a non-negative interest rate, and a tenure above zero.";
    return;
  }

  const rawMonths = tenureYears * 12;

  if (!Number.isFinite(rawMonths) || rawMonths > 1200) {
    message.textContent = "Please enter a loan tenure of 100 years or less.";
    return;
  }

  const months = Math.round(rawMonths);

  if (months < 1) {
    message.textContent = "Loan tenure must be at least one month.";
    return;
  }

  const monthlyRate = annualRate / 12 / 100;
  let monthlyPayment;

  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);

    monthlyPayment =
      principal * monthlyRate * factor / (factor - 1);
  }

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  if (
    !Number.isFinite(monthlyPayment) ||
    !Number.isFinite(totalPayment) ||
    !Number.isFinite(totalInterest)
  ) {
    message.textContent =
      "These values are too large to calculate. Please try smaller values.";
    return;
  }

  monthlyPaymentElement.textContent = formatCurrency(monthlyPayment);
  totalInterestElement.textContent = formatCurrency(
    Math.max(0, totalInterest)
  );
  totalPaymentElement.textContent = formatCurrency(totalPayment);
  paymentCountElement.textContent = months.toLocaleString("en-IN");

  result.hidden = false;
});

loanForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;
});
