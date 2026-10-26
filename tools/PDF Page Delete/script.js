
document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  const uploadArea = $("uploadArea");
  const workspace = $("workspace");
  const pdfInput = $("pdfInput");
  const changePdfButton = $("changePdfButton");
  const fileName = $("fileName");
  const pageCount = $("pageCount");
  const deletePagesInput = $("deletePages");
  const selectionCount = $("selectionCount");
  const selectionPreview = $("selectionPreview");
  const remainingCount = $("remainingCount");
  const statusMessage = $("statusMessage");
  const deleteButton = $("deleteButton");
  const resetButton = $("resetButton");
  const resultArea = $("resultArea");
  const resultDetails = $("resultDetails");
  const downloadLink = $("downloadLink");

  let selectedPdf = null;
  let originalBytes = null;
  let totalPages = 0;
  let outputUrl = null;
  let busy = false;
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
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }

    outputUrl = null;
    downloadLink.removeAttribute("href");
    resultArea.hidden = true;
  }

  function parsePages(value, maxPages) {
    if (!value.trim()) {
      return [];
    }

    const result = new Set();

    for (const raw of value.split(",")) {
      const part = raw.trim();

      if (/^\d+$/.test(part)) {
        const page = Number(part);

        if (page < 1 || page > maxPages) {
          throw new Error(
            "Enter page numbers between 1 and " + maxPages + "."
          );
        }

        result.add(page);
        continue;
      }

      const match = part.match(/^(\d+)\s*-\s*(\d+)$/);

      if (!match) {
        throw new Error("Invalid format. Example: 2,4,7-9");
      }

      const start = Number(match[1]);
      const end = Number(match[2]);

      if (start < 1 || end > maxPages || start > end) {
        throw new Error(
          "Invalid page range. Use pages from 1 to " + maxPages + "."
        );
      }

      for (let page = start; page <= end; page++) {
        result.add(page);
      }
    }

    return Array.from(result).sort((a, b) => a - b);
  }

  function updateSummary() {
    clearResult();

    if (!selectedPdf || !totalPages) {
      selectionCount.textContent = "Waiting for PDF";
      selectionPreview.textContent = "Load a PDF first.";
      remainingCount.textContent = "Remaining pages: —";
      return;
    }

    try {
      const pagesToDelete = parsePages(
        deletePagesInput.value,
        totalPages
      );

      const remaining = totalPages - pagesToDelete.length;

      selectionCount.textContent =
        pagesToDelete.length +
        (pagesToDelete.length === 1
          ? " page selected for deletion"
          : " pages selected for deletion");

      selectionPreview.textContent = pagesToDelete.length
        ? "Pages to remove: " + pagesToDelete.join(", ")
        : "No pages selected for deletion.";

      remainingCount.textContent = "Remaining pages: " + remaining;

      if (remaining < 1) {
        status("You must keep at least one page in the PDF.", true);
      } else {
        statusMessage.textContent = "";
      }
    } catch (error) {
      selectionCount.textContent = "Invalid selection";
      selectionPreview.textContent = error.message;
      remainingCount.textContent = "Remaining pages: —";
      status(error.message, true);
    }
  }

  async function loadPdf(file) {
    if (!file || busy) return;

    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!isPdf) {
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
    totalPages = 0;

    clearResult();
    deletePagesInput.value = "";
    fileName.textContent = file.name;
    pageCount.textContent = "Reading PDF...";
    showWorkspace(true);
    status("Loading PDF. Please wait...");

    try {
      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        throw new Error(
          "The PDF library did not load. Check your internet connection and refresh."
        );
      }

      const bytes = await file.arrayBuffer();
      const pdf = await window.PDFLib.PDFDocument.load(bytes);

      if (currentLoad !== loadId || selectedPdf !== file) return;

      totalPages = pdf.getPageCount();

      if (totalPages < 1) {
        throw new Error("This PDF has no pages.");
      }

      originalBytes = bytes;
      pageCount.textContent = "Total pages: " + totalPages;

      updateSummary();
      status("PDF loaded successfully. Enter the pages to delete.");
    } catch (error) {
      console.error("PDF loading error:", error);

      if (currentLoad !== loadId || selectedPdf !== file) return;

      pageCount.textContent = "Could not read PDF";
      selectionCount.textContent = "PDF loading failed";
      selectionPreview.textContent = error.message;
      remainingCount.textContent = "Remaining pages: —";

      status(error.message || "Could not read this PDF.", true);
    }
  }

  pdfInput.addEventListener("change", function () {
    const file = pdfInput.files && pdfInput.files[0];

    if (file) {
      loadPdf(file);
    }

    pdfInput.value = "";
  });

  changePdfButton.addEventListener("click", function () {
    if (!busy) {
      pdfInput.click();
    }
  });

  deletePagesInput.addEventListener("input", updateSummary);

  deleteButton.addEventListener("click", async function () {
    if (busy) return;

    if (!originalBytes || !totalPages || !window.PDFLib) {
      status("Choose a readable PDF first.", true);
      return;
    }

    let pagesToDelete;

    try {
      pagesToDelete = parsePages(
        deletePagesInput.value,
        totalPages
      );
    } catch (error) {
      status(error.message, true);
      return;
    }

    if (pagesToDelete.length === 0) {
      status("Enter at least one page number to delete.", true);
      return;
    }

    if (pagesToDelete.length >= totalPages) {
      status("You must keep at least one page in the PDF.", true);
      return;
    }

    busy = true;
    deleteButton.disabled = true;
    changePdfButton.disabled = true;
    resetButton.disabled = true;
    deleteButton.textContent = "Processing...";
    clearResult();
    status("Removing selected pages...");

    try {
      const pdf = await window.PDFLib.PDFDocument.load(originalBytes);

      // Delete pages from highest index to lowest so indexes remain valid.
      const indexes = pagesToDelete
        .map((page) => page - 1)
        .sort((a, b) => b - a);

      for (const index of indexes) {
        pdf.removePage(index);
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });

      outputUrl = URL.createObjectURL(blob);
      downloadLink.href = outputUrl;
      downloadLink.download = "utilityhub-pages-deleted.pdf";

      resultDetails.textContent =
        pagesToDelete.length + " " +
        (pagesToDelete.length === 1 ? "page removed" : "pages removed") +
        ". " + pdf.getPageCount() + " pages remain.";

      resultArea.hidden = false;
      status("Success! Your updated PDF is ready to download.");
      resultArea.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    } catch (error) {
      console.error("PDF page deletion error:", error);
      status(
        "Could not process this PDF. Try another unprotected PDF file.",
        true
      );
    } finally {
      busy = false;
      deleteButton.disabled = false;
      changePdfButton.disabled = false;
      resetButton.disabled = false;
      deleteButton.textContent = "Delete Selected Pages";
    }
  });

  function resetTool() {
    if (busy) return;

    loadId++;
    selectedPdf = null;
    originalBytes = null;
    totalPages = 0;

    pdfInput.value = "";
    deletePagesInput.value = "";
    fileName.textContent = "document.pdf";
    pageCount.textContent = "";
    selectionCount.textContent = "0 pages selected for deletion";
    selectionPreview.textContent = "Enter the page numbers you want to remove.";
    remainingCount.textContent = "Remaining pages: —";

    clearResult();
    showWorkspace(false);
    statusMessage.textContent = "";
  }

  resetButton.addEventListener("click", resetTool);

  showWorkspace(false);
});
