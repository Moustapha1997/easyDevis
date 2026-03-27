import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface CompanyInfo {
  name: string;
  subtitle: string;
  address: string;
  email: string;
  phone: string;
  siret: string;
  iban: string;
  logo: string;
}

export interface PDFQuoteItem {
  reference: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PDFQuoteData {
  quoteNumber: string;
  issueDate: string;
  clientName: string;
  clientAddress?: string;
  clientCity?: string;
  items: PDFQuoteItem[];
  total: number;
  notes?: string;
  terms?: string;
}

// Formateur de prix compatible jsPDF (pas d'espace insécable)
function fmtPrice(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' \u20AC';
}

export function generateQuotePDF(quote: PDFQuoteData, company: CompanyInfo): void {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ─── HEADER ────────────────────────────────────────────────────────────────
  let headerY = 14;

  // Logo (top-left)
  if (company.logo) {
    try {
      doc.addImage(company.logo, 'PNG', margin, headerY, 28, 28);
    } catch { /* ignore */ }
  }

  const textX = company.logo ? margin + 32 : margin;

  // Company name (bold, blue — même couleur que le numéro de devis)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  if (company.name) { doc.text(company.name, textX, headerY + 6); }

  // Subtitle (bleu clair)
  if (company.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(41, 128, 185);
    doc.text(company.subtitle, textX, headerY + 12);
  }

  // Address, email, phone (left)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  let infoY = headerY + 18;
  if (company.address) { doc.text(company.address, textX, infoY); infoY += 5; }
  if (company.email) { doc.text(company.email, textX, infoY); infoY += 5; }
  if (company.phone) { doc.text(`Tel : ${company.phone}`, textX, infoY); }

  // Date (top-right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date : ${new Date(quote.issueDate).toLocaleDateString('fr-FR')}`, pageW - margin, headerY + 6, { align: "right" });

  // Separator line
  const sepY = Math.max(headerY + 38, infoY + 8);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, sepY, pageW - margin, sepY);

  // ─── CLIENT SECTION ─────────────────────────────────────────────────────────
  let contentY = sepY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Nom client : ${quote.clientName}`, margin, contentY);
  contentY += 6;
  doc.setFont("helvetica", "normal");
  if (quote.clientAddress) {
    doc.text(`Adresse : ${quote.clientAddress}`, margin, contentY);
    contentY += 5;
  }
  if (quote.clientCity) {
    doc.text(quote.clientCity, margin, contentY);
    contentY += 5;
  }

  // ─── QUOTE TITLE ────────────────────────────────────────────────────────────
  contentY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text(`DEVIS N°${quote.quoteNumber}`, margin, contentY);
  contentY += 12;

  // ─── TABLE ──────────────────────────────────────────────────────────────────
  // Largeurs fixes : total disponible = 210 - 14*2 = 182 mm
  // Ref(28) + Desc(74) + Qté(20) + PU(30) + Total(30) = 182
  const tableBody = quote.items.map(item => [
    item.reference || "",
    item.description,
    item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(2),
    fmtPrice(item.unitPrice),
    fmtPrice(item.total),
  ]);

  autoTable(doc, {
    startY: contentY,
    head: [['Référence', 'Description', 'Quantité', 'Prix unitaire', 'Prix total']],
    body: tableBody,
    foot: [['', '', '', 'Total TTC', fmtPrice(quote.total)]],
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [40, 40, 40],
      overflow: 'linebreak',
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [235, 245, 255],
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 28, overflow: 'linebreak' },
      1: { cellWidth: 74, overflow: 'linebreak' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    tableWidth: 182,
    margin: { left: margin, right: margin },
  });

  const afterTableY = (doc as any).lastAutoTable.finalY + 8;

  // Notes / conditions
  let notesY = afterTableY;
  if (quote.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(doc.splitTextToSize(`Notes : ${quote.notes}`, pageW - margin * 2), margin, notesY);
    notesY += 10;
  }
  if (quote.terms) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(doc.splitTextToSize(`Conditions : ${quote.terms}`, pageW - margin * 2), margin, notesY);
  }

  // ─── SIGNATURE ──────────────────────────────────────────────────────────────
  const sigY = (doc as any).lastAutoTable.finalY + (quote.notes || quote.terms ? 28 : 18);

  // Bloc gauche : client
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Signature du client", margin, sigY);
  doc.text("Bon pour accord", margin, sigY + 5);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(margin, sigY + 9, 70, 18);

  // Bloc droite : entreprise
  const sigRightX = pageW - margin - 70;
  doc.text("Signature de l'entreprise", sigRightX, sigY);
  doc.text("Cachet et signature", sigRightX, sigY + 5);
  doc.rect(sigRightX, sigY + 9, 70, 18);

  // ─── FOOTER (multi-ligne centré) ────────────────────────────────────────────
  // Construire les lignes du footer
  const footerLines: { text: string; bold: boolean; isEmail?: boolean }[] = [];
  if (company.name)   footerLines.push({ text: company.name,                              bold: true  });
  if (company.address) footerLines.push({ text: `${company.address}`,                    bold: false });
  if (company.email)  footerLines.push({ text: `E-mail : ${company.email}`,               bold: false, isEmail: true });
  if (company.siret)  footerLines.push({ text: `SIRET de l'établissement : ${company.siret}`, bold: false });
  if (company.iban)   footerLines.push({ text: `IBAN : ${company.iban}`,                  bold: false });

  const lineHeight = 5.5;
  const footerBlockH = footerLines.length * lineHeight + 6; // +6 pour trait + marge
  let footerY = pageH - footerBlockH - 6;

  // Trait de séparation
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageW - margin, footerY);
  footerY += 6;

  // Lignes centrées
  for (const line of footerLines) {
    doc.setFont("helvetica", line.bold ? "bold" : "normal");
    doc.setFontSize(9);
    if (line.isEmail) {
      doc.setTextColor(41, 128, 185); // bleu pour le lien email
      const textW = doc.getTextWidth(line.text);
      doc.textWithLink(line.text, (pageW - textW) / 2, footerY, { url: `mailto:${company.email}` });
    } else {
      doc.setTextColor(60, 60, 60);
      doc.text(line.text, pageW / 2, footerY, { align: 'center' });
    }
    footerY += lineHeight;
  }

  doc.save(`Devis_${quote.quoteNumber}.pdf`);
}
