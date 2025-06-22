import { useState } from "react";
import { SERVICE_TEMPLATES } from "@/templates/serviceTemplates";
import { Layout } from "@/components/Layout";
import { useCreateQuote } from "@/hooks/useQuotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, FileText, Save, Mail, Download, Loader } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const defaultCompany = {
  name: '',
  address: '',
  siret: '',
  email: '',
  phone: '',
  logo: '', // base64
  footer: ''
};

import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";

const CreateQuote = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [discount, setDiscount] = useState(0); // remise en €
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Informations entreprise (localStorage)
  const [company, setCompany] = useState(() => {
    const stored = localStorage.getItem('companyInfo');
    return stored ? JSON.parse(stored) : defaultCompany;
  });

  // Ajout pour édition : récupération de l'id du devis
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { data: quotes } = useQuotes();
  useEffect(() => {
    if (editId && quotes) {
      const quote = quotes.find((q: any) => q.id === editId);
      if (quote) {
        setClient(quote.client_id || "");
        setNotes(quote.notes || "");
        setTerms(quote.terms || "");
        setExpiryDate(quote.expiry_date || "");
        // Pré-remplir les lignes
        if (Array.isArray(quote.items) && quote.items.length > 0) {
          setQuoteItems(
            quote.items.map((item: any, idx: number) => ({
              id: item.id || idx.toString(),
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unit_price ?? item.unitPrice ?? 0),
              total: Number(item.total ?? ((item.quantity || 0) * (item.unit_price ?? item.unitPrice ?? 0))),
            }))
          );
        }
      }
    }
  }, [editId, quotes]);
  
  const handleCompanyChange = (field: string, value: string) => {
    const updated = { ...company, [field]: value };
    setCompany(updated);
    localStorage.setItem('companyInfo', JSON.stringify(updated));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleCompanyChange('logo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Ajout : préremplir le devis avec un template
  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = SERVICE_TEMPLATES[templateKey];
    if (template) {
      setQuoteItems(
        template.map((item, idx) => ({
          id: Date.now().toString() + idx,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        }))
      );
    }
  };

  const createQuote = useCreateQuote();
  const { user } = useAuth();

  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: products, isLoading: productsLoading } = useProducts();

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

  const addProductToQuote = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        description: product.description || "",
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      };
      setQuoteItems([...quoteItems, newItem]);
    }
  };

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.20;
  const vatAmount = (subtotal - discount) * vatRate;
  const totalAmount = subtotal - discount + vatAmount;

  const handleSave = async () => {
    setError("");
    if (!client) {
      setError("Veuillez sélectionner un client.");
      return;
    }
    if (quoteItems.length === 0 || quoteItems.some(item => !item.description || item.quantity <= 0)) {
      setError("Veuillez ajouter au moins un élément valide au devis.");
      return;
    }
    setIsSaving(true);
    try {
      // Générer un numéro de devis unique (ex: YYYYMMDD-XXX)
      const today = new Date();
      const quoteNumber = `DV-${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2,'0')}${today.getDate().toString().padStart(2,'0')}-${Date.now().toString().slice(-4)}`;
      // Créer le devis dans Supabase
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert([{
          client_id: client,
          user_id: user?.id, // Ajout user_id obligatoire
          quote_number: quoteNumber,
          status: 'draft',
          issue_date: today.toISOString().split('T')[0],
          expiry_date: expiryDate,
          subtotal: subtotal,
          tax_rate: vatRate * 100,
          tax_amount: vatAmount,
          total: totalAmount,
          notes,
          terms,
          // remise stockée dans notes/terms ou ajouter colonne si besoin
        }])
        .select()
        .single();
      if (quoteError) throw quoteError;
      // Créer les lignes de devis dans quote_items
      for (const item of quoteItems) {
        await supabase.from('quote_items').insert([{
          quote_id: quote.id,
          name: item.description,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        }]);
      }
      toast.success('Devis sauvegardé avec succès !');
      // TODO: Rediriger vers la liste ou la page du devis créé
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du devis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = () => {
    toast.success("Devis envoyé par email !");
  };

  const handleGeneratePDF = async () => {
    try {
      const doc = new jsPDF();
      let y = 15;

      // Logo
      if (company.logo) {
        try {
          doc.addImage(company.logo, 'PNG', 10, y, 32, 32);
        } catch (e) {/* ignore logo if error */}
      }

      // Infos entreprise
      doc.setFontSize(12);
      let companyInfoY = y;
      if (company.name) { doc.text(company.name, 45, companyInfoY); companyInfoY += 7; }
      if (company.address) { doc.text(company.address, 45, companyInfoY); companyInfoY += 7; }
      if (company.siret) { doc.text(`SIRET : ${company.siret}`, 45, companyInfoY); companyInfoY += 7; }
      if (company.email) { doc.text(`Email : ${company.email}`, 45, companyInfoY); companyInfoY += 7; }
      if (company.phone) { doc.text(`Tél : ${company.phone}`, 45, companyInfoY); companyInfoY += 7; }

      y = Math.max(companyInfoY, y + 32) + 10;

      // En-tête devis moderne et centré
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 90);
      doc.text("DEVIS", 105, y, { align: "center" });
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(0,0,0);
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 105, y, { align: "center" });
      y += 8;
      // Bloc informations client (fond gris, réduit, "Client" en titre, date à gauche)
      const clientObj = clients?.find(c => c.id === client);
      const dateStr = `Date : ${new Date().toLocaleDateString()}`;
      if (clientObj) {
        const clientFields = [
          clientObj.name,
          clientObj.address,
          [clientObj.postal_code, clientObj.city].filter(Boolean).join(' '),
          clientObj.country,
          clientObj.email,
          clientObj.phone
        ].filter(Boolean);
        // Section réduite : moins haute, padding réduit
        // Section client encore plus compacte
        const sectionHeight = Math.max(20 + clientFields.length * 5, 30);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(25, y, 160, sectionHeight, 4, 4, 'F');
        // Titre "Client" en haut à gauche
        doc.setFontSize(11);
        doc.setTextColor(30,30,30);
        doc.text('Client', 35, y + 8);
        // Date à droite
        doc.setFontSize(9);
        doc.setTextColor(80,80,80);
        doc.text(dateStr, 170, y + 8, { align: 'right' });
        // Infos client
        doc.setFontSize(10);
        doc.setTextColor(40,40,40);
        let clientY = y + 15;
        for (const field of clientFields) {
          doc.text(field, 35, clientY);
          clientY += 5;
        }
        y += sectionHeight + 4;
        doc.setTextColor(0,0,0);
      } else {
        // Si pas de client sélectionné, affiche la date à gauche
        doc.setFontSize(10);
        doc.setTextColor(80,80,80);
        doc.text(dateStr, 35, y + 9);
        doc.setFontSize(11);
        doc.setTextColor(30,30,30);
        doc.text('Client : Non sélectionné', 105, y + 18, { align: 'center' });
        y += 32;
        doc.setTextColor(0,0,0);
      }

      // Tableau devis
      autoTable(doc, {
        startY: y,
        head: [["Description", "Quantité", "PU HT", "Total HT"]],
        body: quoteItems.length === 0 || quoteItems.every(item => !item.description)
          ? [["Aucune ligne de devis", "", "", ""]]
          : quoteItems.map(item => [
              item.description || "(vide)",
              item.quantity,
              item.unitPrice.toFixed(2) + " €",
              item.total.toFixed(2) + " €",
            ]),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220] },
      });
      y = (doc as any).lastAutoTable.finalY + 6;

      // Totaux
      doc.setFontSize(11);
      doc.text(`Sous-total HT : ${subtotal.toFixed(2)} €`, 140, y, { align: "right" });
      y += 6;
      if (discount > 0) {
        doc.text(`Remise : -${discount.toFixed(2)} €`, 140, y, { align: "right" });
        y += 6;
      }
      doc.text(`TVA (20%) : ${vatAmount.toFixed(2)} €`, 140, y, { align: "right" });
      y += 6;
      doc.setFont(undefined, 'bold');
      doc.text(`Total TTC : ${totalAmount.toFixed(2)} €`, 140, y, { align: "right" });
      doc.setFont(undefined, 'normal');
      y += 10;

      // Notes & conditions
      if (notes) {
        doc.setFontSize(10);
        doc.text("Notes :", 10, y);
        doc.setFontSize(9);
        doc.text(doc.splitTextToSize(notes, 180), 10, y + 5);
        y += 12 + Math.floor(notes.length / 80) * 5;
      }
      if (terms) {
        doc.setFontSize(10);
        doc.text("Conditions :", 10, y);
        doc.setFontSize(9);
        doc.text(doc.splitTextToSize(terms, 180), 10, y + 5);
        y += 12 + Math.floor(terms.length / 80) * 5;
      }

      // S'assure que le contenu ne touche pas le pied de page (marge de sécurité)
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      // Section signature (alignée à droite)
      y += 20;
      doc.setDrawColor(150);
      // Ligne signature à droite
      doc.line(120, y, 190, y);
      y += 6;
      doc.setFontSize(11);
      doc.text("Signature et cachet de l'entreprise", 190, y, { align: "right" });
      y += 8;
      doc.setFontSize(10);
      doc.text("Nom, fonction et signature du représentant", 190, y, { align: "right" });

      // Pied de page personnalisé sur chaque page
      if (company.footer) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          const footerLines = doc.splitTextToSize(company.footer, 180);
