import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyInfo } from "./generatePDF";

export interface InvoicePDFItem {
  reference: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  clientName: string;
  clientAddress?: string;
  items: InvoicePDFItem[];
  total: number;
  status: "unpaid" | "paid" | "overdue" | "cancelled";
  notes?: string;
  terms?: string;
}

function fmtPrice(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " \u20AC";
}

const STATUS_LABELS: Record<string, string> = {
  unpaid:    "Non payée",
  paid:      "Payée",
  overdue:   "En retard",
  cancelled: "Annulée",
};

export function generateInvoicePDF(invoice: InvoicePDFData, company: CompanyInfo): void {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Couleur principale facture : vert
  const GREEN: [number, number, number] = [39, 174, 96];

  // ─── HEADER ──────────────────────────────────────────────────────────────────
  let headerY = 14;

  if (company.logo) {
    try { doc.addImage(company.logo, "PNG", margin, headerY, 28, 28); } catch {}
  }
  const textX = company.logo ? margin + 32 : margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...GREEN);
  if (company.name) doc.text(company.name, textX, headerY + 6);

  if (company.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN);
    doc.text(company.subtitle, textX, headerY + 12);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  let infoY = headerY + 18;
  if (company.address) { doc.text(company.address, textX, infoY); infoY += 5; }
  if (company.email)   { doc.text(company.email,   textX, infoY); infoY += 5; }
  if (company.phone)   { doc.text(`Tel : ${company.phone}`, textX, infoY); }

  // Date (top-right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date : ${new Date(invoice.issueDate).toLocaleDateString("fr-FR")}`, pageW - margin, headerY + 6, { align: "right" });
  if (invoice.dueDate) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Échéance : ${new Date(invoice.dueDate).toLocaleDateString("fr-FR")}`, pageW - margin, headerY + 13, { align: "right" });
  }

  // Séparateur
  const sepY = Math.max(headerY + 38, infoY + 8);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, sepY, pageW - margin, sepY);

  // ─── CLIENT ───────────────────────────────────────────────────────────────────
  let contentY = sepY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nom client : ${invoice.clientName}`, margin, contentY);
  contentY += 6;
  doc.setFont("helvetica", "normal");
  if (invoice.clientAddress) {
    doc.text(`Adresse : ${invoice.clientAddress}`, margin, contentY);
    contentY += 5;
  }

  // ─── TITRE FACTURE ────────────────────────────────────────────────────────────
  contentY += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(`FACTURE N°${invoice.invoiceNumber}`, margin, contentY);

  // Badge statut (top-right du titre)
  const statusLabel = STATUS_LABELS[invoice.status] ?? invoice.status;
  doc.setFontSize(10);
  doc.text(statusLabel, pageW - margin, contentY, { align: "right" });
  contentY += 12;

  // ─── TABLEAU ─────────────────────────────────────────────────────────────────
  const tableBody = invoice.items.map(item => [
    item.reference || "",
    item.description,
    item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(2),
    fmtPrice(item.unitPrice),
    fmtPrice(item.total),
  ]);

  autoTable(doc, {
    startY: contentY,
    head: [["Référence", "Description", "Quantité", "Prix unitaire", "Prix total"]],
    body: tableBody,
    foot: [["", "", "", "Total TTC", fmtPrice(invoice.total)]],
    theme: "grid",
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 40], overflow: "linebreak", cellPadding: 3 },
    alternateRowStyles: { fillColor: [236, 250, 241] },
    footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 28, overflow: "linebreak" },
      1: { cellWidth: 74, overflow: "linebreak" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    tableWidth: 182,
    margin: { left: margin, right: margin },
  });

  const afterTableY = (doc as any).lastAutoTable.finalY + 8;

  // Notes / conditions
  let notesY = afterTableY;
  if (invoice.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(doc.splitTextToSize(`Notes : ${invoice.notes}`, pageW - margin * 2), margin, notesY);
    notesY += 10;
  }
  if (invoice.terms) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(doc.splitTextToSize(`Conditions : ${invoice.terms}`, pageW - margin * 2), margin, notesY);
  }

  // ─── MENTION PAIEMENT ────────────────────────────────────────────────────────
  const payY = (doc as any).lastAutoTable.finalY + (invoice.notes || invoice.terms ? 28 : 18);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, payY, pageW - margin * 2, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("Informations de paiement", margin + 3, payY + 6);
  doc.setFont("helvetica", "normal");
  if (company.iban) doc.text(`IBAN : ${company.iban}`, margin + 3, payY + 12);
  if (invoice.dueDate) doc.text(`Date d'échéance : ${new Date(invoice.dueDate).toLocaleDateString("fr-FR")}`, pageW - margin - 3, payY + 12, { align: "right" });

  // ─── FOOTER ──────────────────────────────────────────────────────────────────
  const footerLines: { text: string; bold: boolean; isEmail?: boolean }[] = [];
  if (company.name)    footerLines.push({ text: company.name, bold: true });
  if (company.address) footerLines.push({ text: company.address, bold: false });
  if (company.email)   footerLines.push({ text: `E-mail : ${company.email}`, bold: false, isEmail: true });
  if (company.siret)   footerLines.push({ text: `SIRET : ${company.siret}`, bold: false });

  const lineH = 5.5;
  const footerBlockH = footerLines.length * lineH + 6;
  let footerY = pageH - footerBlockH - 6;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageW - margin, footerY);
  footerY += 6;

  for (const line of footerLines) {
    doc.setFont("helvetica", line.bold ? "bold" : "normal");
    doc.setFontSize(9);
    if (line.isEmail) {
      doc.setTextColor(...GREEN);
      const tw = doc.getTextWidth(line.text);
      doc.textWithLink(line.text, (pageW - tw) / 2, footerY, { url: `mailto:${company.email}` });
    } else {
      doc.setTextColor(60, 60, 60);
      doc.text(line.text, pageW / 2, footerY, { align: "center" });
    }
    footerY += lineH;
  }

  doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
}
