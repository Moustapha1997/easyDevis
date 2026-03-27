
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Euro, Users, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { label: string; className: string }> = {
  accepted: { label: "Accepté",   className: "bg-green-50 text-green-700" },
  sent:     { label: "Envoyé",    className: "bg-blue-50 text-blue-700" },
  rejected: { label: "Refusé",    className: "bg-red-50 text-red-700" },
  draft:    { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  expired:  { label: "Expiré",    className: "bg-orange-50 text-orange-700" },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { user } = useAuth();

  const totalQuotes = quotes?.length ?? 0;
  const acceptedQuotes = quotes?.filter(q => q.status === "accepted").length ?? 0;
  const acceptanceRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const totalRevenue = quotes?.filter(q => q.status === "accepted").reduce((s, q) => s + q.total, 0) ?? 0;
  const activeClients = clients?.length ?? 0;

  const stats = [
    { title: "Total devis",       value: totalQuotes,                         icon: FileText,   color: "text-blue-600",   bg: "bg-blue-50" },
    { title: "Taux d'acceptation",value: `${acceptanceRate}%`,                icon: TrendingUp, color: "text-green-600",  bg: "bg-green-50" },
    { title: "Revenus estimés",   value: `${totalRevenue.toLocaleString()} €`,icon: Euro,       color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Clients",           value: activeClients,                       icon: Users,      color: "text-orange-600", bg: "bg-orange-50" },
  ];

  if (quotesLoading || clientsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Bonjour{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Voici un aperçu de votre activité</p>
          </div>
          <Button onClick={() => navigate("/create-quote")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className="border border-gray-100 shadow-none">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent quotes */}
          <Card className="border border-gray-100 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Devis récents</CardTitle>
                <button
                  onClick={() => navigate("/quotes")}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {quotes && quotes.length > 0 ? (
                quotes.slice(0, 5).map((quote) => {
                  const cfg = statusConfig[quote.status] ?? { label: quote.status, className: "bg-gray-100 text-gray-600" };
                  return (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                      onClick={() => navigate(`/quotes/${quote.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{quote.clients?.name ?? "Client inconnu"}</p>
                        <p className="text-xs text-gray-400">{new Date(quote.issue_date).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{quote.total.toLocaleString()} €</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Aucun devis pour le moment</p>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border border-gray-100 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Créer un nouveau devis", desc: "Démarrer un devis vierge", icon: Plus,     path: "/create-quote", primary: true },
                { label: "Gérer les clients",      desc: "Ajouter ou modifier",       icon: Users,    path: "/clients",       primary: false },
                { label: "Gérer les produits",     desc: "Catalogue de services",     icon: FileText, path: "/products",      primary: false },
              ].map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    a.primary
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <a.icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className={`text-xs ${a.primary ? "text-blue-200" : "text-gray-400"}`}>{a.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Alerts row */}
        {(quotes?.filter(q => q.status === "sent").length ?? 0) > 0 || (quotes?.filter(q => q.status === "expired").length ?? 0) > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-yellow-100 bg-yellow-50 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-yellow-700">{quotes?.filter(q => q.status === "sent").length ?? 0}</span>
                <p className="text-sm text-yellow-700">devis en attente de réponse</p>
              </CardContent>
            </Card>
            <Card className="border border-red-100 bg-red-50 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-red-600">{quotes?.filter(q => q.status === "expired").length ?? 0}</span>
                <p className="text-sm text-red-600">devis expirés</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

      </div>
    </Layout>
  );
};

export default Dashboard;
