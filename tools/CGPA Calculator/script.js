
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cgpaForm");
  const subjectsContainer = document.getElementById("subjectsContainer");
  const addSubjectBtn = document.getElementById("addSubjectBtn");
  const errorMessage = document.getElementById("errorMessage");
  const results = document.getElementById("results");

  const cgpaValue = document.getElementById("cgpaValue");
  const totalCreditsOutput = document.getElementById("totalCredits");
  const weightedPointsOutput = document.getElementById("weightedPoints");

  const MAX_SUBJECTS = 30;
  let subjectCount = 1;

  function updateSubjectRows() {
    const rows = subjectsContainer.querySelectorAll(".subject-row");
    subjectCount = rows.length;

    rows.forEach((row, index) => {
      const number = index + 1;
      const nameInput = row.querySelector(".subject-name");
      const creditInput = row.querySelector(".subject-credit");
      const gradeInput = row.querySelector(".subject-grade");
      const removeButton = row.querySelector(".remove-btn");
      const mobileLabel = row.querySelector(".mobile-label label");

      nameInput.setAttribute("aria-label", `Subject ${number} name`);
      creditInput.setAttribute("aria-label", `Subject ${number} credits`);
      gradeInput.setAttribute("aria-label", `Subject ${number} grade point`);
      removeButton.setAttribute("aria-label", `Remove subject ${number}`);

      if (mobileLabel) {
        mobileLabel.textContent = `Subject ${number}`;
      }

      removeButton.disabled = rows.length === 1;
    });

    addSubjectBtn.disabled = rows.length >= MAX_SUBJECTS;
    addSubjectBtn.textContent = rows.length >= MAX_SUBJECTS
      ? "Maximum 30 subjects reached"
      : "+ Add Subject";
  }

  function clearResults() {
    results.hidden = true;
    errorMessage.textContent = "";
  }

  function showError(message) {
    results.hidden = true;
    errorMessage.textContent = message;
  }

  function createSubjectRow() {
    const row = document.createElement("div");
    row.className = "subject-row";

    const labelWrap = document.createElement("div");
    labelWrap.className = "mobile-label";

    const label = document.createElement("label");
    label.textContent = "Subject";
    labelWrap.appendChild(label);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "subject-name";
    nameInput.placeholder = "e.g. Economics";
    nameInput.maxLength = 80;

    const creditInput = document.createElement("input");
    creditInput.type = "number";
    creditInput.className = "subject-credit";
    creditInput.placeholder = "Credits";
    creditInput.min = "0.01";
    creditInput.max = "100";
    creditInput.step = "any";
    creditInput.required = true;

    const gradeInput = document.createElement("input");
    gradeInput.type = "number";
    gradeInput.className = "subject-grade";
    gradeInput.placeholder = "Grade point";
    gradeInput.min = "0";
    gradeInput.max = "10";
    gradeInput.step = "any";
    gradeInput.required = true;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-btn";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", "Remove subject");

    row.append(
      labelWrap,
      nameInput,
      creditInput,
      gradeInput,
      removeButton
    );

    return row;
  }

  addSubjectBtn.addEventListener("click", () => {
    if (subjectsContainer.querySelectorAll(".subject-row").length >= MAX_SUBJECTS) {
      showError("You can add a maximum of 30 subjects.");
      return;
    }

    clearResults();
    subjectsContainer.appendChild(createSubjectRow());
    updateSubjectRows();

    const rows = subjectsContainer.querySelectorAll(".subject-row");
    rows[rows.length - 1].querySelector(".subject-name").focus();
  });

  subjectsContainer.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-btn");

    if (!removeButton || removeButton.disabled) {
      return;
    }

    const row = removeButton.closest(".subject-row");
    if (row) {
      row.remove();
      clearResults();
      updateSubjectRows();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const rows = Array.from(
      subjectsContainer.querySelectorAll(".subject-row")
    );

    if (rows.length === 0) {
      showError("Please add at least one subject.");
      return;
    }

    let totalCredits = 0;
    let weightedPoints = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const name = row.querySelector(".subject-name").value.trim();
      const creditInput = row.querySelector(".subject-credit");
      const gradeInput = row.querySelector(".subject-grade");

      const credits = Number(creditInput.value);
      const gradePoint = Number(gradeInput.value);

      if (
        creditInput.value.trim() === "" ||
        !Number.isFinite(credits) ||
        credits <= 0 ||
        credits > 100
      ) {
        showError(`Subject ${index + 1}: enter credits greater than 0 and no more than 100.`);
        creditInput.focus();
        return;
      }

      if (
        gradeInput.value.trim() === "" ||
        !Number.isFinite(gradePoint) ||
        gradePoint < 0 ||
        gradePoint > 10
      ) {
        showError(`Subject ${index + 1}: grade point must be between 0 and 10.`);
        gradeInput.focus();
        return;
      }

      // Subject name is optional, but numeric values are required.
      void name;

      totalCredits += credits;
      weightedPoints += credits * gradePoint;
    }

    if (!Number.isFinite(totalCredits) || totalCredits <= 0 ||
        !Number.isFinite(weightedPoints)) {
      showError("Unable to calculate with these values. Please check your entries.");
      return;
    }

    const cgpa = weightedPoints / totalCredits;

    cgpaValue.textContent = cgpa.toFixed(2);
    totalCreditsOutput.textContent = totalCredits.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
    weightedPointsOutput.textContent = weightedPoints.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

    results.hidden = false;
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      subjectsContainer.innerHTML = "";
      subjectsContainer.appendChild(createSubjectRow());
      updateSubjectRows();
      clearResults();
    }, 0);
  });

  // Hide stale results when any input is edited.
  form.addEventListener("input", (event) => {
    if (event.target.matches("input")) {
      results.hidden = true;
      errorMessage.textContent = "";
    }
  });

  updateSubjectRows();
});
