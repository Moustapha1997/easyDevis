
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/register
    toast.success(isLogin ? "Connexion réussie !" : "Compte créé avec succès !");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">EasyDevis</h1>
          <p className="text-muted-foreground">Créez et gérez vos devis facilement</p>
        </div>

        <Card className="shadow-card-hover border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              {isLogin ? "Connexion" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Connectez-vous à votre compte pour continuer" 
                : "Créez votre compte pour commencer"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <Button type="submit" className="w-full h-11 font-medium">
                {isLogin ? "Se connecter" : "Créer le compte"}
              </Button>
            </form>

            <div className="space-y-4">
              <Separator />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80"
                >
                  {isLogin ? "Créer un compte" : "Se connecter"}
                </Button>
              </div>
              
              {isLogin && (
                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground">
                    Mot de passe oublié ?
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
