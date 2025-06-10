
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Euro, Users, Plus, Eye, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: clients, isLoading: clientsLoading } = useClients();

  // Calculate stats from real data
  const totalQuotes = quotes?.length || 0;
  const acceptedQuotes = quotes?.filter(q => q.status === 'accepted').length || 0;
  const acceptanceRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const totalRevenue = quotes?.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0) || 0;
  const activeClients = clients?.length || 0;

  const stats = [
    {
      title: "Total des devis",
      value: totalQuotes.toString(),
      description: `${totalQuotes} devis créés`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Taux d'acceptation",
      value: `${acceptanceRate}%`,
      description: `${acceptedQuotes} devis acceptés`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenus estimés",
      value: `${totalRevenue.toLocaleString()}€`,
      description: "Devis acceptés",
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Clients actifs",
      value: activeClients.toString(),
      description: `${activeClients} clients`,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Get recent quotes (last 4)
  const recentQuotes = quotes?.slice(0, 4) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-accent/10 text-accent border-accent/20";
      case "sent":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "draft":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "expired":
        return "bg-gray-50 text-gray-700 border-gray-200";
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

  if (quotesLoading || clientsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue sur EasyDevis, voici un aperçu de votre activité</p>
          </div>
          <Button 
            onClick={() => navigate("/create-quote")}
            className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-card-hover transition-all duration-200 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Quotes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Devis récents
              </CardTitle>
              <CardDescription>
                Vos derniers devis créés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQuotes.length > 0 ? (
                  recentQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{quote.clients?.name || 'Client inconnu'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">{quote.total.toLocaleString()}€</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Aucun devis créé pour le moment</p>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/quotes")}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir tous les devis
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Accédez rapidement aux fonctionnalités principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate("/create-quote")}
                className="w-full justify-start h-12 text-left"
                variant="outline"
              >
                <Plus className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Créer un nouveau devis</div>
                  <div className="text-sm text-muted-foreground">Démarrer un nouveau devis</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate("/clients")}
                className="w-full justify-start h-12 text-left"
                variant="outline"
              >
                <Users className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Gérer les clients</div>
                  <div className="text-sm text-muted-foreground">Ajouter ou modifier des clients</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate("/products")}
                className="w-full justify-start h-12 text-left"
                variant="outline"
              >
                <FileText className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Gérer les produits</div>
                  <div className="text-sm text-muted-foreground">Ajouter ou modifier des produits</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
