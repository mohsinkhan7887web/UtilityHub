
const timeDisplay = document.getElementById("timeDisplay");
const modeLabel = document.getElementById("modeLabel");
const timerStatus = document.getElementById("timerStatus");
const timerCircle = document.getElementById("timerCircle");

const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const modeButtons = document.querySelectorAll(".mode-btn");

const sessionCount = document.getElementById("sessionCount");
const sessionsUntilBreak = document.getElementById("sessionsUntilBreak");

const focusMinutesInput = document.getElementById("focusMinutes");
const shortMinutesInput = document.getElementById("shortMinutes");
const longMinutesInput = document.getElementById("longMinutes");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const settingsMessage = document.getElementById("settingsMessage");

const DEFAULT_SETTINGS = {
  focus: 25,
  short: 5,
  long: 15
};

let settings = { ...DEFAULT_SETTINGS };
let currentMode = "focus";
let remainingSeconds = settings.focus * 60;
let intervalId = null;
let isRunning = false;
let completedSessions = 0;
let endTime = 0;

const MODE_LABELS = {
  focus: "FOCUS TIME",
  short: "SHORT BREAK",
  long: "LONG BREAK"
};

const MODE_BUTTON_LABELS = {
  focus: "Start Focus",
  short: "Start Short Break",
  long: "Start Long Break"
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  modeLabel.textContent = MODE_LABELS[currentMode];

  const totalSeconds = settings[currentMode] * 60;
  const progress = totalSeconds > 0
    ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
    : 0;

  timerCircle.style.background =
    `conic-gradient(var(--primary) ${progress}%, #e8efff ${progress}%)`;

  startPauseBtn.textContent = isRunning
    ? "Pause"
    : remainingSeconds === 0
      ? "Start Again"
      : remainingSeconds < settings[currentMode] * 60
        ? "Resume"
        : MODE_BUTTON_LABELS[currentMode];

  sessionCount.textContent = completedSessions;

  const remainingSessions = 4 - (completedSessions % 4);
  sessionsUntilBreak.textContent =
    `${remainingSessions} session${remainingSessions === 1 ? "" : "s"}`;

  modeButtons.forEach((button) => {
    const selected = button.dataset.mode === currentMode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  document.title = `${formatTime(remainingSeconds)} — Pomodoro Timer | UtilityHub`;
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  isRunning = false;
}

function selectMode(mode, message = "Ready when you are") {
  stopTimer();
  currentMode = mode;
  remainingSeconds = settings[currentMode] * 60;
  timerStatus.textContent = message;
  updateDisplay();
}

function startTimer() {
  if (isRunning) {
    stopTimer();
    timerStatus.textContent = "Timer paused";
    updateDisplay();
    return;
  }

  if (remainingSeconds <= 0) {
    remainingSeconds = settings[currentMode] * 60;
  }

  isRunning = true;
  endTime = Date.now() + remainingSeconds * 1000;
  timerStatus.textContent = "Stay focused. You've got this!";
  updateDisplay();

  intervalId = setInterval(() => {
    remainingSeconds = Math.max(
      0,
      Math.ceil((endTime - Date.now()) / 1000)
    );

    updateDisplay();

    if (remainingSeconds <= 0) {
      completeTimer();
    }
  }, 200);
}

function completeTimer() {
  stopTimer();
  remainingSeconds = 0;
  updateDisplay();

  if (currentMode === "focus") {
    completedSessions += 1;
    sessionCount.textContent = completedSessions;

    if (completedSessions % 4 === 0) {
      timerStatus.textContent = "Focus session complete! Time for a long break.";
      selectMode("long", "Focus session complete! Start your long break when ready.");
    } else {
      timerStatus.textContent = "Focus session complete! Time for a short break.";
      selectMode("short", "Focus session complete! Start your short break when ready.");
    }
  } else {
    timerStatus.textContent = "Break complete! Ready to focus again?";
    selectMode("focus", "Break complete! Start your next focus session when ready.");
  }

  updateDisplay();
  notifyCompletion();
}

function notifyCompletion() {
  if ("Notification" in window && Notification.permission === "granted") {
    const message = currentMode === "focus"
      ? "Your break is ready."
      : "Your next focus session is ready.";

    new Notification("Pomodoro Timer", { body: message });
  }
}

function resetTimer() {
  stopTimer();
  remainingSeconds = settings[currentMode] * 60;
  timerStatus.textContent = "Timer reset. Ready when you are.";
  updateDisplay();
}

function validateDuration(input, label, max) {
  const value = Number(input.value);

  if (
    input.value.trim() === "" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > max
  ) {
    return `${label} must be a whole number from 1 to ${max} minutes.`;
  }

  return "";
}

function saveSettings() {
  const errors = [
    validateDuration(focusMinutesInput, "Focus duration", 120),
    validateDuration(shortMinutesInput, "Short break duration", 60),
    validateDuration(longMinutesInput, "Long break duration", 60)
  ].filter(Boolean);

  if (errors.length > 0) {
    settingsMessage.textContent = errors[0];
    settingsMessage.style.color = "#b91c1c";
    return;
  }

  settings = {
    focus: Number(focusMinutesInput.value),
    short: Number(shortMinutesInput.value),
    long: Number(longMinutesInput.value)
  };

  stopTimer();
  remainingSeconds = settings[currentMode] * 60;
  timerStatus.textContent = "Settings saved. Ready when you are.";
  settingsMessage.textContent = "Settings saved successfully!";
  settingsMessage.style.color = "var(--success)";

  updateDisplay();
}

startPauseBtn.addEventListener("click", startTimer);

resetBtn.addEventListener("click", resetTimer);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    if (!Object.prototype.hasOwnProperty.call(settings, mode)) {
      return;
    }

    selectMode(mode);
  });
});

saveSettingsBtn.addEventListener("click", saveSettings);

[
  focusMinutesInput,
  shortMinutesInput,
  longMinutesInput
].forEach((input) => {
  input.addEventListener("input", () => {
    settingsMessage.textContent = "";
  });
});

updateDisplay();
