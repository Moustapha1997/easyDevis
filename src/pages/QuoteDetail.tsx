import { useParams, useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotes, isLoading } = useQuotes();

  const quote = quotes?.find(q => q.id === id);

  const handleDownloadPDF = (quote: any) => {
    const doc = new jsPDF();
    let y = 15;

    // Récupère les infos société (localStorage)
    let company = {
      name: '', address: '', siret: '', email: '', phone: '', logo: '', footer: ''
    };
    try {
      const stored = localStorage.getItem('companyInfo');
      if (stored) company = JSON.parse(stored);
    } catch {}

    // Logo
    if (company.logo) {
      try {
        doc.addImage(company.logo, 'PNG', 10, y, 32, 32);
      } catch (e) {/* ignore logo if error */}
    }

    // Entête société
    doc.setFontSize(12);
    let companyInfoY = y;
    if (company.name) { doc.text(company.name, 45, companyInfoY); companyInfoY += 7; }
    if (company.address) { doc.text(company.address, 45, companyInfoY); companyInfoY += 7; }
    if (company.siret) { doc.text(`SIRET : ${company.siret}`, 45, companyInfoY); companyInfoY += 7; }
    if (company.email) { doc.text(`Email : ${company.email}`, 45, companyInfoY); companyInfoY += 7; }
    if (company.phone) { doc.text(`Téléphone : ${company.phone}`, 45, companyInfoY); companyInfoY += 7; }
    y = Math.max(companyInfoY, y + 32) + 10;

    // Infos devis et client
    doc.setFontSize(15);
    doc.text(`DEVIS ${quote.quote_number}`, 10, y); y += 10;
    doc.setFontSize(12);
    doc.text(`Client : ${quote.clients?.name || ''}`, 10, y); y += 7;
    doc.text(`Date : ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, 10, y); y += 7;
    doc.text(`Statut : ${quote.status}`, 10, y); y += 7;

    // Tableau des lignes
    let body = [];
    if (quote.items && Array.isArray(quote.items) && quote.items.length > 0) {
      body = quote.items.map((item: any) => [
        item.description,
        item.quantity,
        (item.unit_price ?? item.unitPrice ?? 0).toFixed(2) + '€',
        (item.total ?? ((item.quantity || 0) * (item.unit_price ?? item.unitPrice ?? 0))).toFixed(2) + '€',
      ]);
    }
    autoTable(doc, {
      startY: y + 5,
      head: [['Description', 'Quantité', 'PU HT', 'Total HT']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 11 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Totaux
    doc.setFontSize(12);
    doc.text(`Sous-total HT : ${(quote.subtotal ?? 0).toFixed(2)}€`, 10, y); y += 7;
    doc.text(`TVA (${quote.tax_rate ?? 20}%): ${(quote.tax_amount ?? 0).toFixed(2)}€`, 10, y); y += 7;
    doc.setFontSize(13);
    doc.text(`Total TTC : ${(quote.total ?? 0).toFixed(2)}€`, 10, y); y += 10;

    // Notes et conditions
    doc.setFontSize(11);
    if (quote.notes) {
      doc.text(doc.splitTextToSize('Notes : ' + quote.notes, 180), 10, y); y += 7 + Math.floor((quote.notes.length || 0) / 80) * 5;
    }
    if (quote.terms) {
      doc.text(doc.splitTextToSize('Conditions : ' + quote.terms, 180), 10, y); y += 7 + Math.floor((quote.terms.length || 0) / 80) * 5;
    }

    // Section signature (alignée à droite)
    y += 20;
    doc.setDrawColor(150);
    // Ligne signature à droite
    doc.line(120, y, 190, y);
    y += 6;
    doc.setFontSize(11);
    doc.text("Signature et cachet de l'entreprise", 190, y, { align: "right" });
    y += 8;
    doc.setFontSize(10);
    doc.text("Nom, fonction et signature", 190, y, { align: "right" });

    // Pied de page personnalisé sur chaque page, bien positionné
    const footer = company.footer || '';
    const pageCount = doc.internal.getNumberOfPages ? doc.internal.getNumberOfPages() : (doc as any).getNumberOfPages?.() || 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      const footerLines = doc.splitTextToSize(footer, 180);
      let footerY = 287;
      // Si le footer est long, on remonte pour ne pas couper
      if (footerLines.length > 1) {
        footerY = 287 - (footerLines.length - 1) * 5;
      }
      doc.text(footerLines, 10, footerY);
    }

    doc.save(`Devis_${quote.quote_number}.pdf`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!quote) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Devis introuvable</h3>
          <p className="text-muted-foreground mb-4">Aucun devis ne correspond à cet identifiant.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 animate-fade-in">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Devis {quote.quote_number}</CardTitle>
            <CardDescription>Client : {quote.clients?.name}</CardDescription>
            <div className="text-muted-foreground text-sm mt-2">Émis le : {new Date(quote.issue_date).toLocaleDateString('fr-FR')}</div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => handleDownloadPDF(quote)}>
                Télécharger PDF
              </Button>
              <Button variant="default" onClick={() => navigate(`/create-quote?id=${quote.id}`)}>
                Modifier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between gap-2">
              <div>
                <div className="font-semibold">Montant total :</div>
                <div className="text-xl font-bold">{quote.total.toLocaleString()} €</div>
              </div>
              <div>
                <div className="font-semibold">Statut :</div>
                <div className="capitalize">{quote.status}</div>
              </div>
            </div>
            {/* Ajoute ici plus de détails (lignes, notes, etc.) si disponibles dans le modèle */}
            {quote.notes && (
              <div>
                <div className="font-semibold mb-1">Notes :</div>
                <div className="bg-muted p-2 rounded text-sm">{quote.notes}</div>
              </div>
            )}
            {/* Ajoute d'autres champs comme conditions, lignes, etc. */}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QuoteDetail;
