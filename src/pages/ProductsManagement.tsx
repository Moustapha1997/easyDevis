
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

// Templates par type de service
const SERVICE_TEMPLATES: Record<string, Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>>> = {
  'Électricité générale': [
    { name: 'Tableau électrique', description: 'Tableau 18 modules', price: 120, unit: 'unité', category: 'Électricité' },
    { name: 'Disjoncteur divisionnaire', description: 'Disjoncteur 16A', price: 14, unit: 'unité', category: 'Électricité' },
    { name: 'Prise électrique', description: 'Prise 2P+T', price: 7, unit: 'unité', category: 'Électricité' },
    { name: 'Interrupteur', description: 'Interrupteur va-et-vient', price: 8, unit: 'unité', category: 'Électricité' },
    { name: 'Câble 3G2.5mm²', description: 'Câble rigide', price: 1.2, unit: 'mètre', category: 'Électricité' },
    { name: 'Goulotte', description: 'Goulotte PVC', price: 3, unit: 'mètre', category: 'Électricité' },
    { name: 'Boîte d’encastrement', description: 'Boîte profondeur 50mm', price: 2, unit: 'unité', category: 'Électricité' },
    { name: 'Spot LED encastrable', description: 'Spot blanc 6W', price: 12, unit: 'unité', category: 'Électricité' },
    { name: 'Appareillage complet', description: 'Lot prises/interrupteurs', price: 70, unit: 'unité', category: 'Électricité' },
  ],
  'Plomberie sanitaire': [
    { name: 'Lavabo céramique', description: 'Lavabo blanc', price: 65, unit: 'unité', category: 'Plomberie' },
    { name: 'WC suspendu', description: 'WC avec bâti-support', price: 210, unit: 'unité', category: 'Plomberie' },
    { name: 'Douche à l’italienne', description: 'Receveur extra-plat', price: 420, unit: 'unité', category: 'Plomberie' },
    { name: 'Robinet mitigeur', description: 'Mitigeur chromé', price: 48, unit: 'unité', category: 'Plomberie' },
    { name: 'Tube PER', description: 'Tube 16mm', price: 1.5, unit: 'mètre', category: 'Plomberie' },
    { name: 'Siphon', description: 'Siphon plastique', price: 7, unit: 'unité', category: 'Plomberie' },
    { name: 'Chauffe-eau électrique', description: 'Ballon 200L', price: 320, unit: 'unité', category: 'Plomberie' },
    { name: 'Raccord laiton', description: 'Raccord 16x16', price: 3, unit: 'unité', category: 'Plomberie' },
  ],
  'Climatisation / Ventilation': [
    { name: 'Split mural', description: 'Climatiseur mural 2,5kW', price: 520, unit: 'unité', category: 'Climatisation' },
    { name: 'Pompe à chaleur air/air', description: 'PAC inverter', price: 1850, unit: 'unité', category: 'Climatisation' },
    { name: 'Grille de soufflage', description: 'Grille alu', price: 16, unit: 'unité', category: 'Climatisation' },
    { name: 'Gaine isolée', description: 'Gaine Ø160mm', price: 9, unit: 'mètre', category: 'Climatisation' },
    { name: 'Support mural', description: 'Support acier', price: 24, unit: 'unité', category: 'Climatisation' },
    { name: 'Thermostat connecté', description: 'Thermostat WiFi', price: 95, unit: 'unité', category: 'Climatisation' },
  ],
  'Domotique & Smart Home': [
    { name: 'Box domotique', description: 'Box centrale', price: 180, unit: 'unité', category: 'Domotique' },
    { name: 'Module volet roulant connecté', description: 'Commande radio', price: 49, unit: 'unité', category: 'Domotique' },
    { name: 'Détecteur de fumée connecté', description: 'Détecteur WiFi', price: 39, unit: 'unité', category: 'Domotique' },
    { name: 'Prise connectée', description: 'Prise WiFi', price: 25, unit: 'unité', category: 'Domotique' },
    { name: 'Caméra IP', description: 'Caméra intérieure', price: 65, unit: 'unité', category: 'Domotique' },
    { name: 'Interrupteur sans fil', description: 'Interrupteur RF', price: 19, unit: 'unité', category: 'Domotique' },
  ],
  'VRD (Voirie & Réseaux Divers)': [
    { name: 'Regard béton', description: 'Regard 40x40cm', price: 49, unit: 'unité', category: 'VRD' },
    { name: 'Tuyau PVC assainissement', description: 'Tuyau Ø125', price: 7, unit: 'mètre', category: 'VRD' },
    { name: 'Gravier 20/40', description: 'Gravier drainage', price: 45, unit: 'm³', category: 'VRD' },
    { name: 'Regards de visite', description: 'Regard Ø315', price: 39, unit: 'unité', category: 'VRD' },
    { name: 'Bordure T2', description: 'Bordure béton', price: 13, unit: 'mètre', category: 'VRD' },
    { name: 'Béton de propreté', description: 'Béton dosé 250kg/m³', price: 120, unit: 'm³', category: 'VRD' },
  ],
  'Photovoltaïque': [
    { name: 'Panneau solaire 375W', description: 'Module monocristallin', price: 210, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Micro-onduleur', description: 'Micro-onduleur 350W', price: 89, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Structure de fixation', description: 'Kit toiture', price: 45, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Coffret AC/DC', description: 'Protection solaire', price: 120, unit: 'unité', category: 'Photovoltaïque' },
    { name: 'Câble solaire', description: 'Câble 6mm²', price: 2.5, unit: 'mètre', category: 'Photovoltaïque' },
    { name: 'Connecteur MC4', description: 'Connecteur étanche', price: 3, unit: 'unité', category: 'Photovoltaïque' },
  ],
  'Piscine': [
    { name: 'Kit piscine coque', description: 'Coque polyester 7x3m', price: 6500, unit: 'unité', category: 'Piscine' },
    { name: 'Filtration à sable', description: 'Filtre 15m³/h', price: 420, unit: 'unité', category: 'Piscine' },
    { name: 'Pompe piscine', description: 'Pompe 1CV', price: 340, unit: 'unité', category: 'Piscine' },
    { name: 'Margelle pierre', description: 'Margelle travertin', price: 19, unit: 'mètre', category: 'Piscine' },
    { name: 'Liner piscine', description: 'Liner 75/100e', price: 23, unit: 'm²', category: 'Piscine' },
    { name: 'Projecteur LED', description: 'Projecteur blanc', price: 65, unit: 'unité', category: 'Piscine' },
  ],
  'Carrelage extérieur': [
    { name: 'Carrelage grès cérame extérieur', description: 'Carrelage antidérapant pour terrasse', price: 35, unit: 'm²', category: 'Carrelage extérieur' },
    { name: 'Plinthe assortie', description: 'Plinthe extérieure', price: 6, unit: 'mètre', category: 'Carrelage extérieur' },
    { name: 'Colle carrelage extérieur', description: 'Sac de 25kg', price: 18, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Joint carrelage extérieur', description: 'Sac de 5kg', price: 12, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Ragréage extérieur', description: 'Sac de 25kg', price: 16, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Primaire d’accrochage', description: 'Bidon de 5L', price: 22, unit: 'bidon', category: 'Carrelage extérieur' },
    { name: 'Mortier de scellement', description: 'Sac de 35kg', price: 10, unit: 'sac', category: 'Carrelage extérieur' },
    { name: 'Croisillons', description: 'Sachet de 200', price: 4, unit: 'sachet', category: 'Carrelage extérieur' },
    { name: 'Profilé de finition', description: 'Profilé alu', price: 7, unit: 'mètre', category: 'Carrelage extérieur' },
    { name: 'Seau de nettoyage', description: 'Seau spécial carrelage', price: 8, unit: 'unité', category: 'Carrelage extérieur' },
    { name: 'Éponge à joints', description: 'Éponge professionnelle', price: 3, unit: 'unité', category: 'Carrelage extérieur' },
    { name: 'Genouillères', description: 'Paire', price: 13, unit: 'paire', category: 'Carrelage extérieur' },
  ],
  'Menuiserie intérieure': [
    { name: 'Porte intérieure bois', description: 'Porte standard', price: 90, unit: 'unité', category: 'Menuiserie intérieure' },
    { name: 'Bloc-porte complet', description: 'Bloc-porte prêt à poser', price: 160, unit: 'unité', category: 'Menuiserie intérieure' },
    { name: 'Poignée de porte', description: 'Poignée design', price: 18, unit: 'unité', category: 'Menuiserie intérieure' },
    { name: 'Serrure', description: 'Serrure encastrée', price: 22, unit: 'unité', category: 'Menuiserie intérieure' },
    { name: 'Plinthe bois', description: 'Plinthe à peindre', price: 6, unit: 'mètre', category: 'Menuiserie intérieure' },
    { name: 'Parquet stratifié', description: 'Parquet décor chêne', price: 28, unit: 'm²', category: 'Menuiserie intérieure' },
    { name: 'Sous-couche parquet', description: 'Sous-couche acoustique', price: 3, unit: 'm²', category: 'Menuiserie intérieure' },
    { name: 'Barre de seuil', description: 'Seuil alu', price: 9, unit: 'mètre', category: 'Menuiserie intérieure' },
    { name: 'Colle à bois', description: 'Cartouche', price: 7, unit: 'cartouche', category: 'Menuiserie intérieure' },
    { name: 'Visserie/chevilles', description: 'Boîte de 100', price: 8, unit: 'boîte', category: 'Menuiserie intérieure' },
    { name: 'Silicone', description: 'Cartouche', price: 5, unit: 'cartouche', category: 'Menuiserie intérieure' },
  ],
  'Menuiserie extérieure / Fenêtres': [
    { name: 'Fenêtre PVC double vitrage', description: 'Fenêtre standard', price: 210, unit: 'unité', category: 'Menuiserie extérieure' },
    { name: 'Fenêtre aluminium', description: 'Fenêtre alu sur-mesure', price: 350, unit: 'unité', category: 'Menuiserie extérieure' },
    { name: 'Volet roulant manuel', description: 'Volet PVC', price: 140, unit: 'unité', category: 'Menuiserie extérieure' },
    { name: 'Volet roulant motorisé', description: 'Volet électrique', price: 260, unit: 'unité', category: 'Menuiserie extérieure' },
    { name: 'Seuil aluminium', description: 'Seuil extérieur', price: 19, unit: 'unité', category: 'Menuiserie extérieure' },
    { name: 'Joint d’étanchéité', description: 'Joint mousse', price: 2, unit: 'mètre', category: 'Menuiserie extérieure' },
    { name: 'Vitrage sécurité', description: 'Verre feuilleté', price: 65, unit: 'm²', category: 'Menuiserie extérieure' },
    { name: 'Bavette aluminium', description: 'Bavette alu', price: 7, unit: 'mètre', category: 'Menuiserie extérieure' },
    { name: 'Mousse expansive', description: 'Bombe', price: 6, unit: 'bombe', category: 'Menuiserie extérieure' },
    { name: 'Silicone extérieur', description: 'Cartouche', price: 6, unit: 'cartouche', category: 'Menuiserie extérieure' },
    { name: 'Visserie spéciale', description: 'Boîte de 50', price: 10, unit: 'boîte', category: 'Menuiserie extérieure' },
  ],
  'Isolation thermique': [
    { name: 'Laine de verre', description: 'Rouleau 100mm', price: 7, unit: 'm²', category: 'Isolation' },
    { name: 'Laine de roche', description: 'Panneau 100mm', price: 8, unit: 'm²', category: 'Isolation' },
    { name: 'Panneau polyuréthane', description: 'Panneau 80mm', price: 13, unit: 'm²', category: 'Isolation' },
    { name: 'Pare-vapeur', description: 'Film polyane', price: 1.5, unit: 'm²', category: 'Isolation' },
    { name: 'Suspente', description: 'Suspente métallique', price: 0.7, unit: 'unité', category: 'Isolation' },
    { name: 'Fourrure métallique', description: 'Profilé', price: 2.5, unit: 'mètre', category: 'Isolation' },
    { name: 'Bande adhésive', description: 'Rouleau', price: 5, unit: 'rouleau', category: 'Isolation' },
    { name: 'Rosace d’isolation', description: 'Rosace plastique', price: 0.3, unit: 'unité', category: 'Isolation' },
    { name: 'Cheville à frapper', description: 'Boîte de 50', price: 12, unit: 'boîte', category: 'Isolation' },
    { name: 'Mousse PU', description: 'Bombe', price: 6, unit: 'bombe', category: 'Isolation' },
  ],
  'Terrasse bois': [
    { name: 'Lame bois exotique', description: 'Lame terrasse 21x145mm', price: 42, unit: 'm²', category: 'Terrasse bois' },
    { name: 'Lame composite', description: 'Lame composite', price: 49, unit: 'm²', category: 'Terrasse bois' },
    { name: 'Lambourde bois', description: 'Lambourde classe 4', price: 7, unit: 'mètre', category: 'Terrasse bois' },
    { name: 'Plot réglable', description: 'Plot PVC', price: 3, unit: 'unité', category: 'Terrasse bois' },
    { name: 'Bande bitumeuse', description: 'Bande d’étanchéité', price: 15, unit: 'rouleau', category: 'Terrasse bois' },
    { name: 'Vis inox terrasse', description: 'Boîte de 200', price: 14, unit: 'boîte', category: 'Terrasse bois' },
    { name: 'Géotextile', description: 'Géotextile anti-repousse', price: 1.5, unit: 'm²', category: 'Terrasse bois' },
    { name: 'Huile de protection', description: 'Litres', price: 24, unit: 'litre', category: 'Terrasse bois' },
    { name: 'Scie sauteuse', description: 'Location', price: 18, unit: 'jour', category: 'Location' },
  ],
  'Maçonnerie paysagère': [
    { name: 'Pavé béton', description: 'Pavé 20x20x6cm', price: 19, unit: 'm²', category: 'Maçonnerie paysagère' },
    { name: 'Pavé granit', description: 'Pavé granit', price: 44, unit: 'm²', category: 'Maçonnerie paysagère' },
    { name: 'Bordure béton', description: 'Bordure 1m', price: 11, unit: 'mètre', category: 'Maçonnerie paysagère' },
    { name: 'Sable stabilisé', description: 'Sable 0/4', price: 38, unit: 'm³', category: 'Maçonnerie paysagère' },
    { name: 'Géotextile', description: 'Rouleau', price: 1.3, unit: 'm²', category: 'Maçonnerie paysagère' },
    { name: 'Joint polymère', description: 'Sac', price: 32, unit: 'sac', category: 'Maçonnerie paysagère' },
    { name: 'Béton prêt à l’emploi', description: 'Béton livré', price: 120, unit: 'm³', category: 'Maçonnerie paysagère' },
    { name: 'Location plaque vibrante', description: 'Jour', price: 25, unit: 'jour', category: 'Location' },
  ],
  'Chauffage / Plomberie chauffage': [
    { name: 'Radiateur acier', description: 'Radiateur 1200W', price: 110, unit: 'unité', category: 'Chauffage' },
    { name: 'Radiateur fonte', description: 'Radiateur fonte 1800W', price: 260, unit: 'unité', category: 'Chauffage' },
    { name: 'Chaudière gaz condensation', description: 'Chaudière murale', price: 2100, unit: 'unité', category: 'Chauffage' },
    { name: 'Chaudière électrique', description: 'Chaudière compacte', price: 1400, unit: 'unité', category: 'Chauffage' },
    { name: 'Thermostat programmable', description: 'Thermostat digital', price: 120, unit: 'unité', category: 'Chauffage' },
    { name: 'Tube multicouche', description: 'Tube 16mm', price: 2.5, unit: 'mètre', category: 'Chauffage' },
    { name: 'Raccord laiton', description: 'Raccord 16x16', price: 3, unit: 'unité', category: 'Chauffage' },
    { name: 'Purgeur automatique', description: 'Purgeur radiateur', price: 18, unit: 'unité', category: 'Chauffage' },
    { name: 'Circulateur', description: 'Circulateur chauffage', price: 140, unit: 'unité', category: 'Chauffage' },
    { name: 'Vanne d’arrêt', description: 'Vanne 1/4 tour', price: 11, unit: 'unité', category: 'Chauffage' },
  ],
  'Peinture façade': [
    { name: 'Peinture acrylique façade', description: 'Pot de 15L', price: 85, unit: 'litre', category: 'Peinture façade' },
    { name: 'Peinture siloxane', description: 'Pot de 15L', price: 110, unit: 'litre', category: 'Peinture façade' },
    { name: 'Sous-couche façade', description: 'Pot de 15L', price: 65, unit: 'litre', category: 'Peinture façade' },
    { name: 'Filet de protection', description: 'Filet 2x50m', price: 1.5, unit: 'm²', category: 'Peinture façade' },
    { name: 'Échafaudage', description: 'Location', price: 35, unit: 'jour', category: 'Location' },
    { name: 'Ruban adhésif extérieur', description: 'Rouleau', price: 5, unit: 'rouleau', category: 'Peinture façade' },
    { name: 'Enduit de rebouchage', description: 'Sac de 25kg', price: 19, unit: 'sac', category: 'Peinture façade' },
    { name: 'Brosse façade', description: 'Brosse large', price: 7, unit: 'unité', category: 'Peinture façade' },
    { name: 'Rouleau façade', description: 'Rouleau spécial façade', price: 9, unit: 'unité', category: 'Peinture façade' },
    { name: 'Nettoyeur haute pression', description: 'Location', price: 28, unit: 'jour', category: 'Location' },
  ],
  'Maison': [
    { name: 'Parpaing', description: 'Bloc béton standard', price: 90, unit: 'palette', category: 'Matériaux' },
    { name: 'Ciment', description: 'Sac de ciment 35kg', price: 8, unit: 'sac', category: 'Matériaux' },
    { name: 'Sable', description: 'Sable de construction', price: 45, unit: 'm³', category: 'Matériaux' },
    { name: 'Fer à béton', description: 'Tonne de fer à béton', price: 850, unit: 'tonne', category: 'Matériaux' },
    { name: 'Treillis soudé', description: 'Treillis pour dalle', price: 7, unit: 'm²', category: 'Matériaux' },
    { name: 'Gravier', description: 'Gravier pour béton', price: 35, unit: 'm³', category: 'Matériaux' },
    { name: 'Béton prêt à l’emploi', description: 'Béton livré', price: 120, unit: 'm³', category: 'Matériaux' },
    { name: 'Linteau béton', description: 'Linteau préfabriqué', price: 35, unit: 'unité', category: 'Matériaux' },
    { name: 'Hourdis', description: 'Hourdis béton/polystyrène', price: 5, unit: 'm²', category: 'Matériaux' },
    { name: 'Main d’œuvre', description: 'Travail horaire', price: 35, unit: 'heure', category: 'Main d’œuvre' },
  ],
  'Toiture': [
    { name: 'Tuiles', description: 'Tuiles terre cuite', price: 28, unit: 'm²', category: 'Toiture' },
    { name: 'Liteaux', description: 'Liteaux bois', price: 1, unit: 'mètre', category: 'Toiture' },
    { name: 'Écran sous-toiture', description: 'Membrane étanche', price: 3, unit: 'm²', category: 'Toiture' },
    { name: 'Chevrons', description: 'Charpente bois', price: 4, unit: 'mètre', category: 'Toiture' },
    { name: 'Clous/vis toiture', description: 'Boîte de 100', price: 7, unit: 'boîte', category: 'Toiture' },
    { name: 'Isolation toiture', description: 'Laine de verre', price: 8, unit: 'm²', category: 'Toiture' },
    { name: 'Gouttière PVC', description: 'Profilé gouttière', price: 6, unit: 'mètre', category: 'Toiture' },
    { name: 'Main d’œuvre', description: 'Travail horaire', price: 38, unit: 'heure', category: 'Main d’œuvre' },
  ],
  'Salle de bain': [
    { name: 'Carrelage sol', description: 'Grès cérame', price: 23, unit: 'm²', category: 'Salle de bain' },
    { name: 'Carrelage mural', description: 'Faïence', price: 18, unit: 'm²', category: 'Salle de bain' },
    { name: 'Receveur de douche', description: 'Receveur extra-plat', price: 180, unit: 'unité', category: 'Salle de bain' },
    { name: 'Paroi de douche', description: 'Paroi vitrée', price: 220, unit: 'unité', category: 'Salle de bain' },
    { name: 'Robinetterie', description: 'Mitigeur thermostatique', price: 90, unit: 'unité', category: 'Salle de bain' },
    { name: 'WC suspendu', description: 'Pack complet', price: 280, unit: 'unité', category: 'Salle de bain' },
    { name: 'Meuble vasque', description: 'Meuble + vasque', price: 250, unit: 'unité', category: 'Salle de bain' },
    { name: 'Peinture spéciale salle de bain', description: 'Peinture hydrofuge', price: 35, unit: 'litre', category: 'Salle de bain' },
    { name: 'Joint silicone', description: 'Cartouche', price: 7, unit: 'cartouche', category: 'Salle de bain' },
    { name: 'Main d’œuvre', description: 'Travail horaire', price: 40, unit: 'heure', category: 'Main d’œuvre' },
  ],
  'Électricité': [
    { name: 'Câble électrique', description: 'Câble 3G2.5', price: 1, unit: 'mètre', category: 'Électricité' },
    { name: 'Tableau électrique', description: 'Tableau 18 modules', price: 120, unit: 'unité', category: 'Électricité' },
    { name: 'Disjoncteur', description: 'Disjoncteur 16A', price: 9, unit: 'unité', category: 'Électricité' },
    { name: 'Prise électrique', description: 'Prise 2P+T', price: 5, unit: 'unité', category: 'Électricité' },
    { name: 'Interrupteur', description: 'Va-et-vient', price: 4, unit: 'unité', category: 'Électricité' },
    { name: 'Goulotte', description: 'Goulotte PVC', price: 2, unit: 'mètre', category: 'Électricité' },
    { name: 'Boîte de dérivation', description: 'Boîte encastrée', price: 3, unit: 'unité', category: 'Électricité' },
    { name: 'Gaine ICTA', description: 'Gaine annelée', price: 1, unit: 'mètre', category: 'Électricité' },
    { name: 'Ampoule LED', description: 'Ampoule 9W', price: 3, unit: 'unité', category: 'Électricité' },
    { name: 'Main d’œuvre', description: 'Travail horaire', price: 42, unit: 'heure', category: 'Main d’œuvre' },
  ],
  'Peinture': [
    { name: 'Peinture blanche', description: 'Peinture acrylique', price: 29, unit: 'litre', category: 'Peinture' },
    { name: 'Peinture couleur', description: 'Peinture satinée', price: 34, unit: 'litre', category: 'Peinture' },
    { name: 'Sous-couche', description: 'Primaire universel', price: 22, unit: 'litre', category: 'Peinture' },
    { name: 'Enduit de lissage', description: 'Enduit prêt à l’emploi', price: 16, unit: 'kg', category: 'Peinture' },
    { name: 'Ruban de masquage', description: 'Rouleau 50m', price: 4, unit: 'rouleau', category: 'Peinture' },
    { name: 'Bâche de protection', description: 'Bâche plastique', price: 1, unit: 'm²', category: 'Peinture' },
    { name: 'Brosse/pinceau', description: 'Pinceau plat', price: 5, unit: 'unité', category: 'Peinture' },
    { name: 'Rouleau peinture', description: 'Rouleau anti-goutte', price: 7, unit: 'unité', category: 'Peinture' },
    { name: 'Main d’œuvre', description: 'Travail horaire', price: 33, unit: 'heure', category: 'Main d’œuvre' },
  ],
  'Plomberie': [
    { name: 'Tube cuivre', description: 'Tube 16mm', price: 4, unit: 'mètre', category: 'Plomberie' },
    { name: 'Tube PER', description: 'Tube 16mm', price: 2, unit: 'mètre', category: 'Plomberie' },
    { name: 'Robinet d’arrêt', description: 'Robinet 1/4 de tour', price: 8, unit: 'unité', category: 'Plomberie' },
    { name: 'Évier inox', description: 'Évier 1 bac', price: 95, unit: 'unité', category: 'Plomberie' },
    { name: 'Mitigeur évier', description: 'Mitigeur chromé', price: 55, unit: 'unité', category: 'Plomberie' },
    { name: 'Siphon évier', description: 'Siphon plastique', price: 12, unit: 'unité', category: 'Plomberie' },
    { name: 'Flexible alimentation', description: 'Flexible inox', price: 7, unit: 'unité', category: 'Plomberie' },
    { name: 'Joint plomberie', description: 'Sachet de joints', price: 4, unit: 'sachet', category: 'Plomberie' },
    { name: 'Main d’œuvre', description: 'Travail horaire', price: 39, unit: 'heure', category: 'Main d’œuvre' },
  ],
};

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
    if (product.is_template) return; // Sécurité : on ne peut pas éditer un template
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
    const product = products.find(p => p.id === id);
    if (product?.is_template) return; // Sécurité : on ne peut pas supprimer un template
    try {
      await deleteProduct.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ); // Les templates sont inclus automatiquement

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
            <p className="text-cyan-700">Gérez votre catalogue de produits et services</p>
          </div>

          {/* Sélecteur de template */}
          <div className="flex gap-2">
            <select
              className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-semibold"
              id="template-select"
              defaultValue=""
              onChange={async (e) => {
                const service = e.target.value;
                if (service && SERVICE_TEMPLATES[service]) {
                  for (const prod of SERVICE_TEMPLATES[service]) {
                    try {
                      await createProduct.mutateAsync(prod);
                    } catch (err) {
                      // Optionnel : gestion d'erreur par produit
                    }
                  }
                }
                e.target.value = '';
              }}
            >
              <option value="">+ Insérer un template de service</option>
              {Object.keys(SERVICE_TEMPLATES).map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md"
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
                      className="bg-white border border-gray-200 shadow-md rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-white border border-gray-200 shadow-md rounded-xl min-h-[80px]"
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
                        className="bg-white border border-gray-200 shadow-md rounded-xl"
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
                        className="bg-white border border-gray-200 shadow-md rounded-xl"
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
                      className="bg-white border border-gray-200 shadow-md rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md">
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

        {/* Search bar */}
        <div className="mb-4">
          <Input
            placeholder="Rechercher par nom ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs bg-white border border-gray-200 shadow-md rounded-full"
          />
        </div>

        {/* Products grid/list */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-card border-0 bg-white border border-gray-200 shadow-md rounded-xl">
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-indigo-700">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full"
                      onClick={() => handleEdit(product)}
                      disabled={product.is_template}
                      title={product.is_template ? "Produit partagé par défaut, non modifiable" : "Modifier"}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteProduct.isPending || product.is_template}
                      title={product.is_template ? "Produit partagé par défaut, non supprimable" : "Supprimer"}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-4">
                  <span>Prix: <span className="font-bold text-indigo-700">{product.price} €</span> / {product.unit}</span>
                  <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">{product.category}</span>
                  {product.is_template && (
                    <span className="bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full ml-2" title="Produit partagé par défaut">Template</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <Card className="shadow-card border-0 bg-white border border-gray-200 shadow-md rounded-xl">
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
      </div>
    </Layout>
  );
};

export default ProductsManagement;
