import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Upload } from "lucide-react";

const defaultCompany = {
  name: '',
  subtitle: '',
  address: '',
  siret: '',
  email: '',
  phone: '',
  iban: '',
  logo: '',
};

export default function Settings() {
  const [company, setCompany] = useState(() => {
    const stored = localStorage.getItem('companyInfo');
    return stored ? { ...defaultCompany, ...JSON.parse(stored) } : defaultCompany;
  });

  const handleChange = (field: string, value: string) => {
    const updated = { ...company, [field]: value };
    setCompany(updated);
    localStorage.setItem('companyInfo', JSON.stringify(updated));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleChange('logo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('companyInfo', JSON.stringify(company));
    toast.success("Informations enregistrées");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Paramètres de l'entreprise</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ces informations apparaissent sur tous vos devis</p>
        </div>

        <Card className="border border-gray-100 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">

              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                  {company.logo
                    ? <img src={company.logo} alt="Logo" className="w-full h-full object-contain" />
                    : <Upload className="w-6 h-6 text-gray-400" />
                  }
                </div>
                <div>
                  <Label className="text-sm font-medium">Logo de l'entreprise</Label>
                  <p className="text-xs text-gray-400 mb-2">PNG, JPG recommandé</p>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="h-8 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs text-gray-600">Nom de l'entreprise *</Label>
                  <Input
                    value={company.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Ex: WALO SERVICES"
                    className="h-9 font-bold text-blue-600 placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs text-gray-600">Activité / Sous-titre</Label>
                  <Input
                    value={company.subtitle}
                    onChange={e => handleChange('subtitle', e.target.value)}
                    placeholder="Ex: Prestataire de services"
                    className="h-9 text-blue-500 placeholder:text-gray-400"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs text-gray-600">Adresse complète</Label>
                  <Input
                    value={company.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Ex: 3 rue Labat 75018 Paris"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Email</Label>
                  <Input
                    type="email"
                    value={company.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="contact@example.com"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Téléphone</Label>
                  <Input
                    value={company.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="06 00 00 00 00"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">SIRET</Label>
                  <Input
                    value={company.siret}
                    onChange={e => handleChange('siret', e.target.value)}
                    placeholder="94 16 28 74 50 00 15"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">IBAN</Label>
                  <Input
                    value={company.iban}
                    onChange={e => handleChange('iban', e.target.value)}
                    placeholder="FR76 3000 7400 0213 0034 658"
                    className="h-9"
                  />
                </div>
              </div>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Enregistrer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
