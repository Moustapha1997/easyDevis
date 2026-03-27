
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface QuoteItem {
  id: string;
  quote_id: string;
  reference: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  issue_date: string;
  expiry_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email: string | null;
  };
  items?: QuoteItem[];
}

export const useQuotes = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['quotes', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (name, email),
          items:quote_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Quote[];
    },
    enabled: !!user,
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
      if (error) throw error;
      return quoteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Devis supprimé avec succès !');
    },
    onError: (error) => {
      console.error('Erreur suppression devis:', error);
      toast.error('Erreur lors de la suppression du devis');
    },
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at' | 'clients'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('quotes')
        .insert([{ ...quoteData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Devis créé avec succès !');
    },
    onError: (error) => {
      console.error('Error creating quote:', error);
      toast.error('Erreur lors de la création du devis');
    },
  });
};
