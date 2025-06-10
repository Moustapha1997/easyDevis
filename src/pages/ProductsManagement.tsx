
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Search, Edit, Trash, Euro } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "@/hooks/useProducts";

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    unit: "",
    category: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      unit: "",
      category: ""
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ 
          id: editingProduct.id, 
          ...formData 
        });
      } else {
        await createProduct.mutateAsync(formData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des produits...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Package className="w-7 h-7" />
              Produits & Services
            </h1>
            <p className="text-muted-foreground">Gérez votre catalogue de produits et services</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={resetForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau produit
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? "Modifiez les informations du produit/service" 
                    : "Ajoutez un nouveau produit ou service à votre catalogue"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du produit/service *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Prix *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || 0}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unité *</Label>
                      <Input
                        id="unit"
                        value={formData.unit || ""}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        placeholder="ex: heure, forfait, pièce"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Input
                      id="category"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="ex: Web, Design, Service"
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                    {createProduct.isPending || updateProduct.isPending 
                      ? "En cours..." 
                      : (editingProduct ? "Modifier" : "Ajouter")
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un produit par nom ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Overview */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryProducts = products.filter(p => p.category === category);
              const averagePrice = categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length;
              
              return (
                <Card key={category} className="shadow-card border-0">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-semibold">{category}</h3>
                      <p className="text-2xl font-bold text-primary">{categoryProducts.length}</p>
                      <p className="text-sm text-muted-foreground">
                        Prix moyen: {averagePrice.toFixed(0)}€
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-card hover:shadow-card-hover transition-all duration-200 border-0">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {product.category && (
                        <span className="inline-block px-2 py-1 bg-muted rounded-full text-xs">
                          {product.category}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xl font-bold">{product.price}€</span>
                  </div>
                  <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProduct.isPending}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="shadow-card border-0">
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Aucun produit ne correspond à votre recherche." 
                  : "Commencez par ajouter votre premier produit ou service."
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProductsManagement;
