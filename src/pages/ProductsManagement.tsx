
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Pencil, Trash2, Loader2, Euro } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "@/hooks/useProducts";

// Templates par type de service
const SERVICE_TEMPLATES: Record<string, Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>>> = {
  'Électricité générale': [
    { name: 'Tableau électrique', description: 'Tableau 18 modules', price: 120, unit: 'unité', category: 'Électricité' },
    { name: 'Disjoncteur divisionnaire', description: 'Disjoncteur 16A', price: 14, unit: 'unité', category: 'Électricité' },
    { name: 'Prise électrique', description: 'Prise 2P+T', price: 7, unit: 'unité', category: 'Électricité' },
    { name: 'Interrupteur', description: 'Interrupteur va-et-vient', price: 8, unit: 'unité', category: 'Électricité' },
    { name: 'Câble 3G2.5mm²', description: 'Câble rigide', price: 1.2, unit: 'mètre', category: 'Électricité' },
    { name: 'Goulotte', description: 'Goulotte PVC', price: 3, unit: 'mètre', category: 'Électricité' },
    { name: 'Boîte d\'encastrement', description: 'Boîte profondeur 50mm', price: 2, unit: 'unité', category: 'Électricité' },
    { name: 'Spot LED encastrable', description: 'Spot blanc 6W', price: 12, unit: 'unité', category: 'Électricité' },
    { name: 'Appareillage complet', description: 'Lot prises/interrupteurs', price: 70, unit: 'unité', category: 'Électricité' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 42, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Plomberie sanitaire': [
    { name: 'Lavabo céramique', description: 'Lavabo blanc', price: 65, unit: 'unité', category: 'Plomberie' },
    { name: 'WC suspendu', description: 'WC avec bâti-support', price: 210, unit: 'unité', category: 'Plomberie' },
    { name: 'Douche à l\'italienne', description: 'Receveur extra-plat', price: 420, unit: 'unité', category: 'Plomberie' },
    { name: 'Robinet mitigeur', description: 'Mitigeur chromé', price: 48, unit: 'unité', category: 'Plomberie' },
    { name: 'Tube PER', description: 'Tube 16mm', price: 1.5, unit: 'mètre', category: 'Plomberie' },
    { name: 'Siphon', description: 'Siphon plastique', price: 7, unit: 'unité', category: 'Plomberie' },
    { name: 'Chauffe-eau électrique', description: 'Ballon 200L', price: 320, unit: 'unité', category: 'Plomberie' },
    { name: 'Raccord laiton', description: 'Raccord 16x16', price: 3, unit: 'unité', category: 'Plomberie' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 39, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Climatisation / Ventilation': [
    { name: 'Split mural', description: 'Climatiseur mural 2,5kW', price: 520, unit: 'unité', category: 'Climatisation' },
    { name: 'Pompe à chaleur air/air', description: 'PAC inverter', price: 1850, unit: 'unité', category: 'Climatisation' },
    { name: 'Grille de soufflage', description: 'Grille alu', price: 16, unit: 'unité', category: 'Climatisation' },
    { name: 'Gaine isolée', description: 'Gaine Ø160mm', price: 9, unit: 'mètre', category: 'Climatisation' },
    { name: 'Support mural', description: 'Support acier', price: 24, unit: 'unité', category: 'Climatisation' },
    { name: 'Thermostat connecté', description: 'Thermostat WiFi', price: 95, unit: 'unité', category: 'Climatisation' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 45, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Domotique & Smart Home': [
    { name: 'Box domotique', description: 'Box centrale', price: 180, unit: 'unité', category: 'Domotique' },
    { name: 'Module volet roulant connecté', description: 'Commande radio', price: 49, unit: 'unité', category: 'Domotique' },
    { name: 'Détecteur de fumée connecté', description: 'Détecteur WiFi', price: 39, unit: 'unité', category: 'Domotique' },
    { name: 'Prise connectée', description: 'Prise WiFi', price: 25, unit: 'unité', category: 'Domotique' },
    { name: 'Caméra IP', description: 'Caméra intérieure', price: 65, unit: 'unité', category: 'Domotique' },
    { name: 'Interrupteur sans fil', description: 'Interrupteur RF', price: 19, unit: 'unité', category: 'Domotique' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 45, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'VRD (Voirie & Réseaux Divers)': [
    { name: 'Regard béton', description: 'Regard 40x40cm', price: 49, unit: 'unité', category: 'VRD' },
    { name: 'Tuyau PVC assainissement', description: 'Tuyau Ø125', price: 7, unit: 'mètre', category: 'VRD' },
    { name: 'Gravier 20/40', description: 'Gravier drainage', price: 45, unit: 'm³', category: 'VRD' },
    { name: 'Regards de visite', description: 'Regard Ø315', price: 39, unit: 'unité', category: 'VRD' },
    { name: 'Bordure T2', description: 'Bordure béton', price: 13, unit: 'mètre', category: 'VRD' },
    { name: 'Béton de propreté', description: 'Béton dosé 250kg/m³', price: 120, unit: 'm³', category: 'VRD' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 40, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Photovoltaïque': [
    { name: 'Panneau solaire 375W', description: 'Module monocristallin', price: 210, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Micro-onduleur', description: 'Micro-onduleur 350W', price: 89, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Structure de fixation', description: 'Kit toiture', price: 45, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Coffret AC/DC', description: 'Protection solaire', price: 120, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Câble solaire', description: 'Câble 6mm²', price: 2.5, unit: 'mètre', category: 'Photovoltaïque' },
    { name: 'Connecteur MC4', description: 'Connecteur étanche', price: 3, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 50, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Piscine': [
    { name: 'Kit piscine coque', description: 'Coque polyester 7x3m', price: 6500, unit: 'unité', category: 'Piscine' },
    { name: 'Filtration à sable', description: 'Filtre 15m³/h', price: 420, unit: 'unité', category: 'Piscine' },
    { name: 'Pompe piscine', description: 'Pompe 1CV', price: 340, unit: 'unité', category: 'Piscine' },
    { name: 'Margelle pierre', description: 'Margelle travertin', price: 19, unit: 'mètre', category: 'Piscine' },
    { name: 'Liner piscine', description: 'Liner 75/100e', price: 23, unit: 'm²', category: 'Piscine' },
    { name: 'Projecteur LED', description: 'Projecteur blanc', price: 65, unit: 'unité', category: 'Piscine' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 45, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Carrelage extérieur': [
    { name: 'Carrelage grès cérame extérieur', description: 'Carrelage antidérapant pour terrasse', price: 35, unit: 'm²', category: 'Carrelage extérieur' },
    { name: 'Plinthe assortie', description: 'Plinthe extérieure', price: 6, unit: 'mètre', category: 'Carrelage extérieur' },
    { name: 'Colle carrelage extérieur', description: 'Sac de 25kg', price: 18, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Joint carrelage extérieur', description: 'Sac de 5kg', price: 12, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Ragréage extérieur', description: 'Sac de 25kg', price: 16, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Profilé de finition', description: 'Profilé alu', price: 7, unit: 'mètre', category: 'Carrelage extérieur' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 35, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Menuiserie intérieure': [
    { name: 'Porte intérieure bois', description: 'Porte standard', price: 90, unit: 'unité', category: 'Menuiserie' },
    { name: 'Bloc-porte complet', description: 'Bloc-porte prêt à poser', price: 160, unit: 'unité', category: 'Menuiserie' },
    { name: 'Poignée de porte', description: 'Poignée design', price: 18, unit: 'unité', category: 'Menuiserie' },
    { name: 'Serrure', description: 'Serrure encastrée', price: 22, unit: 'unité', category: 'Menuiserie' },
    { name: 'Plinthe bois', description: 'Plinthe à peindre', price: 6, unit: 'mètre', category: 'Menuiserie' },
    { name: 'Parquet stratifié', description: 'Parquet décor chêne', price: 28, unit: 'm²', category: 'Menuiserie' },
    { name: 'Sous-couche parquet', description: 'Sous-couche acoustique', price: 3, unit: 'm²', category: 'Menuiserie' },
    { name: 'Barre de seuil', description: 'Seuil alu', price: 9, unit: 'mètre', category: 'Menuiserie' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 38, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Salle de bain': [
    { name: 'Carrelage mural', description: 'Faïence 30x60', price: 28, unit: 'm²', category: 'Salle de bain' },
    { name: 'Carrelage sol antidérapant', description: 'Grès cérame 30x30', price: 32, unit: 'm²', category: 'Salle de bain' },
    { name: 'Colle carrelage', description: 'Sac de 25kg', price: 15, unit: 'sac', category: 'Salle de bain' },
    { name: 'Joint carrelage', description: 'Sac de 5kg', price: 10, unit: 'sac', category: 'Salle de bain' },
    { name: 'Robinetterie', description: 'Mitigeur thermostatique', price: 90, unit: 'unité', category: 'Salle de bain' },
    { name: 'WC suspendu', description: 'Pack complet', price: 280, unit: 'unité', category: 'Salle de bain' },
    { name: 'Meuble vasque', description: 'Meuble + vasque', price: 250, unit: 'unité', category: 'Salle de bain' },
    { name: 'Joint silicone', description: 'Cartouche', price: 7, unit: 'cartouche', category: 'Salle de bain' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 40, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Peinture': [
    { name: 'Peinture blanche', description: 'Peinture acrylique', price: 29, unit: 'litre', category: 'Peinture' },
    { name: 'Peinture couleur', description: 'Peinture satinée', price: 34, unit: 'litre', category: 'Peinture' },
    { name: 'Sous-couche', description: 'Primaire universel', price: 22, unit: 'litre', category: 'Peinture' },
    { name: 'Enduit de lissage', description: 'Enduit prêt à l\'emploi', price: 16, unit: 'kg', category: 'Peinture' },
    { name: 'Ruban de masquage', description: 'Rouleau 50m', price: 4, unit: 'rouleau', category: 'Peinture' },
    { name: 'Bâche de protection', description: 'Bâche plastique', price: 1, unit: 'm²', category: 'Peinture' },
    { name: 'Rouleau peinture', description: 'Rouleau anti-goutte', price: 7, unit: 'unité', category: 'Peinture' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 33, unit: 'heure', category: 'Main d\'œuvre' },
  ],
  'Plomberie': [
    { name: 'Tube cuivre', description: 'Tube 16mm', price: 4, unit: 'mètre', category: 'Plomberie' },
    { name: 'Tube PER', description: 'Tube 16mm', price: 2, unit: 'mètre', category: 'Plomberie' },
    { name: 'Robinet d\'arrêt', description: 'Robinet 1/4 de tour', price: 8, unit: 'unité', category: 'Plomberie' },
    { name: 'Évier inox', description: 'Évier 1 bac', price: 95, unit: 'unité', category: 'Plomberie' },
    { name: 'Mitigeur évier', description: 'Mitigeur chromé', price: 55, unit: 'unité', category: 'Plomberie' },
    { name: 'Siphon évier', description: 'Siphon plastique', price: 12, unit: 'unité', category: 'Plomberie' },
    { name: 'Flexible alimentation', description: 'Flexible inox', price: 7, unit: 'unité', category: 'Plomberie' },
    { name: 'Joint plomberie', description: 'Sachet de joints', price: 4, unit: 'sachet', category: 'Plomberie' },
    { name: 'Main d\'œuvre', description: 'Travail horaire', price: 39, unit: 'heure', category: 'Main d\'œuvre' },
  ],
};

const defaultForm = { name: "", description: "", price: 0, unit: "", category: "" };

const ProductsManagement = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(defaultForm);
  const [templateLoading, setTemplateLoading] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", price: p.price, unit: p.unit ?? "", category: p.category ?? "" });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, ...form });
    } else {
      await createMut.mutateAsync(form as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
    }
    setOpen(false);
  };

  const handleTemplate = async (service: string) => {
    if (!service || !SERVICE_TEMPLATES[service]) return;
    setTemplateLoading(true);
    for (const prod of SERVICE_TEMPLATES[service]) {
      try { await createMut.mutateAsync(prod); } catch {}
    }
    setTemplateLoading(false);
  };

  if (isLoading) return (
    <Layout><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div></Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Produits & Services</h1>
            <p className="text-sm text-gray-400 mt-0.5">{products.length} article{products.length !== 1 ? "s" : ""}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 gap-1.5 px-4 hidden sm:flex shadow-sm shadow-blue-200">
                <Plus className="w-4 h-4" /> Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier" : "Nouveau produit / service"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Nom *</Label>
                  <Input value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} required className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Description</Label>
                  <Textarea value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className="resize-none min-h-[60px] text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Prix (€) *</Label>
                    <Input type="number" step="0.01" min="0" value={form.price ?? 0} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Unité *</Label>
                    <Input value={form.unit ?? ""} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="heure, m², unité…" required className="h-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Catégorie</Label>
                  <Input value={form.category ?? ""} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Plomberie, Électricité…" className="h-9" />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Annuler</Button>
                  <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editing ? "Modifier" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recherche + template */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 bg-white border-gray-100 rounded-xl text-sm" />
          </div>
          <Select onValueChange={handleTemplate} disabled={templateLoading}>
            <SelectTrigger className="h-10 w-44 bg-white border-gray-100 rounded-xl text-sm">
              <SelectValue placeholder={templateLoading ? "Ajout…" : "Template métier"} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SERVICE_TEMPLATES).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Aucun produit</p>
            <p className="text-gray-400 text-sm mt-1">Ajoutez votre premier article</p>
            <Button onClick={openNew} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 hover:shadow-md hover:border-blue-100 transition-all">
                {/* Icône */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-0.5 text-xs font-bold text-blue-600">
                      <Euro className="w-3 h-3" />{product.price} / {product.unit}
                    </span>
                    {product.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(product)}
                    disabled={product.is_template}
                    className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors disabled:opacity-30"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={product.is_template || deleteMut.isPending}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer {product.name} ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMut.mutateAsync(product.id)} className="bg-red-500 hover:bg-red-600 rounded-xl">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB mobile */}
      <button onClick={openNew} className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-300 flex items-center justify-center z-30">
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>
    </Layout>
  );
};

export default ProductsManagement;
