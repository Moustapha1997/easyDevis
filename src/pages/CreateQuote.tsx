import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useQuotes } from "@/hooks/useQuotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateQuotePDF } from "@/lib/generatePDF";
import { useQueryClient } from "@tanstack/react-query";

interface QuoteItem {
  id: string;
  reference: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const emptyItem = (): QuoteItem => ({
  id: Date.now().toString() + Math.random(),
  reference: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

const CreateQuote = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [clientId, setClientId] = useState("");
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([emptyItem()]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: products } = useProducts();
  const { data: quotes } = useQuotes();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!editId || !quotes) return;
    const q = quotes.find((q: any) => q.id === editId);
    if (!q) return;
    setClientId(q.client_id ?? "");
    setNotes(q.notes ?? "");
    setTerms(q.terms ?? "");
    setExpiryDate(q.expiry_date ?? "");
    if (Array.isArray(q.items) && q.items.length > 0) {
      setQuoteItems(q.items.map((item: any, i: number) => ({
        id: item.id ?? i.toString(),
        reference: item.reference ?? "",
        description: item.description ?? item.name ?? "",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price ?? 0),
        total: Number(item.total ?? 0),
      })));
    }
  }, [editId, quotes]);

  const total = quoteItems.reduce((sum, i) => sum + i.total, 0);

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const addProductToQuote = (productId: string) => {
    const p = products?.find(p => p.id === productId);
    if (!p) return;
    setQuoteItems(prev => [...prev, {
      id: Date.now().toString(),
      reference: p.category ?? "",
      description: p.name,
      quantity: 1,
      unitPrice: p.price,
      total: p.price,
    }]);
  };

  const saveQuoteToDb = async () => {
    if (!clientId) { setError("Veuillez sélectionner un client."); return null; }
    if (quoteItems.every(i => !i.description)) { setError("Ajoutez au moins une ligne."); return null; }

    const today = new Date();
    const quoteNumber = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;

    const { data: quote, error: qErr } = await supabase
      .from('quotes')
      .insert([{
        client_id: clientId,
        user_id: user?.id,
        quote_number: quoteNumber,
        status: 'draft',
        issue_date: today.toISOString().split('T')[0],
        expiry_date: expiryDate || null,
        subtotal: total,
        tax_rate: 0,
        tax_amount: 0,
        total,
        notes: notes || null,
        terms: terms || null,
      }])
      .select()
      .single();

    if (qErr) throw qErr;

    const itemsToInsert = quoteItems
      .filter(i => i.description)
      .map(i => ({
        quote_id: quote.id,
        reference: i.reference || null,
        name: i.description,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        total: i.total,
      }));

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase.from('quote_items').insert(itemsToInsert);
      if (iErr) throw iErr;
    }

    return { quoteId: quote.id, quoteNumber };
  };

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      const result = await saveQuoteToDb();
      if (!result) return;
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Devis sauvegardé !");
      navigate(`/quotes/${result.quoteId}`);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setError("");
    if (!clientId) { setError("Veuillez sélectionner un client."); return; }
    if (quoteItems.every(i => !i.description)) { setError("Ajoutez au moins une ligne."); return; }

    setIsSaving(true);
    try {
      const result = await saveQuoteToDb();
      if (!result) return;

      const clientObj = clients?.find(c => c.id === clientId);
      let company = { name:'', subtitle:'', address:'', email:'', phone:'', siret:'', iban:'', logo:'' };
      try { const s = localStorage.getItem('companyInfo'); if (s) company = { ...company, ...JSON.parse(s) }; } catch {}

      generateQuotePDF({
        quoteNumber: result.quoteNumber,
        issueDate: new Date().toISOString(),
        clientName: clientObj?.name ?? "",
        clientAddress: [clientObj?.address, clientObj?.postal_code, clientObj?.city].filter(Boolean).join(', '),
        items: quoteItems.filter(i => i.description),
        total,
        notes,
        terms,
      }, company);

      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Devis sauvegardé et PDF téléchargé !");
      navigate(`/quotes/${result.quoteId}`);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la génération du PDF");
    } finally {
      setIsSaving(false);
    }
  };

  if (clientsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Contenu principal avec padding-bottom pour la barre d'action mobile */}
      <div className="max-w-2xl mx-auto space-y-4 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{editId ? "Modifier le devis" : "Nouveau devis"}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations</p>
          </div>
          {/* Boutons visibles sur mobile ET desktop */}
          <div className="flex gap-1.5 flex-shrink-0">
            {/* Mobile : icône seule */}
            <button
              onClick={handleGeneratePDF}
              disabled={isSaving}
              title="Télécharger PDF"
              className="sm:hidden w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              title="Enregistrer"
              className="sm:hidden w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            {/* Desktop : icône + texte */}
            <Button variant="outline" onClick={handleGeneratePDF} disabled={isSaving} className="hidden sm:flex rounded-xl gap-1.5 h-9">
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 h-9 shadow-sm shadow-blue-200">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{error}</div>
        )}

        {/* Bloc client + date */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informations générales</p>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
                {(!clients || clients.length === 0) && (
                  <div className="px-3 py-2 text-sm text-gray-400">Aucun client — ajoutez-en un d'abord</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Date d'expiration</Label>
            <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="h-10 rounded-xl" />
          </div>
        </div>

        {/* Ajout depuis catalogue */}
        {products && products.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ajouter depuis le catalogue</p>
            <Select onValueChange={addProductToQuote}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Choisir un produit/service" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} — {p.price} €/{p.unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Lignes du devis — tableau */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lignes du devis</p>
          </div>

          {/* En-tête tableau */}
          <div className="grid grid-cols-[2fr_4fr_1fr_2fr_2fr_auto] gap-0 bg-blue-600 text-white text-xs font-semibold px-3 py-2">
            <div className="px-1">Référence</div>
            <div className="px-1">Description</div>
            <div className="px-1 text-center">Qté</div>
            <div className="px-1 text-right">Prix unit.</div>
            <div className="px-1 text-right">Total</div>
            <div className="w-6"></div>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-gray-100">
            {quoteItems.map((item, idx) => (
              <div key={item.id} className={`grid grid-cols-[2fr_4fr_1fr_2fr_2fr_auto] gap-0 px-3 py-2 items-start ${idx % 2 === 1 ? 'bg-blue-50/40' : 'bg-white'}`}>
                {/* Référence */}
                <div className="px-1">
                  <Input
                    placeholder="Réf."
                    value={item.reference}
                    onChange={e => updateItem(item.id, 'reference', e.target.value)}
                    className="h-8 text-xs bg-white border-gray-200 rounded-lg px-2"
                  />
                </div>
                {/* Description */}
                <div className="px-1">
                  <Textarea
                    placeholder="Description…"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    className="text-xs bg-white border-gray-200 resize-none min-h-[32px] max-h-[80px] rounded-lg px-2 py-1.5"
                  />
                </div>
                {/* Quantité */}
                <div className="px-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs text-center bg-white border-gray-200 rounded-lg px-1"
                  />
                </div>
                {/* Prix unitaire */}
                <div className="px-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs text-right bg-white border-gray-200 rounded-lg px-2"
                  />
                </div>
                {/* Total */}
                <div className="px-1">
                  <div className="h-8 flex items-center justify-end px-2 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700">
                    {item.total.toFixed(2)} €
                  </div>
                </div>
                {/* Supprimer */}
                <div className="flex items-start justify-center pt-1 w-6">
                  <button
                    onClick={() => setQuoteItems(prev => prev.length > 1 ? prev.filter(i => i.id !== item.id) : prev)}
                    disabled={quoteItems.length === 1}
                    className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setQuoteItems(prev => [...prev, emptyItem()])}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-1"
          >
            <Plus className="w-4 h-4" /> Ajouter une ligne
          </button>

          {/* Total TTC */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">Total TTC</span>
            <span className="text-2xl font-bold text-gray-900">{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Notes & conditions — accordéon */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowNotes(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            Notes et conditions (optionnel)
            {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showNotes && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
              <div className="space-y-1 pt-3">
                <Label className="text-xs text-gray-600">Notes</Label>
                <Textarea
                  placeholder="Notes à destination du client..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[80px] text-sm resize-none rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Conditions de paiement</Label>
                <Textarea
                  placeholder="Ex : Paiement à 30 jours, acompte 30%..."
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  className="min-h-[80px] text-sm resize-none rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

      </div>

    </Layout>
  );
};

export default CreateQuote;
