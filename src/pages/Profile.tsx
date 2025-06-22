import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Layout } from "@/components/Layout";

export default function Profile() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pour Supabase : updateUser pour changer le mot de passe
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const { error } = await window.supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour");
      setPassword("");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">Email</label>
                <Input value={user?.email || ""} disabled />
              </div>
              <div>
                <label className="block mb-1 text-sm">Nouveau mot de passe</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading || !password}>Enregistrer</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
