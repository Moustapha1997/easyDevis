
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, FileText, Save, Mail, Download } from "lucide-react";
import { toast } from "sonner";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const CreateQuote = () => {
  const [client, setClient] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const addNewItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.20;
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;

  const handleSave = () => {
    toast.success("Devis sauvegardé avec succès !");
  };

  const handleSendEmail = () => {
    toast.success("Devis envoyé par email !");
  };

  const handleGeneratePDF = () => {
    toast.success("PDF généré avec succès !");
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Plus className="w-7 h-7" />
              Créer un devis
            </h1>
            <p className="text-muted-foreground">Créez un nouveau devis personnalisé</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
                <CardDescription>Sélectionnez ou créez un nouveau client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select value={client} onValueChange={setClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarl-dupont">SARL Dupont</SelectItem>
                        <SelectItem value="entreprise-martin">Entreprise Martin</SelectItem>
                        <SelectItem value="sas-bernard">SAS Bernard</SelectItem>
                        <SelectItem value="nouveau">+ Nouveau client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date du devis</Label>
                    <Input type="date" id="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Items */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Éléments du devis</CardTitle>
                <CardDescription>Ajoutez les produits ou services à facturer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quoteItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="sm:col-span-5">
                      <Label>Description</Label>
                      <Input
                        placeholder="Description du produit/service"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Prix unitaire</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Total</Label>
                      <Input
                        value={`${item.total.toFixed(2)}€`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={quoteItems.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={addNewItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Informations complémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes et conditions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Conditions de paiement, délais de livraison, etc."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-card border-0 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Aperçu du devis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total HT:</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%):</span>
                    <span className="font-medium">{vatAmount.toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span>{totalAmount.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button onClick={handleGeneratePDF} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Générer PDF
                  </Button>
                  <Button variant="outline" onClick={handleSendEmail} className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer par email
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground pt-4">
                  <p className="font-medium mb-2">Informations entreprise:</p>
                  <p>EasyDevis SARL</p>
                  <p>123 Rue de la Paix</p>
                  <p>75001 Paris</p>
                  <p>SIRET: 123 456 789 00012</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQuote;
