import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a professional multi-page PDF from a DOM element.
 * Optimized for long-form technical manuals with institutional branding.
 */
export const generateManualPdf = async (element, options = {}) => {
  if (!element) return;

  const {
    filename = `WealthLens-Technical-Manual-${new Date().toISOString().split('T')[0]}.pdf`,
    onProgress = () => {}
  } = options;

  try {
    onProgress(true);

    // 1. Capture the element with high scale for clarity
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    // 2. Initialise PDF (A4 Portrait)
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    // ─── Colors ────────────────────────────────────────────────────────────────
    const SLATE_900 = [15, 23, 42];
    const GOLD      = [197, 160, 89];
    const SLATE_500 = [100, 116, 139];
    const SLATE_200 = [226, 232, 240];

    const drawHeaderFooter = (pageNum, totalPages) => {
      // Header
      pdf.setFillColor(SLATE_900[0], SLATE_900[1], SLATE_900[2]);
      pdf.rect(0, 0, pdfWidth, 10, 'F');
      
      pdf.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("WEALTHLENS INSTITUTIONAL SPECIFICATION", 15, 6.5);
      
      pdf.setTextColor(255, 255, 255);
      pdf.text("CONFIDENTIAL", pdfWidth - 15, 6.5, { align: "right" });

      // Footer
      pdf.setDrawColor(SLATE_200[0], SLATE_200[1], SLATE_200[2]);
      pdf.setLineWidth(0.1);
      pdf.line(15, pageHeight - 15, pdfWidth - 15, pageHeight - 15);
      
      pdf.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
      pdf.setFontSize(6);
      pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth / 2, pageHeight - 10, { align: "center" });
      pdf.text("WealthLens v4.2.0-ELITE Protocol", 15, pageHeight - 10);
      pdf.text(new Date().toLocaleDateString(), pdfWidth - 15, pageHeight - 10, { align: "right" });
    };

    // 3. Add first page
    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
    
    // Calculate total pages for footer
    const totalPages = Math.ceil(pdfHeight / pageHeight);
    
    drawHeaderFooter(1, totalPages);
    heightLeft -= pageHeight;

    // 4. Add subsequent pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      
      const currentPageNum = Math.ceil((pdfHeight - heightLeft) / pageHeight) + 1;
      drawHeaderFooter(currentPageNum, totalPages);
      
      heightLeft -= pageHeight;
    }

    // 5. Save the PDF using File System Access API (Forces OS save dialog with correct name)
    const arrayBuffer = pdf.output("arraybuffer");
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'PDF Document',
            accept: {'application/pdf': ['.pdf']},
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        onProgress(false);
        return;
      }
    } catch (err) {
      console.warn("showSaveFilePicker failed or was cancelled by user:", err);
      // Fallback to standard anchor click if user cancels or API fails
    }

    // Fallback if showSaveFilePicker is not supported
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1000);
    onProgress(false);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    onProgress(false);
  }
};
