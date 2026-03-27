import { useParams, useNavigate } from "react-router-dom";
import { useInvoices, useUpdateInvoiceStatus, Invoice } from "@/hooks/useInvoices";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Loader2, Receipt } from "lucide-react";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

const STATUS_COLORS: Record<string, string> = {
  unpaid:    "bg-orange-100 text-orange-700",
  paid:      "bg-green-100 text-green-700",
  overdue:   "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};
const STATUS_LABELS: Record<string, string> = {
  unpaid:    "Non payée",
  paid:      "Payée",
  overdue:   "En retard",
  cancelled: "Annulée",
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoices, isLoading, isFetching } = useInvoices();
  const updateStatus = useUpdateInvoiceStatus();

  const invoice = invoices?.find(i => i.id === id);
  const stillLoading = isLoading || isFetching || invoices === undefined;

  const handleDownload = () => {
    if (!invoice) return;
    let company = { name: "", subtitle: "", address: "", email: "", phone: "", siret: "", iban: "", logo: "" };
    try { const s = localStorage.getItem("companyInfo"); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}

    generateInvoicePDF({
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date ?? undefined,
      clientName: invoice.clients?.name ?? "",
      clientAddress: [invoice.clients?.address, invoice.clients?.postal_code, invoice.clients?.city].filter(Boolean).join(", "),
      items: (invoice.items ?? []).map(i => ({
        reference: i.reference ?? "",
        description: i.description ?? i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        total: Number(i.total),
      })),
      total: Number(invoice.total),
      status: invoice.status,
      notes: invoice.notes ?? undefined,
      terms: invoice.terms ?? undefined,
    }, company);
  };

  if (stillLoading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    </Layout>
  );

  if (!invoice) return (
    <Layout>
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Facture introuvable</p>
        <Button variant="outline" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux factures
        </Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Nav */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button onClick={() => navigate("/invoices")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Changer le statut */}
            <Select
              value={invoice.status}
              onValueChange={v => updateStatus.mutateAsync({ id: invoice.id, status: v as Invoice["status"] })}
            >
              <SelectTrigger className="h-9 w-36 rounded-xl text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Non payée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 rounded-xl h-9" onClick={handleDownload}>
              <Download className="w-4 h-4" /> Télécharger PDF
            </Button>
          </div>
        </div>

        {/* Aperçu facture */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 sm:p-8 font-sans">

          {/* En-tête */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              {(() => {
                let company = { name: "", subtitle: "", address: "", email: "", phone: "", logo: "" };
                try { const s = localStorage.getItem("companyInfo"); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}
                return (
                  <>
                    {company.logo && <img src={company.logo} alt="Logo" className="w-14 h-14 object-contain rounded" />}
                    <div>
                      {company.name && <p className="font-bold text-green-700 text-base">{company.name}</p>}
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
              <p className="text-sm font-semibold text-gray-700">Date : {new Date(invoice.issue_date).toLocaleDateString("fr-FR")}</p>
              {invoice.due_date && (
                <p className="text-xs text-gray-500 mt-0.5">Éch. : {new Date(invoice.due_date).toLocaleDateString("fr-FR")}</p>
              )}
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[invoice.status] ?? "bg-gray-100"}`}>
                {STATUS_LABELS[invoice.status] ?? invoice.status}
              </span>
            </div>
          </div>

          <hr className="border-gray-200 mb-5" />

          {/* Client */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-800">Nom client : {invoice.clients?.name}</p>
            {invoice.clients?.address && (
              <p className="text-xs text-gray-600 mt-0.5">
                Adresse : {[invoice.clients.address, invoice.clients.postal_code, invoice.clients.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-green-600 mb-5">FACTURE N°{invoice.invoice_number}</h2>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse mb-4 min-w-[500px]">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-3 py-2 text-left font-semibold">Référence</th>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                  <th className="px-3 py-2 text-center font-semibold">Qté</th>
                  <th className="px-3 py-2 text-right font-semibold">Prix unitaire</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items ?? []).map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? "bg-green-50" : "bg-white"}>
                    <td className="px-3 py-2 text-gray-600 border border-gray-100">{item.reference ?? ""}</td>
                    <td className="px-3 py-2 text-gray-700 border border-gray-100">{item.description ?? item.name}</td>
                    <td className="px-3 py-2 text-center text-gray-700 border border-gray-100">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-700 border border-gray-100">{Number(item.unit_price).toFixed(2)} €</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900 border border-gray-100">{Number(item.total).toFixed(2)} €</td>
                  </tr>
                ))}
                {(!invoice.items || invoice.items.length === 0) && (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400 italic">Aucune ligne</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} />
                  <td className="px-3 py-2 text-right font-bold text-gray-800">Total TTC</td>
                  <td className="px-3 py-2 text-right font-bold text-green-700 text-base">{Number(invoice.total).toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <div className="text-xs text-gray-500 space-y-1 mt-4">
              {invoice.notes && <p><span className="font-semibold">Notes :</span> {invoice.notes}</p>}
              {invoice.terms && <p><span className="font-semibold">Conditions :</span> {invoice.terms}</p>}
            </div>
          )}

          {/* Bloc paiement */}
          {(() => {
            let iban = "";
            try { const s = localStorage.getItem("companyInfo"); if (s) iban = JSON.parse(s).iban ?? ""; } catch {}
            if (!iban && !invoice.due_date) return null;
            return (
              <div className="mt-5 border border-green-200 rounded-xl p-3 bg-green-50 text-xs text-gray-700 flex justify-between flex-wrap gap-2">
                {iban && <span><span className="font-semibold">IBAN :</span> {iban}</span>}
                {invoice.due_date && <span><span className="font-semibold">Échéance :</span> {new Date(invoice.due_date).toLocaleDateString("fr-FR")}</span>}
              </div>
            );
          })()}

          {/* Footer */}
          {(() => {
            let company = { name: "", address: "", email: "", siret: "", iban: "" };
            try { const s = localStorage.getItem("companyInfo"); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}
            const parts = [company.name, company.address, company.email ? `E-mail : ${company.email}` : "", company.siret ? `SIRET : ${company.siret}` : ""].filter(Boolean);
            if (!parts.length) return null;
            return (
              <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 space-y-0.5">
                {parts.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            );
          })()}
        </div>

      </div>
    </Layout>
  );
};

export default InvoiceDetail;
