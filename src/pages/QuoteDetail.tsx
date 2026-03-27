import { useParams, useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Pencil, Loader2, Receipt } from "lucide-react";
import { generateQuotePDF } from "@/lib/generatePDF";
import { toast } from "sonner";
import { useState } from "react";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConverting, setIsConverting] = useState(false);

  const quote = quotes?.find(q => q.id === id);

  const handleConvertToInvoice = async () => {
    if (!quote || !user) return;
    setIsConverting(true);
    try {
      const today = new Date();
      const invoiceNumber = `FAC-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;
      const dueDate = new Date(today); dueDate.setDate(dueDate.getDate() + 30);

      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert([{
          user_id: user.id,
          client_id: quote.client_id,
          quote_id: quote.id,
          invoice_number: invoiceNumber,
          status: "unpaid",
          issue_date: today.toISOString().split("T")[0],
          due_date: dueDate.toISOString().split("T")[0],
          subtotal: quote.subtotal,
          tax_rate: quote.tax_rate ?? 0,
          tax_amount: quote.tax_amount ?? 0,
          total: quote.total,
          notes: quote.notes,
          terms: quote.terms,
        }])
        .select()
        .single();
      if (invErr) throw invErr;

      const items = (quote.items ?? []).map(i => ({
        invoice_id: inv.id,
        reference: i.reference ?? null,
        name: i.description ?? i.name,
        description: i.description ?? i.name,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        total: Number(i.total),
      }));
      if (items.length > 0) {
        const { error: iErr } = await supabase.from("invoice_items").insert(items);
        if (iErr) throw iErr;
      }

      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture créée !");
      navigate(`/invoices/${inv.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de la conversion");
    } finally {
      setIsConverting(false);
    }
  };

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
      clientAddress: [quote.clients?.address, quote.clients?.postal_code, quote.clients?.city].filter(Boolean).join(", "),
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
      {/* Padding bottom mobile pour la barre fixe */}
      <div className="max-w-3xl mx-auto space-y-5 pb-24 sm:pb-0">

        {/* Nav desktop uniquement */}
        <div className="hidden sm:flex items-center justify-between">
          <button onClick={() => navigate("/quotes")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl h-9" onClick={() => navigate(`/create-quote?id=${quote.id}`)}>
              <Pencil className="w-4 h-4" /> Modifier
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl h-9 border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleConvertToInvoice}
              disabled={isConverting}
            >
              {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              Convertir en facture
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl h-9" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" /> Télécharger PDF
            </Button>
          </div>
        </div>

        {/* Retour mobile */}
        <button onClick={() => navigate("/quotes")} className="flex sm:hidden items-center gap-1 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Retour aux devis
        </button>

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
            <p className="text-sm font-bold text-gray-800">Nom client : {quote.clients?.name}</p>
            {(quote.clients?.address || quote.clients?.postal_code || quote.clients?.city) && (
              <p className="text-sm text-gray-600 mt-0.5">
                Adresse : {[quote.clients?.address, quote.clients?.postal_code, quote.clients?.city].filter(Boolean).join(", ")}
              </p>
            )}
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

      {/* ── Barre fixe mobile ───────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 px-3 py-2.5 grid grid-cols-3 gap-2 shadow-lg">
        {/* Modifier */}
        <button
          onClick={() => navigate(`/create-quote?id=${quote.id}`)}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
          <span className="text-[10px] font-semibold text-gray-600">Modifier</span>
        </button>

        {/* Convertir en facture */}
        <button
          onClick={handleConvertToInvoice}
          disabled={isConverting}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-40"
        >
          {isConverting
            ? <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
            : <Receipt className="w-4 h-4 text-green-600" />
          }
          <span className="text-[10px] font-semibold text-green-700">Facture</span>
        </button>

        {/* Télécharger PDF */}
        <button
          onClick={handleDownloadPDF}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4 text-white" />
          <span className="text-[10px] font-semibold text-white">PDF</span>
        </button>
      </div>

    </Layout>
  );
};

export default QuoteDetail;
