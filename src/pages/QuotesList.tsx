
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, Plus, Eye, Mail, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuotesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const quotes = [
    { id: "DEV-001", client: "SARL Dupont", amount: 2850, status: "En attente", date: "15/03/2024", email: "contact@dupont.fr" },
    { id: "DEV-002", client: "Entreprise Martin", amount: 5200, status: "Accepté", date: "14/03/2024", email: "admin@martin.com" },
    { id: "DEV-003", client: "SAS Bernard", amount: 1650, status: "Refusé", date: "13/03/2024", email: "info@bernard.fr" },
    { id: "DEV-004", client: "EURL Petit", amount: 3100, status: "En attente", date: "12/03/2024", email: "contact@petit.com" },
    { id: "DEV-005", client: "SA Moreau", amount: 7500, status: "Accepté", date: "11/03/2024", email: "direction@moreau.fr" },
    { id: "DEV-006", client: "SARL Rousseau", amount: 2200, status: "En attente", date: "10/03/2024", email: "contact@rousseau.com" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepté":
        return "bg-accent text-accent-foreground";
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      case "Refusé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <FileText className="w-7 h-7" />
              Mes devis
            </h1>
            <p className="text-muted-foreground">Gérez tous vos devis en un seul endroit</p>
          </div>
          <Button 
            onClick={() => navigate("/create-quote")}
            className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Filtres</CardTitle>
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
                <SelectTrigger className="w-full sm:w-48 h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Accepté">Accepté</SelectItem>
                  <SelectItem value="Refusé">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="shadow-card hover:shadow-card-hover transition-all duration-200 border-0">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{quote.id}</CardTitle>
                    <CardDescription className="font-medium">{quote.client}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Montant:</span>
                  <span className="text-xl font-bold">{quote.amount.toLocaleString()}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{quote.date}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-1" />
                    Envoyer
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <Card className="shadow-card border-0">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun devis trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Aucun devis ne correspond à vos critères de recherche.
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
