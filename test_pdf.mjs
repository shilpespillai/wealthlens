import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testPDFScan() {
  console.log("Loading PDF: test_scan.pdf");
  const data = new Uint8Array(fs.readFileSync('./test_scan.pdf'));
  
  try {
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let fullText = "";

    console.log(`PDF loaded. Pages: ${pdf.numPages}`);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + "\n";
    }

    fs.writeFileSync('pdf_text_dump.txt', fullText);
    console.log("Dumped full text to pdf_text_dump.txt");

    const txRegex = /(\d{1,2}\s[A-Za-z]{3}\s\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w{3}\s\d{1,2})\s+(.{1,150}?)\s+(-?\s*[^\d\s]*\s*[\d,]+\.\d{2})(?:\s+-?\s*[^\d\s]*\s*[\d,]+\.\d{2})?/g;
    const found = [];
    let match;
    while ((match = txRegex.exec(fullText)) !== null) {
      found.push({
        date: match[1],
        merchant: match[2].trim(),
        amount: parseFloat(match[3].replace(/[^\d.-]/g, '')),
      });
    }

    console.log(`\nScan Complete. Found ${found.length} transactions:`);
    console.table(found);
  } catch (err) {
    console.error("Failed to parse PDF:", err);
  }
}

testPDFScan();