footerLines.forEach((line, idx) => {
  doc.text(line, 105, 285 + idx * 5, { align: "center" });
});
        }
      }

      doc.save("devis.pdf");
      toast.success("PDF généré et téléchargé !");
    } catch (err) {
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  if (clientsLoading || productsLoading) {
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
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Plus className="w-7 h-7" />
              Créer un devis
            </h1>
            <p className="text-muted-foreground">Créez un nouveau devis personnalisé</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
            <Button onClick={handleGeneratePDF} variant="secondary" className="flex items-center gap-2 shadow-lg">
              <Download className="w-4 h-4" />
              Générer PDF
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations entreprise */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Informations entreprise</CardTitle>
                <CardDescription>Ces informations apparaîtront sur l'entête du devis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sélecteur de template de service pour préremplir le devis */}
                <div className="mb-4">
                  <Label>Pré-remplir avec un modèle de service</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Choisir un template (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SERVICE_TEMPLATES).map((key) => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Nom de l'entreprise</Label>
                    <Input value={company.name} onChange={e => handleCompanyChange('name', e.target.value)} placeholder="Nom de l'entreprise" />
                    <Label>Adresse</Label>
                    <Input value={company.address} onChange={e => handleCompanyChange('address', e.target.value)} placeholder="Adresse" />
                    <Label>SIRET</Label>
                    <Input value={company.siret} onChange={e => handleCompanyChange('siret', e.target.value)} placeholder="SIRET" />
                    <Label>Email</Label>
                    <Input value={company.email} onChange={e => handleCompanyChange('email', e.target.value)} placeholder="Email" />
                    <Label>Téléphone</Label>
                    <Input value={company.phone} onChange={e => handleCompanyChange('phone', e.target.value)} placeholder="Téléphone" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Label>Logo</Label>
                    {company.logo && (
                      <img src={company.logo} alt="Logo entreprise" className="w-24 h-24 object-contain border rounded mb-2" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>
                <div>
                  <Label>Pied de page personnalisé</Label>
                  <Textarea value={company.footer} onChange={e => handleCompanyChange('footer', e.target.value)} placeholder="Mentions légales, site web, etc." />
                </div>
              </CardContent>
            </Card>

            {/* Informations de base */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>Sélectionnez un client existant</CardDescription>
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
                        {clients?.map((clientItem) => (
                          <SelectItem key={clientItem.id} value={clientItem.id}>
                            {clientItem.name}
                          </SelectItem>
                        ))}
                        {clients?.length === 0 && (
                          <SelectItem value="no-clients" disabled>
                            Aucun client disponible
                          </SelectItem>
                        )}
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

            {/* Products Quick Add */}
            {products && products.length > 0 && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Ajouter des produits</CardTitle>
                  <CardDescription>Sélectionnez des produits de votre catalogue</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={addProductToQuote}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un produit à ajouter" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.price}€ / {product.unit}) {product.is_template ? ' [Modèle par défaut]' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

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
                  <Label htmlFor="discount">Remise (€)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Conditions de paiement</Label>
                  <Textarea
                    id="terms"
                    placeholder="Ex: Paiement à 30 jours, acompte 30%, etc."
                    className="min-h-[60px]"
                    value={terms}
                    onChange={e => setTerms(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes et conditions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Conditions de paiement, délais de livraison, etc."
                    className="min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry">Date d'expiration</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne de droite - Aperçu */}
          <div className="space-y-6">
            <Card className="shadow-card border-0 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Aperçu du devis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* EN-TÊTE DEVIS */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    {company.logo ? (
                      <img src={company.logo} alt="Logo entreprise" className="w-20 h-20 object-contain border rounded" />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center border rounded bg-muted text-muted-foreground">Logo</div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-lg">{company.name || <span className="italic text-muted-foreground">Nom de l'entreprise</span>}</div>
                      <div>{company.address || <span className="italic text-muted-foreground">Adresse</span>}</div>
                      <div>{company.siret ? <>SIRET : {company.siret}</> : <span className="italic text-muted-foreground">SIRET</span>}</div>
                      <div>{company.email ? <>Email : {company.email}</> : <span className="italic text-muted-foreground">Email</span>}</div>
                      <div>{company.phone ? <>Tél : {company.phone}</> : <span className="italic text-muted-foreground">Téléphone</span>}</div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div>
                      <div className="font-bold text-xl">DEVIS</div>
                    </div>
                    <div>
                      <div className="font-semibold">Client :</div>
                      {clients?.find(c => c.id === client)?.name || <span className="italic text-muted-foreground">Non sélectionné</span>}
                    </div>
                  </div>
                </div>

                {/* TABLEAU DES LIGNES DEVIS */}
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border px-2 py-1 text-left">Description</th>
                        <th className="border px-2 py-1 text-right">Quantité</th>
                        <th className="border px-2 py-1 text-right">PU HT</th>
                        <th className="border px-2 py-1 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.length === 0 || quoteItems.every(item => !item.description) ? (
                        <tr><td colSpan={4} className="text-center italic text-muted-foreground">Aucune ligne de devis</td></tr>
                      ) : (
                        quoteItems.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="border px-2 py-1">{item.description || <span className="italic text-muted-foreground">(vide)</span>}</td>
                            <td className="border px-2 py-1 text-right">{item.quantity}</td>
                            <td className="border px-2 py-1 text-right">{item.unitPrice.toFixed(2)}€</td>
                            <td className="border px-2 py-1 text-right">{item.total.toFixed(2)}€</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TOTAUX */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Sous-total HT :</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span>Remise :</span>
                      <span className="font-medium">-{discount.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>TVA (20%) :</span>
                    <span className="font-medium">{vatAmount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC :</span>
                    <span>{totalAmount.toFixed(2)}€</span>
                  </div>
                </div>

                {/* NOTES ET CONDITIONS */}
                {(notes || terms) && (
                  <div className="mt-4 text-sm">
                    {notes && <div><span className="font-semibold">Notes :</span> {notes}</div>}
                    {terms && <div><span className="font-semibold">Conditions :</span> {terms}</div>}
                  </div>
                )}

                {/* PIED DE PAGE PERSONNALISÉ */}
                {company.footer && (
                  <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                    {company.footer}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQuote;
