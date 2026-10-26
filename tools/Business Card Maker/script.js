
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cardForm");
  const businessCard = document.getElementById("businessCard");

  const fields = {
    personName: document.getElementById("personName"),
    jobTitle: document.getElementById("jobTitle"),
    companyName: document.getElementById("companyName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    website: document.getElementById("website"),
    address: document.getElementById("address"),
    template: document.getElementById("template"),
    accentColor: document.getElementById("accentColor")
  };

  const preview = {
    name: document.getElementById("previewName"),
    job: document.getElementById("previewJob"),
    company: document.getElementById("previewCompany"),
    email: document.getElementById("previewEmail"),
    phone: document.getElementById("previewPhone"),
    website: document.getElementById("previewWebsite"),
    address: document.getElementById("previewAddress"),
    colorValue: document.getElementById("colorValue")
  };

  const printBtn = document.getElementById("printBtn");
  const resetBtn = document.getElementById("resetBtn");

  const defaults = {
    personName: "",
    jobTitle: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    template: "classic",
    accentColor: "#3977f6"
  };

  function getValue(field) {
    return fields[field].value.trim();
  }

  function setPreviewText(element, value, fallback) {
    element.textContent = value || fallback;
  }

  function formatWebsite(value) {
    if (!value) return "";

    // Display the website as entered without adding a protocol.
    return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  function updatePreview() {
    const name = getValue("personName");
    const job = getValue("jobTitle");
    const company = getValue("companyName");
    const email = getValue("email");
    const phone = getValue("phone");
    const website = formatWebsite(getValue("website"));
    const address = getValue("address");
    const template = fields.template.value;
    const accent = fields.accentColor.value;

    setPreviewText(preview.name, name, "Your Name");
    setPreviewText(preview.job, job, "Your Profession");
    setPreviewText(preview.company, company, "YOUR BUSINESS");

    setPreviewText(
      preview.email,
      email ? `✉ ${email}` : "",
      "✉ your@email.com"
    );

    setPreviewText(
      preview.phone,
      phone ? `☎ ${phone}` : "",
      "☎ +91 00000 00000"
    );

    setPreviewText(
      preview.website,
      website ? `🌐 ${website}` : "",
      "🌐 www.example.com"
    );

    setPreviewText(
      preview.address,
      address ? `⌖ ${address}` : "",
      "⌖ Your City"
    );

    // Apply the selected design.
    businessCard.classList.remove(
      "classic",
      "dark",
      "green",
      "minimal"
    );
    businessCard.classList.add(template);

    // Keep the accent color customizable in every template.
    businessCard.style.setProperty("--accent", accent);
    preview.colorValue.textContent = accent.toUpperCase();

    // Set the native color input's accessible label.
    fields.accentColor.setAttribute(
      "aria-label",
      `Accent color ${accent.toUpperCase()}`
    );
  }

  // Update the card as the user types or changes a setting.
  Object.values(fields).forEach((field) => {
    field.addEventListener("input", updatePreview);
    field.addEventListener("change", updatePreview);
  });

  // Open the browser's print dialog.
  printBtn.addEventListener("click", () => {
    if (!getValue("personName")) {
      fields.personName.focus();
      fields.personName.setCustomValidity("Please enter your full name.");
      fields.personName.reportValidity();
      return;
    }

    fields.personName.setCustomValidity("");
    window.print();
  });

  fields.personName.addEventListener("input", () => {
    fields.personName.setCustomValidity("");
  });

  // Restore the initial form values and preview.
  resetBtn.addEventListener("click", () => {
    Object.entries(defaults).forEach(([key, value]) => {
      fields[key].value = value;
    });

    fields.personName.setCustomValidity("");
    updatePreview();
  });

  // Prevent accidental full-page form submission.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  updatePreview();
});
