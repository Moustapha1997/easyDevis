import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Search, Mail, Phone, MapPin, Pencil, Trash2, Loader2 } from "lucide-react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, Client } from "@/hooks/useClients";

const defaultForm = { name:"", email:"", phone:"", address:"", city:"", postal_code:"", country:"France" };

const ClientsManagement = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>(defaultForm);

  const { data: clients = [], isLoading } = useClients();
  const createMut = useCreateClient();
  const updateMut = useUpdateClient();
  const deleteMut = useDeleteClient();

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ name:c.name, email:c.email??'', phone:c.phone??'', address:c.address??'', city:c.city??'', postal_code:c.postal_code??'', country:c.country??'France' }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, ...form });
    } else {
      await createMut.mutateAsync(form as Omit<Client,'id'|'created_at'|'updated_at'>);
    }
    setOpen(false);
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
            <h1 className="text-xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-400 mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 gap-1.5 px-4 hidden sm:flex shadow-sm shadow-blue-200">
                <Plus className="w-4 h-4" /> Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le client" : "Nouveau client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Nom *</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Email</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Téléphone</Label>
                    <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Adresse</Label>
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Ville</Label>
                    <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Code postal</Label>
                    <Input value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} className="h-9" />
                  </div>
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

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 bg-white border-gray-100 rounded-xl text-sm" />
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Aucun client</p>
            <p className="text-gray-400 text-sm mt-1">Ajoutez votre premier client</p>
            <Button onClick={openNew} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un client
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(client => (
              <div key={client.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 hover:shadow-md hover:border-blue-100 transition-all">
                {/* Avatar initiale */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">{client.name.charAt(0).toUpperCase()}</span>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                  <div className="mt-1 space-y-0.5">
                    {client.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{client.phone}</span>
                      </div>
                    )}
                    {(client.address || client.city) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">
                          {[client.address, client.postal_code, client.city].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(client)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer {client.name} ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMut.mutateAsync(client.id)} className="bg-red-500 hover:bg-red-600 rounded-xl">
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

export default ClientsManagement;
