
const subjectsContainer = document.getElementById("subjectsContainer");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const subjectCount = document.getElementById("subjectCount");
const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");

const semesterName = document.getElementById("semesterName");
const resultSemester = document.getElementById("resultSemester");
const gpaValue = document.getElementById("gpaValue");
const totalCredits = document.getElementById("totalCredits");
const weightedPoints = document.getElementById("weightedPoints");

const MAX_SUBJECTS = 30;

function getSubjectRows() {
  return Array.from(subjectsContainer.querySelectorAll(".subject-row"));
}

function updateSubjectCount() {
  const rows = getSubjectRows();
  subjectCount.textContent =
    `${rows.length} subject${rows.length === 1 ? "" : "s"}`;

  rows.forEach((row) => {
    const removeButton = row.querySelector(".remove-btn");
    removeButton.disabled = rows.length === 1;
  });

  addSubjectBtn.disabled = rows.length >= MAX_SUBJECTS;
}

function hideResults() {
  resultSection.hidden = true;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
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

  const creditsInput = document.createElement("input");
  creditsInput.type = "number";
  creditsInput.className = "subject-credits";
  creditsInput.min = "0.01";
  creditsInput.max = "100";
  creditsInput.step = "any";
  creditsInput.placeholder = "3";
  creditsInput.setAttribute("aria-label", "Subject credits");

  const gradeInput = document.createElement("input");
  gradeInput.type = "number";
  gradeInput.className = "subject-grade";
  gradeInput.min = "0";
  gradeInput.max = "10";
  gradeInput.step = "any";
  gradeInput.placeholder = "9";
  gradeInput.setAttribute("aria-label", "Grade point");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-btn";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "Remove subject");

  row.append(nameInput, creditsInput, gradeInput, removeButton);
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

semesterName.addEventListener("input", () => {
  clearError();
  hideResults();
});

calculateBtn.addEventListener("click", () => {
  clearError();

  const rows = getSubjectRows();
  let creditSum = 0;
  let weightedSum = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.querySelector(".subject-name").value.trim();
    const creditsField = row.querySelector(".subject-credits");
    const gradeField = row.querySelector(".subject-grade");

    const creditsText = creditsField.value.trim();
    const gradeText = gradeField.value.trim();

    if (!name || creditsText === "" || gradeText === "") {
      showError(`Please complete the subject name, credits and grade point in row ${i + 1}.`);
      hideResults();
      return;
    }

    const credits = Number(creditsText);
    const grade = Number(gradeText);

    if (!Number.isFinite(credits) || credits <= 0 || credits > 100) {
      showError(`Row ${i + 1}: Credits must be greater than 0 and no more than 100.`);
      hideResults();
      creditsField.focus();
      return;
    }

    if (!Number.isFinite(grade) || grade < 0 || grade > 10) {
      showError(`Row ${i + 1}: Grade point must be between 0 and 10.`);
      hideResults();
      gradeField.focus();
      return;
    }

    creditSum += credits;
    weightedSum += credits * grade;
  }

  if (creditSum <= 0) {
    showError("Please enter valid subject credits before calculating.");
    hideResults();
    return;
  }

  const gpa = weightedSum / creditSum;
  const term = semesterName.value.trim();

  gpaValue.textContent = gpa.toFixed(2);
  totalCredits.textContent = Number(creditSum.toFixed(4)).toString();
  weightedPoints.textContent = Number(weightedSum.toFixed(4)).toString();
  resultSemester.textContent = term
    ? `${term.toUpperCase()} GPA`
    : "SEMESTER GPA";

  errorMessage.hidden = true;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

resetBtn.addEventListener("click", () => {
  subjectsContainer.innerHTML = `
    <div class="subject-row">
      <input type="text" class="subject-name"
        placeholder="e.g. Accounting" aria-label="Subject name">
      <input type="number" class="subject-credits"
        min="0.01" max="100" step="any"
        placeholder="4" aria-label="Subject credits">
      <input type="number" class="subject-grade"
        min="0" max="10" step="any"
        placeholder="8" aria-label="Grade point">
      <button type="button" class="remove-btn"
        aria-label="Remove subject" disabled>×</button>
    </div>
  `;

  semesterName.value = "";
  gpaValue.textContent = "0.00";
  totalCredits.textContent = "0";
  weightedPoints.textContent = "0";
  resultSemester.textContent = "SEMESTER GPA";

  clearError();
  hideResults();
  updateSubjectCount();
});

updateSubjectCount();
