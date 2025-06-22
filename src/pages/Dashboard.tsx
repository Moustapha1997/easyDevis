
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Euro, Users, Plus, Eye, Loader, Settings, User, HelpCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { user } = useAuth();

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

  // Le return principal doit être dans le même bloc de fonction
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Message de bienvenue */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : user?.email ? `, ${user.email}` : ''} ! Voici un aperçu de votre activité.
            </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className={`shadow-card border-0 ${stat.bgColor}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" /> {stat.title}
                </CardTitle>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activité récente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Devis modifiés */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Derniers devis modifiés
              </CardTitle>
              <CardDescription>Vos derniers devis créés ou modifiés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quotes && quotes.length > 0 ? (
                  quotes.slice(0, 3).map((quote) => {
                    return (
                      <div key={quote.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{quote.clients?.name || 'Client inconnu'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quote.updated_at || quote.issue_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-semibold">{quote.total.toLocaleString()}€</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getStatusColor(quote.status)}`}>
                            {getStatusLabel(quote.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Aucun devis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Nouveaux clients */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Nouveaux clients
              </CardTitle>
              <CardDescription>Derniers clients ajoutés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients && clients.length > 0 ? (
                  clients.slice(0, 3).map((client) => {
                    return (
                      <div key={client.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email || '—'}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Aucun client</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes & Raccourcis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bloc Alertes */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" /> Alertes
              </CardTitle>
              <CardDescription>Points à surveiller</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-yellow-700">
                  {quotes?.filter(q => q.status === 'sent').length || 0}
                </span>
                <span>devis à relancer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-700">
                  {quotes?.filter(q => q.status === 'expired').length || 0}
                </span>
                <span>devis expirés</span>
              </div>
            </CardContent>
          </Card>

          {/* Bloc Raccourcis */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Raccourcis
              </CardTitle>
              <CardDescription>Accès rapide aux paramètres</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <Button variant="outline" onClick={() => navigate('/profile')} className="flex-1 min-w-[120px]">
                <User className="w-4 h-4 mr-2" /> Profil
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')} className="flex-1 min-w-[120px]">
                <Settings className="w-4 h-4 mr-2" /> Paramètres
              </Button>
              <Button variant="outline" onClick={() => window.open('https://easydevis-docs.example.com', '_blank')} className="flex-1 min-w-[120px]">
                <HelpCircle className="w-4 h-4 mr-2" /> Aide
              </Button>
            </CardContent>
          </Card>
        </div>


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
