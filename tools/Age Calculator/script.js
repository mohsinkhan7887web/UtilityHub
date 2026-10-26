
const ageForm = document.getElementById("ageForm");
const birthDateInput = document.getElementById("birthDate");
const asOfDateInput = document.getElementById("asOfDate");

const result = document.getElementById("result");
const message = document.getElementById("message");

const yearsOutput = document.getElementById("years");
const monthsOutput = document.getElementById("months");
const daysOutput = document.getElementById("days");
const totalDaysOutput = document.getElementById("totalDays");

// Use local calendar dates, avoiding UTC timezone shifts.
function dateToParts(value) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function dateToUtcDays(parts) {
  return Math.floor(
    Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000
  );
}

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function calculateAge(birth, target) {
  let years = target.year - birth.year;
  let months = target.month - birth.month;
  let days = target.day - birth.day;

  if (days < 0) {
    months--;

    const previousMonthIndex = target.month - 2;
    const previousMonthYear =
      previousMonthIndex < 0 ? target.year - 1 : target.year;

    const normalizedMonth = (previousMonthIndex + 12) % 12;

    days += daysInMonth(previousMonthYear, normalizedMonth);
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

function setTodayAsDefault() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  asOfDateInput.value = `${year}-${month}-${day}`;
  asOfDateInput.max = `${year}-${month}-${day}`;
  birthDateInput.max = `${year}-${month}-${day}`;
}

function clearResult() {
  result.hidden = true;
  message.textContent = "";
}

ageForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearResult();

  if (!birthDateInput.value || !asOfDateInput.value) {
    message.textContent = "Please select both dates.";
    return;
  }

  const birth = dateToParts(birthDateInput.value);
  const target = dateToParts(asOfDateInput.value);

  const birthDays = dateToUtcDays(birth);
  const targetDays = dateToUtcDays(target);

  if (birthDays > targetDays) {
    message.textContent =
      "Date of birth cannot be later than the calculation date.";
    return;
  }

  const age = calculateAge(birth, target);
  const totalDays = targetDays - birthDays;

  yearsOutput.textContent = age.years;
  monthsOutput.textContent = age.months;
  daysOutput.textContent = age.days;

  totalDaysOutput.textContent =
    `Total age: ${totalDays.toLocaleString()} days`;

  result.hidden = false;
});

ageForm.addEventListener("reset", function () {
  // Let the browser reset the form before clearing the result.
  setTimeout(clearResult, 0);
});

setTodayAsDefault();
