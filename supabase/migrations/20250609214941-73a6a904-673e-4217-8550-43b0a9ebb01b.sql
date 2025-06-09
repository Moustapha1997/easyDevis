
-- Créer la table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  siret TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Créer la table des clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des produits/services
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unité',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un type enum pour le statut des devis
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- Créer la table des devis
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  quote_number TEXT NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quote_number)
);

-- Créer la table des lignes de devis
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS (Row Level Security) sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour les profils
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Créer les politiques RLS pour les clients
CREATE POLICY "Users can view their own clients" 
  ON public.clients FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
  ON public.clients FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON public.clients FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON public.clients FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer les politiques RLS pour les produits
CREATE POLICY "Users can view their own products" 
  ON public.products FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
  ON public.products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
  ON public.products FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
  ON public.products FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer les politiques RLS pour les devis
CREATE POLICY "Users can view their own quotes" 
  ON public.quotes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotes" 
  ON public.quotes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" 
  ON public.quotes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes" 
  ON public.quotes FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer les politiques RLS pour les lignes de devis
CREATE POLICY "Users can view quote items for their quotes" 
  ON public.quote_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create quote items for their quotes" 
  ON public.quote_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update quote items for their quotes" 
  ON public.quote_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete quote items for their quotes" 
  ON public.quote_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND quotes.user_id = auth.uid()
  ));

-- Créer une fonction pour gérer la création automatique du profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Créer un trigger pour appeler la fonction lors de la création d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Créer des index pour améliorer les performances
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_issue_date ON public.quotes(issue_date);
