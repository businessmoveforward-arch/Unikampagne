const form = document.querySelector("#future-form");
const steps = document.querySelectorAll("[data-step]");
const stepIndicators = document.querySelectorAll("[data-step-indicator]");
const customChoice = document.querySelector("#custom-choice");
const customAnswer = document.querySelector("#custom-answer");
const customAnswerField = document.querySelector(".custom-answer");
const resetButton = document.querySelector("#reset-form");

const state = {
  currentStep: 1,
  choices: [],
  email: "",
  letter: ""
};

// Centralized error output keeps validation messages consistent per step.
function setError(key, message) {
  const target = document.querySelector(`[data-error-for="${key}"]`);
  if (target) {
    target.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((error) => {
    error.textContent = "";
  });
}

// Shows one step at a time and keeps the visual stepper in sync.
function showStep(stepNumber) {
  state.currentStep = stepNumber;

  steps.forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === stepNumber);
  });

  stepIndicators.forEach((indicator) => {
    const indicatorStep = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("active", indicatorStep === stepNumber);
    indicator.classList.toggle("complete", indicatorStep < stepNumber);
  });

  if (stepNumber === 4) {
    document.querySelector('[data-step="4"]').focus();
  }
}

// Custom answers replace the generic "Eigene Antwort" label in the summary.
function getSelectedChoices() {
  const selected = Array.from(document.querySelectorAll('input[name="choices"]:checked'))
    .map((input) => input.value)
    .filter((value) => value !== "Eigene Antwort");

  if (customChoice.checked && customAnswer.value.trim()) {
    selected.push(customAnswer.value.trim());
  }

  return selected;
}

function validateSurvey() {
  const checkedChoices = document.querySelectorAll('input[name="choices"]:checked');
  const hasCustomText = customChoice.checked && customAnswer.value.trim().length > 0;

  if (!checkedChoices.length) {
    setError("survey", "Bitte wähle mindestens eine Antwort aus.");
    return false;
  }

  if (customChoice.checked && !hasCustomText) {
    setError("survey", "Bitte schreibe deine eigene Antwort in das Textfeld.");
    return false;
  }

  state.choices = getSelectedChoices();
  setError("survey", "");
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function validateEmailStep() {
  const email = document.querySelector("#email").value.trim();
  const emailConfirm = document.querySelector("#email-confirm").value.trim();
  const consent = document.querySelector("#consent").checked;

  if (!isValidEmail(email)) {
    setError("email", "Bitte gib eine gültige E-Mail-Adresse ein.");
    return false;
  }

  if (email !== emailConfirm) {
    setError("email", "Die beiden E-Mail-Adressen müssen übereinstimmen.");
    return false;
  }

  if (!consent) {
    setError("email", "Bitte bestätige die Einverständniserklärung.");
    return false;
  }

  state.email = email;
  setError("email", "");
  return true;
}

function validateLetter() {
  const letter = document.querySelector("#letter").value.trim();

  if (letter.length < 30) {
    setError("letter", "Dein Zukunftsbrief muss mindestens 30 Zeichen enthalten.");
    return false;
  }

  state.letter = letter;
  setError("letter", "");
  return true;
}

function truncate(text, length = 120) {
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

function renderSummary() {
  document.querySelector("#summary-choices").textContent = state.choices.join(", ");
  document.querySelector("#summary-email").textContent = state.email;
  document.querySelector("#summary-letter").textContent = truncate(state.letter);
}

// The demo stores data locally only; no network request or database is used.
function saveDemoData() {
  localStorage.setItem("armedangelsFutureLetterDemo", JSON.stringify({
    choices: state.choices,
    email: state.email,
    letter: state.letter,
    savedAt: new Date().toISOString()
  }));
}

function resetForm() {
  form.reset();
  state.choices = [];
  state.email = "";
  state.letter = "";
  customAnswerField.classList.remove("visible");
  customAnswer.value = "";
  clearErrors();
  showStep(1);
  document.querySelector("#umfrage").scrollIntoView({ behavior: "smooth" });
}

customChoice.addEventListener("change", () => {
  customAnswerField.classList.toggle("visible", customChoice.checked);
  if (!customChoice.checked) {
    customAnswer.value = "";
  }
});

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    clearErrors();

    if (state.currentStep === 1 && validateSurvey()) {
      showStep(2);
    } else if (state.currentStep === 2 && validateEmailStep()) {
      showStep(3);
    }
  });
});

document.querySelectorAll("[data-prev]").forEach((button) => {
  button.addEventListener("click", () => {
    clearErrors();
    showStep(Math.max(1, state.currentStep - 1));
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  if (!validateLetter()) {
    return;
  }

  renderSummary();
  saveDemoData();
  showStep(4);
});

resetButton.addEventListener("click", resetForm);
