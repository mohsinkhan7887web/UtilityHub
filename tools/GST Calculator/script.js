
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("gstForm");
  const amountInput = document.getElementById("amount");
  const rateSelect = document.getElementById("gstRate");
  const customRateField = document.getElementById("customRateField");
  const customRateInput = document.getElementById("customRate");
  const modeSelect = document.getElementById("mode");
  const errorMessage = document.getElementById("errorMessage");
  const results = document.getElementById("results");

  const finalLabel = document.getElementById("finalLabel");
  const finalAmount = document.getElementById("finalAmount");
  const baseLabel = document.getElementById("baseLabel");
  const baseAmount = document.getElementById("baseAmount");
  const gstAmount = document.getElementById("gstAmount");
  const resultRate = document.getElementById("resultRate");
  const taxLabel = document.getElementById("taxLabel");
  const taxTreatment = document.getElementById("taxTreatment");

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function formatCurrency(value) {
    return currency.format(value);
  }

  function getGstRate() {
    if (rateSelect.value === "custom") {
      return Number(customRateInput.value);
    }

    return Number(rateSelect.value);
  }

  function updateCustomRateField() {
    const isCustom = rateSelect.value === "custom";

    customRateField.hidden = !isCustom;
    customRateInput.required = isCustom;

    if (!isCustom) {
      customRateInput.setCustomValidity("");
    }

    errorMessage.textContent = "";
  }

  function showError(message) {
    errorMessage.textContent = message;
    results.hidden = true;
  }

  rateSelect.addEventListener("change", updateCustomRateField);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const amount = Number(amountInput.value);
    const rate = getGstRate();
    const mode = modeSelect.value;

    if (
      amountInput.value.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      showError("Please enter an amount greater than zero.");
      amountInput.focus();
      return;
    }

    if (
      rateSelect.value === "custom" &&
      customRateInput.value.trim() === ""
    ) {
      showError("Please enter a custom GST rate.");
      customRateInput.focus();
      return;
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      showError("GST rate must be between 0% and 100%.");
      return;
    }

    if (mode !== "add" && mode !== "remove") {
      showError("Please select a valid calculation mode.");
      return;
    }

    let base;
    let tax;
    let total;

    if (mode === "add") {
      // Amount is before GST.
      base = amount;
      tax = base * (rate / 100);
      total = base + tax;

      finalLabel.textContent = "Final Amount (Including GST)";
      baseLabel.textContent = "Amount Before GST";
      taxLabel.textContent = "Tax treatment";
      taxTreatment.textContent = "GST added";
      document.getElementById("resultTitle").textContent =
        "GST Calculation Results";
    } else {
      // Amount already includes GST.
      total = amount;
      base = total / (1 + rate / 100);
      tax = total - base;

      finalLabel.textContent = "Amount Before GST";
      baseLabel.textContent = "Original Amount Before GST";
      taxLabel.textContent = "Tax treatment";
      taxTreatment.textContent = "GST included";
      document.getElementById("resultTitle").textContent =
        "GST Removal Results";
    }

    if (
      !Number.isFinite(base) ||
      !Number.isFinite(tax) ||
      !Number.isFinite(total)
    ) {
      showError("The result is too large to calculate. Try a smaller amount.");
      return;
    }

    finalAmount.textContent = formatCurrency(
      mode === "add" ? total : base
    );
    baseAmount.textContent = formatCurrency(base);
    gstAmount.textContent = formatCurrency(tax);
    resultRate.textContent = `${rate}%`;

    results.hidden = false;
  });

  form.addEventListener("reset", () => {
    errorMessage.textContent = "";
    results.hidden = true;

    // Allow the browser to reset the fields before updating the UI.
    window.setTimeout(() => {
      updateCustomRateField();
    }, 0);
  });

  updateCustomRateField();
});
