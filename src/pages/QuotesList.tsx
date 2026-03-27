import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Loader2, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes, useDeleteQuote } from "@/hooks/useQuotes";

const STATUS = {
  accepted: { label: "Accepté",   bg: "bg-green-100 text-green-700" },
  sent:     { label: "Envoyé",    bg: "bg-blue-100 text-blue-700" },
  rejected: { label: "Refusé",    bg: "bg-red-100 text-red-700" },
  draft:    { label: "Brouillon", bg: "bg-gray-100 text-gray-600" },
  expired:  { label: "Expiré",    bg: "bg-orange-100 text-orange-700" },
};

const FILTERS = [
  { value: "all",      label: "Tous" },
  { value: "draft",    label: "Brouillon" },
  { value: "sent",     label: "Envoyé" },
  { value: "accepted", label: "Accepté" },
  { value: "rejected", label: "Refusé" },
  { value: "expired",  label: "Expiré" },
];

const QuotesList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: quotes, isLoading } = useQuotes();
  const deleteQuote = useDeleteQuote();

  const filtered = (quotes ?? []).filter(q => {
    const matchSearch = q.clients?.name.toLowerCase().includes(search.toLowerCase()) ||
                        q.quote_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce devis ?")) return;
    await deleteQuote.mutateAsync(id);
    toast.success("Devis supprimé");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes devis</h1>
            <p className="text-sm text-gray-400 mt-0.5">{quotes?.length ?? 0} devis au total</p>
          </div>
          <Button
            onClick={() => navigate("/create-quote")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 gap-1.5 px-4 shadow-sm shadow-blue-200 hidden sm:flex"
          >
            <Plus className="w-4 h-4" /> Nouveau
          </Button>
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

        {/* Filtres pills — scroll horizontal sur mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                statusFilter === f.value
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
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
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Aucun devis trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Créez votre premier devis</p>
            <Button
              onClick={() => navigate("/create-quote")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" /> Créer un devis
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((quote) => {
              const s = STATUS[quote.status as keyof typeof STATUS] ?? { label: quote.status, bg: "bg-gray-100 text-gray-600" };
              return (
                <div
                  key={quote.id}
                  onClick={() => navigate(`/quotes/${quote.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-blue-100 transition-all active:scale-[0.99]"
                >
                  {/* Icône */}
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {quote.clients?.name ?? "Client inconnu"}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      N°{quote.quote_number} · {new Date(quote.issue_date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Montant + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{Number(quote.total).toLocaleString()} €</p>
                    <button
                      onClick={e => handleDelete(quote.id, e)}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0"
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

      {/* FAB mobile */}
      <button
        onClick={() => navigate("/create-quote")}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-300 flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>
    </Layout>
  );
};

export default QuotesList;
