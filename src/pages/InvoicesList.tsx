import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Receipt, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInvoices, useDeleteInvoice, Invoice } from "@/hooks/useInvoices";

const STATUS: Record<string, { label: string; bg: string }> = {
  unpaid:    { label: "Non payée", bg: "bg-orange-100 text-orange-700" },
  paid:      { label: "Payée",     bg: "bg-green-100 text-green-700" },
  overdue:   { label: "En retard", bg: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulée",  bg: "bg-gray-100 text-gray-500" },
};

const FILTERS = [
  { value: "all",       label: "Toutes" },
  { value: "unpaid",    label: "Non payée" },
  { value: "paid",      label: "Payée" },
  { value: "overdue",   label: "En retard" },
  { value: "cancelled", label: "Annulée" },
];

const InvoicesList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: invoices, isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  const filtered = (invoices ?? []).filter(inv => {
    const matchSearch =
      inv.clients?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette facture ?")) return;
    await deleteInvoice.mutateAsync(id);
  };

  if (isLoading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes factures</h1>
            <p className="text-sm text-gray-400 mt-0.5">{invoices?.length ?? 0} facture{(invoices?.length ?? 0) !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par client ou numéro..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-gray-100 rounded-xl text-sm"
          />
        </div>

        {/* Filtres pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                filter === f.value
                  ? "bg-green-600 text-white shadow-sm shadow-green-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Aucune facture</p>
            <p className="text-gray-400 text-sm mt-1">Convertissez un devis accepté en facture</p>
            <Button onClick={() => navigate("/quotes")} className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl">
              Voir mes devis
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(inv => {
              const s = STATUS[inv.status] ?? { label: inv.status, bg: "bg-gray-100 text-gray-600" };
              return (
                <div
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-green-100 transition-all active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {inv.clients?.name ?? "Client inconnu"}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      N°{inv.invoice_number} · {new Date(inv.issue_date).toLocaleDateString("fr-FR")}
                      {inv.due_date && ` · Éch. ${new Date(inv.due_date).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{Number(inv.total).toLocaleString()} €</p>
                    <button
                      onClick={e => handleDelete(inv.id, e)}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoicesList;
