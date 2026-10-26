
const subjectsContainer = document.getElementById("subjectsContainer");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const subjectCount = document.getElementById("subjectCount");
const examName = document.getElementById("examName");
const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");

const resultExam = document.getElementById("resultExam");
const percentageValue = document.getElementById("percentageValue");
const totalObtained = document.getElementById("totalObtained");
const totalMaximum = document.getElementById("totalMaximum");

const MAX_SUBJECTS = 30;

function getSubjectRows() {
  return Array.from(
    subjectsContainer.querySelectorAll(".subject-row")
  );
}

function updateSubjectCount() {
  const rows = getSubjectRows();

  subjectCount.textContent =
    `${rows.length} subject${rows.length === 1 ? "" : "s"}`;

  rows.forEach((row) => {
    row.querySelector(".remove-btn").disabled = rows.length === 1;
  });

  addSubjectBtn.disabled = rows.length >= MAX_SUBJECTS;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideResults() {
  resultSection.hidden = true;
}

function addSubjectRow() {
  if (getSubjectRows().length >= MAX_SUBJECTS) {
    showError(`You can add a maximum of ${MAX_SUBJECTS} subjects.`);
    return;
  }

  const row = document.createElement("div");
  row.className = "subject-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "subject-name";
  nameInput.placeholder = "e.g. Economics";
  nameInput.setAttribute("aria-label", "Subject name");

  const obtainedInput = document.createElement("input");
  obtainedInput.type = "number";
  obtainedInput.className = "obtained-marks";
  obtainedInput.min = "0";
  obtainedInput.step = "any";
  obtainedInput.placeholder = "75";
  obtainedInput.setAttribute("aria-label", "Marks obtained");

  const maximumInput = document.createElement("input");
  maximumInput.type = "number";
  maximumInput.className = "maximum-marks";
  maximumInput.min = "0.01";
  maximumInput.step = "any";
  maximumInput.placeholder = "100";
  maximumInput.setAttribute("aria-label", "Maximum marks");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-btn";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "Remove subject");

  row.append(
    nameInput,
    obtainedInput,
    maximumInput,
    removeButton
  );

  subjectsContainer.appendChild(row);

  updateSubjectCount();
  clearError();
  hideResults();
  nameInput.focus();
}

addSubjectBtn.addEventListener("click", addSubjectRow);

subjectsContainer.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-btn");

  if (!removeButton || removeButton.disabled) {
    return;
  }

  removeButton.closest(".subject-row").remove();

  updateSubjectCount();
  clearError();
  hideResults();
});

subjectsContainer.addEventListener("input", () => {
  clearError();
  hideResults();
});

examName.addEventListener("input", () => {
  clearError();
  hideResults();
});

calculateBtn.addEventListener("click", () => {
  clearError();

  const rows = getSubjectRows();
  let obtainedSum = 0;
  let maximumSum = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const name = row.querySelector(".subject-name").value.trim();
    const obtainedField = row.querySelector(".obtained-marks");
    const maximumField = row.querySelector(".maximum-marks");

    const obtainedText = obtainedField.value.trim();
    const maximumText = maximumField.value.trim();

    if (!name || obtainedText === "" || maximumText === "") {
      showError(
        `Please complete the subject name, obtained marks and maximum marks in row ${i + 1}.`
      );
      hideResults();
      return;
    }

    const obtained = Number(obtainedText);
    const maximum = Number(maximumText);

    if (
      !Number.isFinite(maximum) ||
      maximum <= 0 ||
      !Number.isFinite(obtained) ||
      obtained < 0
    ) {
      showError(
        `Row ${i + 1}: Marks must be valid numbers, and maximum marks must be greater than zero.`
      );
      hideResults();
      return;
    }

    if (obtained > maximum) {
      showError(
        `Row ${i + 1}: Obtained marks cannot exceed maximum marks.`
      );
      hideResults();
      obtainedField.focus();
      return;
    }

    obtainedSum += obtained;
    maximumSum += maximum;
  }

  if (maximumSum <= 0) {
    showError("Please enter valid marks before calculating.");
    hideResults();
    return;
  }

  const percentage = (obtainedSum / maximumSum) * 100;
  const exam = examName.value.trim();

  percentageValue.textContent = percentage.toFixed(2);
  totalObtained.textContent = Number(obtainedSum.toFixed(4)).toString();
  totalMaximum.textContent = Number(maximumSum.toFixed(4)).toString();

  resultExam.textContent = exam
    ? exam.toUpperCase() + " RESULT"
    : "YOUR EXAM RESULT";

  resultSection.hidden = false;

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

resetBtn.addEventListener("click", () => {
  subjectsContainer.innerHTML = `
    <div class="subject-row">
      <input type="text" class="subject-name"
        placeholder="e.g. Accounting" aria-label="Subject name">
      <input type="number" class="obtained-marks"
        min="0" step="any" placeholder="75"
        aria-label="Marks obtained">
      <input type="number" class="maximum-marks"
        min="0.01" step="any" placeholder="100"
        aria-label="Maximum marks">
      <button type="button" class="remove-btn"
        aria-label="Remove subject" disabled>×</button>
    </div>
  `;

  examName.value = "";
  percentageValue.textContent = "0.00";
  totalObtained.textContent = "0";
  totalMaximum.textContent = "0";
  resultExam.textContent = "YOUR EXAM RESULT";

  clearError();
  hideResults();
  updateSubjectCount();
});

updateSubjectCount();
