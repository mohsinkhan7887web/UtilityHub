
const resumeForm = document.getElementById("resumeForm");
const clearBtn = document.getElementById("clearBtn");
const printBtn = document.getElementById("printBtn");
const formMessage = document.getElementById("formMessage");

const fields = {
  fullName: document.getElementById("fullName"),
  jobTitle: document.getElementById("jobTitle"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  location: document.getElementById("location"),
  linkedin: document.getElementById("linkedin"),
  summary: document.getElementById("summary"),
  experience: document.getElementById("experience"),
  education: document.getElementById("education"),
  skills: document.getElementById("skills"),
  projects: document.getElementById("projects"),
  certifications: document.getElementById("certifications")
};

const previewElements = {
  fullName: document.getElementById("previewName"),
  jobTitle: document.getElementById("previewJobTitle"),
  summary: document.getElementById("previewSummary"),
  experience: document.getElementById("previewExperience"),
  education: document.getElementById("previewEducation"),
  skills: document.getElementById("previewSkills"),
  projects: document.getElementById("previewProjects"),
  certifications: document.getElementById("previewCertifications")
};

const sections = {
  summary: document.getElementById("summarySection"),
  experience: document.getElementById("experienceSection"),
  education: document.getElementById("educationSection"),
  skills: document.getElementById("skillsSection"),
  projects: document.getElementById("projectsSection"),
  certifications: document.getElementById("certificationsSection")
};

const previewContact = document.getElementById("previewContact");

function getValue(fieldName) {
  return fields[fieldName].value.trim();
}

function updateText(element, value, fallback) {
  element.textContent = value || fallback;
}

function updateSection(section, content, fallback) {
  section.classList.toggle("is-empty", !content);
  const paragraph = section.querySelector("p");
  paragraph.textContent = content || fallback;
}

function updateContact() {
  previewContact.replaceChildren();

  const contactItems = [
    getValue("email"),
    getValue("phone"),
    getValue("location")
  ].filter(Boolean);

  const linkedin = getValue("linkedin");

  if (linkedin) {
    try {
      const url = new URL(linkedin);

      if (url.protocol === "https:" || url.protocol === "http:") {
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Portfolio / LinkedIn";
        contactItems.push(link);
      }
    } catch {
      // Invalid optional URL is skipped in the preview.
    }
  }

  if (contactItems.length === 0) {
    const placeholder = document.createElement("span");
    placeholder.textContent = "Email, phone and location appear here";
    previewContact.appendChild(placeholder);
    return;
  }

  contactItems.forEach((item) => {
    const span = document.createElement("span");

    if (typeof item === "string") {
      span.textContent = item;
    } else {
      span.appendChild(item);
    }

    previewContact.appendChild(span);
  });
}

function updatePreview() {
  updateText(
    previewElements.fullName,
    getValue("fullName"),
    "Your Name"
  );

  updateText(
    previewElements.jobTitle,
    getValue("jobTitle"),
    "Your Target Job Title"
  );

  updateSection(
    sections.summary,
    getValue("summary"),
    "Your professional summary will appear here."
  );

  updateSection(
    sections.experience,
    getValue("experience"),
    "Your experience details will appear here."
  );

  updateSection(
    sections.education,
    getValue("education"),
    "Your education details will appear here."
  );

  const skills = getValue("skills")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .join(" • ");

  updateSection(
    sections.skills,
    skills,
    "Your skills will appear here."
  );

  updateSection(
    sections.projects,
    getValue("projects"),
    "Your projects will appear here."
  );

  updateSection(
    sections.certifications,
    getValue("certifications"),
    "Your certifications will appear here."
  );

  updateContact();
}

resumeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!resumeForm.reportValidity()) {
    return;
  }

  updatePreview();
  formMessage.textContent = "Resume preview updated successfully.";
  formMessage.style.color = "#15803d";
});

Object.values(fields).forEach((field) => {
  field.addEventListener("input", () => {
    updatePreview();
    formMessage.textContent = "";
  });
});

clearBtn.addEventListener("click", () => {
  resumeForm.reset();

  updatePreview();

  formMessage.textContent = "Form cleared.";
  formMessage.style.color = "#64748b";
});

printBtn.addEventListener("click", () => {
  if (!resumeForm.reportValidity()) {
    formMessage.textContent = "Please enter your full name before printing.";
    formMessage.style.color = "#b91c1c";
    fields.fullName.focus();
    return;
  }

  updatePreview();
  window.print();
});

updatePreview();
