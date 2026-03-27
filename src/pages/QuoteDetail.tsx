import { useParams, useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Pencil, Loader2 } from "lucide-react";
import { generateQuotePDF } from "@/lib/generatePDF";

const statusColors: Record<string, string> = {
  draft:    "bg-gray-100 text-gray-600",
  sent:     "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  expired:  "bg-orange-50 text-orange-700",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon", sent: "Envoyé", accepted: "Accepté", rejected: "Refusé", expired: "Expiré",
};

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotes, isLoading, isFetching } = useQuotes();

  const quote = quotes?.find(q => q.id === id);

  // Afficher le spinner tant que les données ne sont pas arrivées
  const stillLoading = isLoading || isFetching || (quotes === undefined);

  const handleDownloadPDF = () => {
    if (!quote) return;
    let company = { name:'', subtitle:'', address:'', email:'', phone:'', siret:'', iban:'', logo:'' };
    try { const s = localStorage.getItem('companyInfo'); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}

    generateQuotePDF({
      quoteNumber: quote.quote_number,
      issueDate: quote.issue_date,
      clientName: quote.clients?.name ?? "",
      items: (quote.items ?? []).map(i => ({
        reference: i.reference ?? "",
        description: i.description ?? i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        total: Number(i.total),
      })),
      total: quote.total,
      notes: quote.notes ?? undefined,
      terms: quote.terms ?? undefined,
    }, company);
  };

  if (stillLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }

  if (!quote) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Devis introuvable</p>
          <p className="text-xs text-gray-400 mb-4">L'identifiant ne correspond à aucun devis de votre compte.</p>
          <Button variant="outline" onClick={() => navigate("/quotes")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux devis
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/quotes")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/create-quote?id=${quote.id}`)}>
              <Pencil className="w-4 h-4" /> Modifier
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" /> Télécharger PDF
            </Button>
          </div>
        </div>

        {/* Aperçu du devis — style fidèle au PDF */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 font-sans">

          {/* En-tête */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              {(() => {
                let company = { name:'', subtitle:'', address:'', email:'', phone:'', logo:'' };
                try { const s = localStorage.getItem('companyInfo'); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}
                return (
                  <>
                    {company.logo && (
                      <img src={company.logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
                    )}
                    <div>
                      {company.name && <p className="font-bold text-teal-700 text-base">{company.name}</p>}
                      {company.subtitle && <p className="text-xs text-gray-500">{company.subtitle}</p>}
                      {company.address && <p className="text-xs text-gray-600 mt-1">{company.address}</p>}
                      {company.email && <p className="text-xs text-gray-600">{company.email}</p>}
                      {company.phone && <p className="text-xs text-gray-600">Tel : {company.phone}</p>}
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Date : {new Date(quote.issue_date).toLocaleDateString('fr-FR')}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[quote.status] ?? "bg-gray-100 text-gray-600"}`}>
                {statusLabels[quote.status] ?? quote.status}
              </span>
            </div>
          </div>

          <hr className="border-gray-200 mb-5" />

          {/* Client */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-800">Nom client : {quote.clients?.name}</p>
          </div>

          {/* Titre devis */}
          <h2 className="text-2xl font-bold text-blue-600 mb-5">DEVIS N°{quote.quote_number}</h2>

          {/* Tableau */}
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-3 py-2 text-left font-semibold">Référence</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-center font-semibold">Quantité</th>
                <th className="px-3 py-2 text-right font-semibold">Prix unitaire</th>
                <th className="px-3 py-2 text-right font-semibold">Prix total</th>
              </tr>
            </thead>
            <tbody>
              {(quote.items ?? []).map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="px-3 py-2 text-gray-700 border border-gray-100">{item.reference ?? ""}</td>
                  <td className="px-3 py-2 text-gray-700 border border-gray-100">{item.description ?? item.name}</td>
                  <td className="px-3 py-2 text-center text-gray-700 border border-gray-100">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-gray-700 border border-gray-100">{Number(item.unit_price).toLocaleString('fr-FR')}€</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 border border-gray-100">{Number(item.total).toLocaleString('fr-FR')} €</td>
                </tr>
              ))}
              {(!quote.items || quote.items.length === 0) && (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400 italic">Aucune ligne</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} />
                <td className="px-3 py-2 text-right font-bold text-gray-800">Total TTC</td>
                <td className="px-3 py-2 text-right font-bold text-gray-900">{Number(quote.total).toLocaleString('fr-FR')}€</td>
              </tr>
            </tfoot>
          </table>

          {/* Notes */}
          {(quote.notes || quote.terms) && (
            <div className="text-xs text-gray-500 space-y-1 mt-4">
              {quote.notes && <p><span className="font-semibold">Notes :</span> {quote.notes}</p>}
              {quote.terms && <p><span className="font-semibold">Conditions :</span> {quote.terms}</p>}
            </div>
          )}

          {/* Footer entreprise */}
          {(() => {
            let company = { name:'', address:'', email:'', siret:'', iban:'' };
            try { const s = localStorage.getItem('companyInfo'); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}
            const parts = [company.name, company.address, company.email ? `E-mail : ${company.email}` : '', company.siret ? `SIRET : ${company.siret}` : '', company.iban ? `IBAN : ${company.iban}` : ''].filter(Boolean);
            if (!parts.length) return null;
            return (
              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                {parts.join('  |  ')}
              </div>
            );
          })()}
        </div>

      </div>
    </Layout>
  );
};

export default QuoteDetail;
