
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const formFields = [
    "receiptNumber",
    "receiptDate",
    "currency",
    "paymentMethod",
    "businessName",
    "businessAddress",
    "businessEmail",
    "businessPhone",
    "customerName",
    "customerAddress",
    "discount",
    "taxRate",
    "paymentStatus",
    "amountPaid",
    "paymentReference",
    "receiptNotes"
  ];

  const currencyLocales = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "de-DE"
  };

  const itemsContainer = $("itemsContainer");
  const addItemBtn = $("addItemBtn");
  const printBtn = $("printBtn");
  const clearBtn = $("clearBtn");

  let nextItemId = 1;
  let updatingAmount = false;

  function localDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function makeReceiptNumber() {
    const date = localDateString().replaceAll("-", "");
    const suffix = String(Math.floor(Math.random() * 9000) + 1000);
    return `REC-${date}-${suffix}`;
  }

  function numberValue(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
  }

  function money(amount) {
    const currency = $("currency").value || "INR";

    try {
      return new Intl.NumberFormat(currencyLocales[currency] || "en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number.isFinite(amount) ? amount : 0);
    } catch {
      return `${currency} ${(Number(amount) || 0).toFixed(2)}`;
    }
  }

  function formatDate(value) {
    if (!value) return "—";

    const parts = value.split("-");
    if (parts.length !== 3) return value;

    const date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function setText(id, value, fallback = "") {
    $(id).textContent = value || fallback;
  }

  function createItem(description = "", quantity = 1, price = 0) {
    const row = document.createElement("div");
    row.className = "item-row";
    row.dataset.itemId = String(nextItemId++);

    const descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.className = "item-description";
    descriptionInput.placeholder = "Item description";
    descriptionInput.setAttribute("aria-label", "Item description");
    descriptionInput.maxLength = 200;
    descriptionInput.value = description;

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.className = "item-quantity";
    quantityInput.min = "0.01";
    quantityInput.max = "1000000000";
    quantityInput.step = "any";
    quantityInput.value = String(quantity);
    quantityInput.required = true;
    quantityInput.setAttribute("aria-label", "Quantity");

    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.className = "item-price";
    priceInput.min = "0";
    priceInput.max = "1000000000";
    priceInput.step = "any";
    priceInput.value = String(price);
    priceInput.required = true;
    priceInput.setAttribute("aria-label", "Unit price");

    const amount = document.createElement("span");
    amount.className = "item-amount";
    amount.textContent = money(0);
    amount.setAttribute("aria-label", "Line total");

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-item";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove item";
    removeBtn.setAttribute("aria-label", "Remove item");

    row.append(
      descriptionInput,
      quantityInput,
      priceInput,
      amount,
      removeBtn
    );

    itemsContainer.appendChild(row);
    updateReceipt();

    return row;
  }

  function getItems() {
    return Array.from(itemsContainer.querySelectorAll(".item-row")).map((row) => {
      const quantityInput = row.querySelector(".item-quantity");
      const priceInput = row.querySelector(".item-price");

      const quantity = numberValue(quantityInput.value);
      const price = numberValue(priceInput.value);

      return {
        row,
        description: row.querySelector(".item-description").value.trim(),
        quantity,
        price,
        total: Math.max(0, quantity) * Math.max(0, price)
      };
    });
  }

  function calculateTotals() {
    const items = getItems();

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountInput = $("discount");
    const taxRateInput = $("taxRate");

    const discount = Math.min(
      Math.max(numberValue(discountInput.value), 0),
      subtotal
    );

    const taxRate = Math.min(
      Math.max(numberValue(taxRateInput.value), 0),
      100
    );

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * taxRate / 100;
    const total = taxableAmount + tax;

    return { items, subtotal, discount, taxRate, tax, total };
  }

  function updateReceipt() {
    const totals = calculateTotals();

    totals.items.forEach((item) => {
      item.row.querySelector(".item-amount").textContent = money(item.total);
    });

    setText(
      "previewReceiptNumber",
      $("receiptNumber").value.trim(),
      "REC-001"
    );

    setText(
      "previewBusinessName",
      $("businessName").value.trim(),
      "Your Business"
    );

    setText(
      "previewBusinessAddress",
      $("businessAddress").value.trim(),
      "Business address"
    );

    const businessContact = [
      $("businessEmail").value.trim(),
      $("businessPhone").value.trim()
    ].filter(Boolean).join(" · ");

    setText("previewBusinessContact", businessContact);

    setText(
      "previewCustomerName",
      $("customerName").value.trim(),
      "Customer Name"
    );

    setText(
      "previewCustomerAddress",
      $("customerAddress").value.trim()
    );

    setText("previewDate", formatDate($("receiptDate").value));
    setText("previewMethod", $("paymentMethod").value);

    const status = $("paymentStatus").value;
    setText("previewStatus", status === "Paid" ? "PAID" : "PARTIALLY PAID");

    const previewStatus = $("previewStatus");
    previewStatus.style.color = status === "Paid" ? "#047857" : "#92400e";
    previewStatus.style.background = status === "Paid" ? "#d1fae5" : "#fef3c7";

    const previewItems = $("previewItems");
    previewItems.replaceChildren();

    totals.items.forEach((item) => {
      const tr = document.createElement("tr");

      [
        item.description || "Item",
        String(item.quantity),
        money(item.price),
        money(item.total)
      ].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });

      previewItems.appendChild(tr);
    });

    setText("previewSubtotal", money(totals.subtotal));
    setText("previewDiscount", money(totals.discount));
    setText("previewTaxRate", String(totals.taxRate));
    setText("previewTax", money(totals.tax));
    setText("previewTotal", money(totals.total));

    const amountPaidInput = $("amountPaid");

    if (!updatingAmount && status === "Paid") {
      updatingAmount = true;
      amountPaidInput.value = totals.total.toFixed(2);
      updatingAmount = false;
    }

    const amountPaid = Math.min(
      Math.max(numberValue(amountPaidInput.value), 0),
      totals.total
    );

    const balance = Math.max(0, totals.total - amountPaid);

    setText("previewAmountPaid", money(amountPaid));
    setText("previewBalance", money(balance));

    setText(
      "previewReference",
      $("paymentReference").value.trim(),
      "—"
    );

    setText(
      "previewNotes",
      $("receiptNotes").value.trim(),
      "Thank you for your payment!"
    );
  }

  function validateReceipt() {
    const requiredFields = [
      $("receiptNumber"),
      $("receiptDate"),
      $("businessName"),
      $("customerName")
    ];

    for (const field of requiredFields) {
      if (!field.value.trim()) {
        field.focus();
        alert("Please complete all required receipt details.");
        return false;
      }
    }

    if (itemsContainer.querySelectorAll(".item-row").length === 0) {
      alert("Please add at least one item.");
      return false;
    }

    const items = getItems();

    for (const item of items) {
      const description = item.row.querySelector(".item-description");
      const quantity = item.row.querySelector(".item-quantity");
      const price = item.row.querySelector(".item-price");

      if (!description.value.trim()) {
        description.focus();
        alert("Please enter a description for every item.");
        return false;
      }

      if (
        !quantity.value.trim() ||
        !Number.isFinite(Number(quantity.value)) ||
        Number(quantity.value) <= 0 ||
        Number(quantity.value) > 1000000000
      ) {
        quantity.focus();
        alert("Each item needs a valid quantity greater than zero.");
        return false;
      }

      if (
        !price.value.trim() ||
        !Number.isFinite(Number(price.value)) ||
        Number(price.value) < 0 ||
        Number(price.value) > 1000000000
      ) {
        price.focus();
        alert("Please enter a valid non-negative item price.");
        return false;
      }
    }

    const discountInput = $("discount");
    const discount = Number(discountInput.value);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    if (
      !discountInput.value.trim() ||
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > subtotal
    ) {
      discountInput.focus();
      alert("Discount must be between zero and the subtotal.");
      return false;
    }

    const taxInput = $("taxRate");
    const taxRate = Number(taxInput.value);

    if (
      !taxInput.value.trim() ||
      !Number.isFinite(taxRate) ||
      taxRate < 0 ||
      taxRate > 100
    ) {
      taxInput.focus();
      alert("Tax rate must be between 0% and 100%.");
      return false;
    }

    const totals = calculateTotals();
    const amountInput = $("amountPaid");
    const amountPaid = Number(amountInput.value);

    if (
      !amountInput.value.trim() ||
      !Number.isFinite(amountPaid) ||
      amountPaid < 0 ||
      amountPaid > totals.total
    ) {
      amountInput.focus();
      alert("Amount received must be between zero and the total amount.");
      return false;
    }

    if ($("paymentStatus").value === "Paid" && amountPaid < totals.total) {
      alert("For a fully paid receipt, amount received must equal the total. Choose Partially Paid if a balance remains.");
      amountInput.focus();
      return false;
    }

    if ($("paymentStatus").value === "Partial" && amountPaid >= totals.total) {
      alert("For a partially paid receipt, amount received must be less than the total. Choose Paid in Full if the balance is zero.");
      amountInput.focus();
      return false;
    }

    return true;
  }

  function clearReceipt() {
    const confirmed = window.confirm(
      "Clear all receipt details and start a new receipt?"
    );

    if (!confirmed) return;

    $("receiptNumber").value = makeReceiptNumber();
    $("receiptDate").value = localDateString();
    $("currency").value = "INR";
    $("paymentMethod").value = "Cash";
    $("paymentStatus").value = "Paid";
    $("discount").value = "0";
    $("taxRate").value = "0";
    $("amountPaid").value = "0";

    [
      "businessName",
      "businessAddress",
      "businessEmail",
      "businessPhone",
      "customerName",
      "customerAddress",
      "paymentReference",
      "receiptNotes"
    ].forEach((id) => {
      $(id).value = "";
    });

    itemsContainer.replaceChildren();
    nextItemId = 1;

    createItem("", 1, 0);
    updateReceipt();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  addItemBtn.addEventListener("click", () => {
    const row = createItem("", 1, 0);
    row.querySelector(".item-description").focus();
  });

  itemsContainer.addEventListener("input", updateReceipt);

  itemsContainer.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-item");
    if (!removeBtn) return;

    const rows = itemsContainer.querySelectorAll(".item-row");

    if (rows.length <= 1) {
      alert("A receipt must have at least one item.");
      return;
    }

    removeBtn.closest(".item-row").remove();
    updateReceipt();
  });

  formFields.forEach((id) => {
    $(id).addEventListener("input", updateReceipt);
    $(id).addEventListener("change", updateReceipt);
  });

  $("paymentStatus").addEventListener("change", () => {
    if ($("paymentStatus").value === "Paid") {
      const totals = calculateTotals();
      $("amountPaid").value = totals.total.toFixed(2);
    }

    updateReceipt();
  });

  $("amountPaid").addEventListener("input", () => {
    if ($("paymentStatus").value === "Paid") {
      $("paymentStatus").value = "Partial";
    }

    updateReceipt();
  });

  printBtn.addEventListener("click", () => {
    if (!validateReceipt()) return;

    updateReceipt();
    window.print();
  });

  clearBtn.addEventListener("click", clearReceipt);

  $("receiptNumber").value = makeReceiptNumber();
  $("receiptDate").value = localDateString();
  $("discount").value = "0";
  $("taxRate").value = "0";
  $("amountPaid").value = "0";

  createItem("", 1, 0);
  updateReceipt();
});
