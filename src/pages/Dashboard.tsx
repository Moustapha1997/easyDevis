
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Euro, Users, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total des devis",
      value: "156",
      description: "+12% ce mois",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Taux d'acceptation",
      value: "68%",
      description: "+5% ce mois",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenus estimés",
      value: "42 850€",
      description: "+18% ce mois",
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Clients actifs",
      value: "89",
      description: "+7 nouveaux",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentQuotes = [
    { id: 1, client: "SARL Dupont", amount: "2 850€", status: "En attente", date: "15/03/2024" },
    { id: 2, client: "Entreprise Martin", amount: "5 200€", status: "Accepté", date: "14/03/2024" },
    { id: 3, client: "SAS Bernard", amount: "1 650€", status: "Refusé", date: "13/03/2024" },
    { id: 4, client: "EURL Petit", amount: "3 100€", status: "En attente", date: "12/03/2024" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepté":
        return "bg-accent/10 text-accent border-accent/20";
      case "En attente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Refusé":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

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
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{quote.client}</p>
                      <p className="text-sm text-muted-foreground">{quote.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">{quote.amount}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                ))}
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
