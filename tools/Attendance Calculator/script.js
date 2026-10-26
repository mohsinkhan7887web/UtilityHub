
const totalClassesInput = document.getElementById("totalClasses");
const attendedClassesInput = document.getElementById("attendedClasses");
const targetPercentageInput = document.getElementById("targetPercentage");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");

const attendanceValue = document.getElementById("attendanceValue");
const attendanceProgress = document.getElementById("attendanceProgress");
const progressFill = document.getElementById("progressFill");
const statusMessage = document.getElementById("statusMessage");

const resultTotal = document.getElementById("resultTotal");
const resultAttended = document.getElementById("resultAttended");
const resultMissed = document.getElementById("resultMissed");
const resultTarget = document.getElementById("resultTarget");
const targetMessage = document.getElementById("targetMessage");

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  resultSection.hidden = true;
}

function hideResults() {
  resultSection.hidden = true;
}

calculateBtn.addEventListener("click", () => {
  clearError();

  const totalText = totalClassesInput.value.trim();
  const attendedText = attendedClassesInput.value.trim();
  const targetText = targetPercentageInput.value.trim();

  if (totalText === "" || attendedText === "" || targetText === "") {
    showError("Please fill in all three fields.");
    return;
  }

  const total = Number(totalText);
  const attended = Number(attendedText);
  const target = Number(targetText);

  if (!Number.isSafeInteger(total) || total < 1) {
    showError("Total classes must be a whole number greater than zero.");
    return;
  }

  if (!Number.isSafeInteger(attended) || attended < 0) {
    showError("Classes attended must be a non-negative whole number.");
    return;
  }

  if (attended > total) {
    showError("Classes attended cannot exceed total classes held.");
    return;
  }

  if (!Number.isFinite(target) || target <= 0 || target > 100) {
    showError("Target attendance must be greater than 0% and no more than 100%.");
    return;
  }

  const percentage = (attended / total) * 100;
  const missed = total - attended;

  attendanceValue.textContent = percentage.toFixed(2);
  attendanceProgress.setAttribute("aria-valuenow", percentage.toFixed(2));
  progressFill.style.width = `${percentage}%`;

  resultTotal.textContent = total.toLocaleString();
  resultAttended.textContent = attended.toLocaleString();
  resultMissed.textContent = missed.toLocaleString();
  resultTarget.textContent = `${target}%`;

  statusMessage.className = "status-message";

  if (percentage >= target) {
    statusMessage.textContent =
      `Great! You have reached your ${target}% attendance target.`;
    statusMessage.classList.add("success");
  } else {
    statusMessage.textContent =
      `Your attendance is below your ${target}% target.`;
    statusMessage.classList.add("warning");
  }

  if (percentage >= target) {
    const maxFutureMisses = Math.floor(
      (attended - (target / 100) * total) / (target / 100)
    );

    if (maxFutureMisses >= 1) {
      targetMessage.textContent =
        `You have reached your target. You could miss up to ${maxFutureMisses} consecutive upcoming classes and remain at or above ${target}% attendance, assuming no other classes are missed.`;
    } else {
      targetMessage.textContent =
        `You have reached your target. Attend upcoming classes regularly to maintain your attendance.`;
    }
  } else {
    const required = Math.ceil(
      (target * total - 100 * attended) / (100 - target)
    );

    if (target === 100) {
      targetMessage.textContent =
        "Attend every upcoming class. A 100% target can only be reached after all future classes are attended, and past absences remain in the record.";
    } else {
      targetMessage.textContent =
        `You need to attend at least ${required} consecutive upcoming classes without missing any to reach ${target}% attendance.`;
    }
  }

  resultSection.hidden = false;

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

resetBtn.addEventListener("click", () => {
  totalClassesInput.value = "";
  attendedClassesInput.value = "";
  targetPercentageInput.value = "75";

  attendanceValue.textContent = "0.00";
  attendanceProgress.setAttribute("aria-valuenow", "0");
  progressFill.style.width = "0%";

  statusMessage.textContent = "";
  statusMessage.className = "status-message";

  resultTotal.textContent = "0";
  resultAttended.textContent = "0";
  resultMissed.textContent = "0";
  resultTarget.textContent = "75%";
  targetMessage.textContent = "";

  clearError();
  hideResults();
});

[
  totalClassesInput,
  attendedClassesInput,
  targetPercentageInput
].forEach((input) => {
  input.addEventListener("input", () => {
    clearError();
    hideResults();
  });
});
