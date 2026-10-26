"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("letterForm");
  const output = document.getElementById("letterOutput");
  const wordCount = document.getElementById("wordCount");
  const statusMessage = document.getElementById("statusMessage");

  const fields = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    location: document.getElementById("location"),
    letterDate: document.getElementById("letterDate"),
    jobTitle: document.getElementById("jobTitle"),
    companyName: document.getElementById("companyName"),
    hiringManager: document.getElementById("hiringManager"),
    experience: document.getElementById("experience"),
    skills: document.getElementById("skills"),
    achievements: document.getElementById("achievements"),
    motivation: document.getElementById("motivation"),
    tone: document.getElementById("tone")
  };

  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const printBtn = document.getElementById("printBtn");

  function value(key) {
    return fields[key].value.trim();
  }

  function todayISO() {
    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 10);
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";

    const date = new Date(`${isoDate}T12:00:00`);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function updateWordCount() {
    const text = output.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `${count} ${count === 1 ? "word" : "words"}`;
  }

  function getGreeting() {
    const manager = value("hiringManager");

    if (!manager) {
      return "Dear Hiring Manager,";
    }

    return `Dear ${manager.replace(/[,]+$/, "")},`;
  }

  function getOpening(name, role, company, experience, tone) {
    const openings = {
      professional: {
        fresher: `I am writing to apply for the ${role} position at ${company}. As an entry-level candidate, I am eager to begin my career, contribute to your team, and develop my professional skills.`,
        experienced: `I am writing to express my interest in the ${role} position at ${company}. My professional experience and commitment to quality work have prepared me to contribute effectively to your team.`,
        internship: `I am writing to apply for the ${role} opportunity at ${company}. I am keen to gain practical experience, apply my knowledge, and learn from your team.`,
        "career-change": `I am writing to apply for the ${role} position at ${company}. I am motivated to bring my transferable skills, adaptability, and enthusiasm to this new career direction.`
      },
      confident: {
        fresher: `I am excited to apply for the ${role} position at ${company}. I bring a strong willingness to learn, a responsible attitude, and a commitment to delivering quality work.`,
       experienced: `I am pleased to apply for the ${role} position at ${company}. My experience, problem-solving approach, and focus on results would allow me to make a meaningful contribution.`,
        internship: `I am excited to apply for the ${role} opportunity at ${company}. I am ready to apply my knowledge, take initiative, and learn quickly in a professional environment.`,
        "career-change": `I am enthusiastic about pursuing the ${role} position at ${company}. My transferable abilities, flexibility, and commitment to learning will help me adapt and contribute.`
      },
      friendly: {
        fresher: `I was happy to learn about the ${role} opportunity at ${company}. As someone starting my career, I am looking forward to learning, working with a team, and contributing wherever I can.`,
        experienced: `I am glad to apply for the ${role} position at ${company}. I enjoy solving problems, collaborating with others, and delivering dependable work.`,
        internship: `I am excited to apply for the ${role} opportunity at ${company}. I would value the chance to learn from your team and put my knowledge into practice.`,
        "career-change": `I am excited about the possibility of joining ${company} as a ${role}. I am ready to learn, adapt, and bring a fresh perspective to the role.`
      },
      concise: {
        fresher: `I am applying for the ${role} position at ${company}. I am a motivated entry-level candidate eager to learn and contribute to your team.`,
        experienced: `I am applying for the ${role} position at ${company}. My experience and focus on reliable results make this an opportunity of strong interest to me.`,
        internship: `I am applying for the ${role} internship at ${company} to gain practical experience and contribute my skills.`,
        "career-change": `I am applying for the ${role} position at ${company}, bringing transferable skills and a strong commitment to learning.`
      }
    };

    return openings[tone][experience];
  }

  function buildLetter() {
    const name = value("fullName");
    const job = value("jobTitle");
    const company = value("companyName");
    const experience = value("experience");
    const tone = value("tone");

    const contactLines = [
      name,
      value("email"),
      value("phone"),
      value("location")
    ].filter(Boolean);

    const date = formatDate(value("letterDate"));
    const skills = value("skills");
    const achievements = value("achievements");
    const motivation = value("motivation");

    const paragraphs = [
      getOpening(name, job, company, experience, tone)
    ];

    if (skills) {
      paragraphs.push(
        `My relevant skills include ${skills}. I would welcome the opportunity to apply these abilities to the responsibilities of this position and continue developing professionally.`
      );
    } else if (experience === "fresher") {
      paragraphs.push(
        "Although I am at the beginning of my professional journey, I am ready to learn new processes, take responsibility, and work collaboratively to support team goals."
      );
    } else if (experience === "internship") {
      paragraphs.push(
        "I am eager to strengthen my practical abilities, learn from experienced professionals, and approach assigned tasks with curiosity and responsibility."
      );
    } else if (experience === "career-change") {
      paragraphs.push(
        "I am prepared to build on my existing strengths, learn role-specific processes, and adapt to new challenges with a positive and practical approach."
      );
    } else {
      paragraphs.push(
        "I value clear communication, teamwork, and dependable execution. I would aim to bring these qualities to the role and support the team's objectives."
      );
    }

    if (achievements) {
      paragraphs.push(
        `A relevant example of my background is: ${achievements}. This experience has helped me develop useful skills that I hope to bring to this position.`
      );
    }

    if (motivation) {
      paragraphs.push(
        `I am particularly interested in this opportunity because ${motivation.replace(/[.!?]+$/, "")}. I would be pleased to learn more about your team's priorities and how I could contribute.`
      );
    } else {
      paragraphs.push(
        `I am interested in the opportunity to contribute to ${company} and learn more about the goals and responsibilities of this role.`
      );
    }

    paragraphs.push(
      "Thank you for considering my application. I would appreciate the opportunity to discuss my suitability for the position in an interview."
    );

    const signOff = tone === "friendly" ? "Kind regards," : "Sincerely,";

    return [
      contactLines.join("\n"),
      date,
      `Hiring Team\n${company}`,
      getGreeting(),
      ...paragraphs,
      signOff,
      name
    ].filter(Boolean).join("\n\n");
  }

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    output.value = buildLetter();
    updateWordCount();
    setStatus("Cover letter generated. Review and edit it before applying.");
  });

  output.addEventListener("input", () => {
    updateWordCount();
    setStatus("Your letter has unsaved edits.");
  });

  copyBtn.addEventListener("click", async () => {
    const text = output.value.trim();

    if (!text) {
      setStatus("Generate a cover letter first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Cover letter copied to clipboard.");
    } catch (error) {
      output.focus();
      output.select();

      try {
        const copied = document.execCommand("copy");
        setStatus(
          copied
            ? "Cover letter copied to clipboard."
            : "Copy was blocked. Select the letter and press Ctrl+C."
        );
      } catch {
        setStatus("Copy was blocked. Select the letter and press Ctrl+C.");
      }

      window.getSelection()?.removeAllRanges();
    }
  });

  downloadBtn.addEventListener("click", () => {
    const text = output.value.trim();

    if (!text) {
      setStatus("Generate a cover letter first.");
      return;
    }

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cover-letter.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setStatus("Your .txt download has started.");
  });

  printBtn.addEventListener("click", () => {
    if (!output.value.trim()) {
      setStatus("Generate a cover letter before printing.");
      return;
    }

    window.print();
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    fields.letterDate.value = todayISO();
    output.value = "";
    updateWordCount();
    setStatus("Form cleared. Ready to create a new letter.");
  });

  fields.letterDate.value = todayISO();
  updateWordCount();
});