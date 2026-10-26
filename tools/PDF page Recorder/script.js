
document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  const uploadArea = $("uploadArea");
  const workspace = $("workspace");
  const pdfInput = $("pdfInput");
  const changePdfButton = $("changePdfButton");
  const fileName = $("fileName");
  const pageCount = $("pageCount");
  const pageList = $("pageList");
  const orderCount = $("orderCount");
  const statusMessage = $("statusMessage");
  const downloadButton = $("downloadButton");
  const resetButton = $("resetButton");
  const resultArea = $("resultArea");
  const resultDetails = $("resultDetails");
  const downloadLink = $("downloadLink");

  let selectedPdf = null;
  let originalBytes = null;
  let pageOrder = [];
  let busy = false;
  let outputUrl = null;
  let loadId = 0;

  function status(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? "#c93649" : "";
  }

  function showWorkspace(show) {
    uploadArea.hidden = show;
    workspace.hidden = !show;
  }

  function clearResult() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = null;
    downloadLink.removeAttribute("href");
    resultArea.hidden = true;
  }

  function renderPages() {
    pageList.replaceChildren();

    pageOrder.forEach((originalIndex, position) => {
      const item = document.createElement("li");
      const row = document.createElement("div");
      row.className = "page-row";

      const label = document.createElement("span");
      label.className = "page-label";
      label.textContent =
        "Output page " + (position + 1) +
        " (original page " + (originalIndex + 1) + ")";

      const actions = document.createElement("div");
      actions.className = "page-actions";

      const upButton = document.createElement("button");
      upButton.type = "button";
      upButton.className = "move-button";
      upButton.textContent = "↑";
      upButton.title = "Move page up";
      upButton.setAttribute("aria-label", "Move original page " + (originalIndex + 1) + " up");
      upButton.disabled = busy || position === 0;

      upButton.addEventListener("click", function () {
        if (busy || position === 0) return;

        [pageOrder[position - 1], pageOrder[position]] =
          [pageOrder[position], pageOrder[position - 1]];

        clearResult();
        renderPages();
        status("Page order updated.");
      });

      const downButton = document.createElement("button");
      downButton.type = "button";
      downButton.className = "move-button";
      downButton.textContent = "↓";
      downButton.title = "Move page down";
      downButton.setAttribute("aria-label", "Move original page " + (originalIndex + 1) + " down");
      downButton.disabled = busy || position === pageOrder.length - 1;

      downButton.addEventListener("click", function () {
        if (busy || position === pageOrder.length - 1) return;

        [pageOrder[position], pageOrder[position + 1]] =
          [pageOrder[position + 1], pageOrder[position]];

        clearResult();
        renderPages();
        status("Page order updated.");
      });

      actions.append(upButton, downButton);
      row.append(label, actions);
      item.append(row);
      pageList.append(item);
    });

    orderCount.textContent = pageOrder.length + " pages";
  }

  async function loadPdf(file) {
    if (!file || busy) return;

    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      status("Please choose a PDF file.", true);
      return;
    }

    if (file.size === 0) {
      status("The selected file is empty.", true);
      return;
    }

    const currentLoad = ++loadId;

    selectedPdf = file;
    originalBytes = null;
    pageOrder = [];
    clearResult();
    pageList.replaceChildren();

    fileName.textContent = file.name;
    pageCount.textContent = "Reading PDF...";
    showWorkspace(true);
    status("Loading PDF. Please wait...");

    try {
      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        throw new Error("The PDF library did not load. Check your internet connection and refresh the page.");
      }

      const bytes = await file.arrayBuffer();
      const pdf = await window.PDFLib.PDFDocument.load(bytes);

      if (currentLoad !== loadId || selectedPdf !== file) return;

      const count = pdf.getPageCount();

      if (count < 1) {
        throw new Error("This PDF has no pages.");
      }

      originalBytes = bytes;
      pageOrder = Array.from({ length: count }, (_, index) => index);

      pageCount.textContent = "Total pages: " + count;
      renderPages();
      status("PDF loaded. Use the arrows to arrange the pages.");
    } catch (error) {
      console.error("PDF load error:", error);

      if (currentLoad !== loadId || selectedPdf !== file) return;

      pageCount.textContent = "Could not read PDF";
      status(error.message || "Could not read this PDF.", true);
    }
  }

  pdfInput.addEventListener("change", function () {
    const file = pdfInput.files && pdfInput.files[0];

    if (file) loadPdf(file);

    pdfInput.value = "";
  });

  changePdfButton.addEventListener("click", function () {
    if (!busy) pdfInput.click();
  });

  downloadButton.addEventListener("click", async function () {
    if (busy) return;

    if (!originalBytes || !pageOrder.length || !window.PDFLib) {
      status("Choose a readable PDF first.", true);
      return;
    }

    busy = true;
    downloadButton.disabled = true;
    changePdfButton.disabled = true;
    resetButton.disabled = true;
    downloadButton.textContent = "Creating PDF...";
    clearResult();
    renderPages();
    status("Creating your reordered PDF...");

    try {
      const source = await window.PDFLib.PDFDocument.load(originalBytes);
      const output = await window.PDFLib.PDFDocument.create();
      const copiedPages = await output.copyPages(source, pageOrder);

      copiedPages.forEach((page) => output.addPage(page));

      const bytes = await output.save();
      const blob = new Blob([bytes], { type: "application/pdf" });

      outputUrl = URL.createObjectURL(blob);
      downloadLink.href = outputUrl;
      downloadLink.download = "utilityhub-reordered.pdf";

      resultDetails.textContent =
        copiedPages.length + " pages reordered · " +
        (blob.size / 1024).toFixed(1) + " KB";

      resultArea.hidden = false;
      status("Success! Your reordered PDF is ready to download.");
      resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      console.error("PDF reorder error:", error);
      status("Could not create the PDF. Try another, unprotected PDF file.", true);
    } finally {
      busy = false;
      downloadButton.disabled = false;
      changePdfButton.disabled = false;
      resetButton.disabled = false;
      downloadButton.textContent = "Create Reordered PDF";
      renderPages();
    }
  });

  function resetTool() {
    if (busy) return;

    loadId++;
    selectedPdf = null;
    originalBytes = null;
    pageOrder = [];

    pdfInput.value = "";
    fileName.textContent = "document.pdf";
    pageCount.textContent = "";
    pageList.replaceChildren();

    clearResult();
    showWorkspace(false);
    statusMessage.textContent = "";
  }

  resetButton.addEventListener("click", resetTool);

  showWorkspace(false);
});
