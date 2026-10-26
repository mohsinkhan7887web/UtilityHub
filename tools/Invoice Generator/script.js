
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const form = $("invoiceForm");
  const itemsContainer = $("itemsContainer");
  const addItemBtn = $("addItemBtn");
  const printBtn = $("printBtn");
  const clearBtn = $("clearBtn");

  const fields = [
    "invoiceNumber",
    "invoiceDate",
    "dueDate",
    "currency",
    "sellerName",
    "sellerAddress",
    "sellerEmail",
    "sellerPhone",
    "customerName",
    "customerAddress",
    "customerEmail",
    "taxRate",
    "invoiceNotes"
  ];

  const currencyLocales = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "de-DE"
  };

  let nextItemId = 1;

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function makeInvoiceNumber() {
    const date = localDateString().replaceAll("-", "");
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    return `INV-${date}-${suffix}`;
  }

  function getCurrency() {
    return $("currency").value || "INR";
  }

  function money(amount) {
    const currency = getCurrency();

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

  function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
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
    const itemId = nextItemId++;
    const row = document.createElement("div");

    row.className = "item-row";
    row.dataset.itemId = String(itemId);

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
    quantityInput.setAttribute("aria-label", "Quantity");
    quantityInput.required = true;

    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.className = "item-price";
    priceInput.min = "0";
    priceInput.max = "1000000000";
    priceInput.step = "any";
    priceInput.value = String(price);
    priceInput.setAttribute("aria-label", "Unit price");
    priceInput.required = true;

    const amount = document.createElement("span");
    amount.className = "item-amount";
    amount.textContent = money(0);
    amount.setAttribute("aria-label", "Line total");

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-item";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove item";
    removeBtn.setAttribute("aria-label", "Remove this item");

    row.append(
      descriptionInput,
      quantityInput,
      priceInput,
      amount,
      removeBtn
    );

    itemsContainer.appendChild(row);
    updateInvoice();

    return row;
  }

  function readItems() {
    return Array.from(itemsContainer.querySelectorAll(".item-row")).map((row) => {
      const quantityInput = row.querySelector(".item-quantity");
      const priceInput = row.querySelector(".item-price");

      const rawQuantity = quantityInput.value;
      const rawPrice = priceInput.value;

      const quantity = Math.min(
        Math.max(safeNumber(rawQuantity), 0),
        1000000000
      );

      const price = Math.min(
        Math.max(safeNumber(rawPrice), 0),
        1000000000
      );

      return {
        description: row.querySelector(".item-description").value.trim(),
        quantity,
        price,
        rawQuantity,
        rawPrice,
        total: quantity * price,
        row
      };
    });
  }

  function updateInvoice() {
    const items = readItems();

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    const taxInput = $("taxRate");
    const enteredTaxRate = safeNumber(taxInput.value);
    const taxRate = Math.min(Math.max(enteredTaxRate, 0), 100);
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax;

    items.forEach((item) => {
      const amount = item.row.querySelector(".item-amount");
      amount.textContent = money(item.total);
    });

    setText("previewSeller", $("sellerName").value.trim(), "Your Business");
    setText(
      "previewSellerAddress",
      $("sellerAddress").value.trim(),
      "Business address"
    );

    const sellerContact = [
      $("sellerEmail").value.trim(),
      $("sellerPhone").value.trim()
    ].filter(Boolean).join(" · ");

    setText("previewSellerContact", sellerContact);

    setText(
      "previewCustomer",
      $("customerName").value.trim(),
      "Customer Name"
    );

    setText(
      "previewCustomerAddress",
      $("customerAddress").value.trim()
    );

    setText(
      "previewCustomerEmail",
      $("customerEmail").value.trim()
    );

    setText(
      "previewNumber",
      $("invoiceNumber").value.trim(),
      "INV-001"
    );

    setText("previewDate", formatDate($("invoiceDate").value));
    setText("previewDueDate", formatDate($("dueDate").value));

    setText("previewTaxRate", String(taxRate));

    const previewItems = $("previewItems");
    previewItems.replaceChildren();

    items.forEach((item) => {
      const tr = document.createElement("tr");

      const descriptionCell = document.createElement("td");
      descriptionCell.textContent = item.description || "Item";

      const quantityCell = document.createElement("td");
      quantityCell.textContent = String(item.quantity);

      const priceCell = document.createElement("td");
      priceCell.textContent = money(item.price);

      const totalCell = document.createElement("td");
      totalCell.textContent = money(item.total);

      tr.append(
        descriptionCell,
        quantityCell,
        priceCell,
        totalCell
      );

      previewItems.appendChild(tr);
    });

    setText("previewSubtotal", money(subtotal));
    setText("previewTax", money(tax));
    setText("previewTotal", money(total));

    setText(
      "previewNotes",
      $("invoiceNotes").value.trim(),
      "Thank you for your business!"
    );
  }

  function validateInvoice() {
    if (!form.reportValidity()) {
      return false;
    }

    const rows = Array.from(itemsContainer.querySelectorAll(".item-row"));

    if (rows.length === 0) {
      alert("Please add at least one invoice item.");
      return false;
    }

    for (const row of rows) {
      const description = row.querySelector(".item-description").value.trim();
      const quantityInput = row.querySelector(".item-quantity");
      const priceInput = row.querySelector(".item-price");

      const quantity = Number(quantityInput.value);
      const price = Number(priceInput.value);

      if (!description) {
        alert("Please enter a description for every invoice item.");
        row.querySelector(".item-description").focus();
        return false;
      }

      if (
        quantityInput.value.trim() === "" ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > 1000000000
      ) {
        alert("Each item must have a valid quantity greater than zero.");
        quantityInput.focus();
        return false;
      }

      if (
        priceInput.value.trim() === "" ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 1000000000
      ) {
        alert("Please enter a valid, non-negative price for every item.");
        priceInput.focus();
        return false;
      }
    }

    const taxRate = Number($("taxRate").value);

    if (
      $("taxRate").value.trim() === "" ||
      !Number.isFinite(taxRate) ||
      taxRate < 0 ||
      taxRate > 100
    ) {
      alert("Tax rate must be between 0% and 100%.");
      $("taxRate").focus();
      return false;
    }

    const invoiceDate = $("invoiceDate").value;
    const dueDate = $("dueDate").value;

    if (invoiceDate && dueDate && dueDate < invoiceDate) {
      alert("Due date should not be earlier than the invoice date.");
      $("dueDate").focus();
      return false;
    }

    return true;
  }

  function clearInvoice() {
    const confirmed = window.confirm(
      "Clear all invoice details and start a new invoice?"
    );

    if (!confirmed) return;

    form.reset();
    itemsContainer.replaceChildren();

    $("invoiceNumber").value = makeInvoiceNumber();
    $("invoiceDate").value = localDateString();
    $("dueDate").value = "";
    $("currency").value = "INR";
    $("taxRate").value = "0";

    nextItemId = 1;
    createItem("", 1, 0);
    updateInvoice();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  addItemBtn.addEventListener("click", () => {
    const row = createItem("", 1, 0);
    row.querySelector(".item-description").focus();
  });

  itemsContainer.addEventListener("input", updateInvoice);

  itemsContainer.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-item");

    if (!removeBtn) return;

    const rows = itemsContainer.querySelectorAll(".item-row");

    if (rows.length <= 1) {
      alert("An invoice must have at least one item.");
      return;
    }

    removeBtn.closest(".item-row").remove();
    updateInvoice();
  });

  fields.forEach((id) => {
    $(id).addEventListener("input", updateInvoice);
    $(id).addEventListener("change", updateInvoice);
  });

  printBtn.addEventListener("click", () => {
    if (!validateInvoice()) return;

    updateInvoice();
    window.print();
  });

  clearBtn.addEventListener("click", clearInvoice);

  $("invoiceNumber").value = makeInvoiceNumber();
  $("invoiceDate").value = localDateString();
  $("dueDate").value = "";
  $("taxRate").value = "0";

  createItem("", 1, 0);
  updateInvoice();
});
