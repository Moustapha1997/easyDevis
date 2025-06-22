import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, Plus, Eye, Mail, Trash, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes, useDeleteQuote } from "@/hooks/useQuotes";

const QuotesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: quotes, isLoading, error } = useQuotes();
  const deleteQuote = useDeleteQuote();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-semibold";
      case "sent":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold";
      case "rejected":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold";
      case "draft":
        return "bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold";
      case "expired":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepté";
      case "sent":
        return "Envoyé";
      case "rejected":
        return "Refusé";
      case "draft":
        return "Brouillon";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = quote.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12 bg-gray-50">
          <h3 className="text-lg font-medium mb-2 text-red-500">Erreur de chargement</h3>
          <p className="text-red-500">
            Impossible de charger les devis. Veuillez réessayer.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 text-indigo-600">
              <FileText className="w-7 h-7" />
              Mes devis
            </h1>
            <p className="text-cyan-700">Gérez tous vos devis en un seul endroit</p>
          </div>
          <Button 
            onClick={() => navigate("/create-quote")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0 bg-white border border-gray-200 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-600 font-bold">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par client ou numéro de devis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* VERSION LISTE MOBILE */}
        <div className="flex flex-col gap-2 sm:hidden mb-4">
          {filteredQuotes.length === 0 ? (
            <Card className="shadow-card border-0 bg-white border border-gray-200 shadow-md rounded-xl">
              <CardContent className="text-center py-8 text-xs">
                <FileText className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-semibold mx-auto mb-2" />
                <h3 className="text-base font-medium mb-1">Aucun devis trouvé</h3>
                <p className="text-muted-foreground mb-2">
                  {quotes?.length === 0 
                    ? "Vous n'avez pas encore créé de devis."
                    : "Aucun devis ne correspond à vos critères de recherche."
                  }
                </p>
                <Button onClick={() => navigate("/create-quote")}
                  className="w-full text-xs px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer votre premier devis
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote) => (
              <Card key={quote.id} className="shadow-card border-0 p-2 text-xs">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold flex items-center gap-2">
                      {quote.quote_number}
                      <Badge className={getStatusColor(quote.status) + ' ml-2'}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground font-medium">{quote.clients?.name}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700">Montant:</span>
                    <span className="font-bold">{quote.total.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700">Date:</span>
                    <span>{new Date(quote.issue_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-md" onClick={() => navigate(`/quotes/${quote.id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-md" onClick={() => toast.success('Devis envoyé par email !')}>
                      <Mail className="w-4 h-4 mr-1" />
                      Envoyer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md"
                      disabled={deleteQuote.status === 'pending'}
                      onClick={async () => {
                        if (window.confirm('Supprimer ce devis ? Cette action est irréversible.')) {
                          deleteQuote.mutate(quote.id);
                        }
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        {/* VERSION GRILLE DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 hidden sm:grid">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="shadow-card hover:shadow-card-hover transition-all duration-200 border-0">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-indigo-600 font-bold">{quote.quote_number}</CardTitle>
                    <CardDescription className="font-medium text-indigo-600">{quote.clients?.name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {getStatusLabel(quote.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">Montant:</span>
                  <span className="text-xl font-bold">{quote.total.toLocaleString()}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">Date:</span>
                  <span>{new Date(quote.issue_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/quotes/${quote.id}`)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success('Devis envoyé par email !')}>
                    <Mail className="w-4 h-4 mr-1" />
                    Envoyer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteQuote.status === 'pending'}
                    onClick={async () => {
                      if (window.confirm('Supprimer ce devis ? Cette action est irréversible.')) {
                        deleteQuote.mutate(quote.id);
                      }
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuotes.length === 0 && !isLoading && (
          <Card className="shadow-card border-0 bg-white border border-gray-200 shadow-md rounded-xl">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun devis trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {quotes?.length === 0 
                  ? "Vous n'avez pas encore créé de devis."
                  : "Aucun devis ne correspond à vos critères de recherche."
                }
              </p>
              <Button onClick={() => navigate("/create-quote")}>
                <Plus className="w-4 h-4 mr-2" />
                Créer votre premier devis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default QuotesList;
