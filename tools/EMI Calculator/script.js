
const emiForm = document.getElementById("emiForm");

const loanAmountInput = document.getElementById("loanAmount");
const interestRateInput = document.getElementById("interestRate");
const loanTenureInput = document.getElementById("loanTenure");

const message = document.getElementById("message");
const result = document.getElementById("result");

const monthlyEmiElement = document.getElementById("monthlyEmi");
const totalInterestElement = document.getElementById("totalInterest");
const totalPaymentElement = document.getElementById("totalPayment");
const numberOfPaymentsElement = document.getElementById("numberOfPayments");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

emiForm.addEventListener("submit", function (event) {
  event.preventDefault();

  message.textContent = "";
  result.hidden = true;

  if (
    loanAmountInput.value.trim() === "" ||
    interestRateInput.value.trim() === "" ||
    loanTenureInput.value.trim() === ""
  ) {
    message.textContent = "Please fill in all three fields.";
    return;
  }

  const principal = Number(loanAmountInput.value);
  const annualRate = Number(interestRateInput.value);
  const tenureYears = Number(loanTenureInput.value);

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
    message.textContent =
      "Please enter a loan tenure of 100 years or less.";
    return;
  }

  // Convert the entered tenure into whole monthly instalments.
  const months = Math.round(rawMonths);

  if (months < 1) {
    message.textContent =
      "Loan tenure must be at least one month.";
    return;
  }

  const monthlyRate = annualRate / 12 / 100;
  let emi;

  if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);

    emi = principal * monthlyRate * factor / (factor - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  if (
    !Number.isFinite(emi) ||
    !Number.isFinite(totalPayment) ||
    !Number.isFinite(totalInterest)
  ) {
    message.textContent =
      "These values are too large to calculate. Please try a smaller loan amount or interest rate.";
    return;
  }

  monthlyEmiElement.textContent = formatCurrency(emi);
  totalInterestElement.textContent = formatCurrency(
    Math.max(0, totalInterest)
  );
  totalPaymentElement.textContent = formatCurrency(totalPayment);
  numberOfPaymentsElement.textContent =
    months.toLocaleString("en-IN");

  result.hidden = false;
});

emiForm.addEventListener("reset", function () {
  message.textContent = "";
  result.hidden = true;
});
