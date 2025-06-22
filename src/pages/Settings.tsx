import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const defaultCompany = {
  name: '',
  address: '',
  siret: '',
  email: '',
  phone: '',
  logo: '',
  footer: ''
};

import { Layout } from "@/components/Layout";

export default function Settings() {
  const [company, setCompany] = useState(() => {
    const stored = localStorage.getItem('companyInfo');
    return stored ? JSON.parse(stored) : defaultCompany;
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    const updated = { ...company, [field]: value };
    setCompany(updated);
    localStorage.setItem('companyInfo', JSON.stringify(updated));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Informations d'entreprise enregistrées");
      setLoading(false);
    }, 800);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input placeholder="Nom de l'entreprise" value={company.name} onChange={e => handleChange('name', e.target.value)} />
              <Input placeholder="Adresse" value={company.address} onChange={e => handleChange('address', e.target.value)} />
              <Input placeholder="SIRET" value={company.siret} onChange={e => handleChange('siret', e.target.value)} />
              <Input placeholder="Email" value={company.email} onChange={e => handleChange('email', e.target.value)} />
              <Input placeholder="Téléphone" value={company.phone} onChange={e => handleChange('phone', e.target.value)} />
              <Input placeholder="Pied de page personnalisé" value={company.footer} onChange={e => handleChange('footer', e.target.value)} />
              <Button type="submit" disabled={loading}>Enregistrer</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
