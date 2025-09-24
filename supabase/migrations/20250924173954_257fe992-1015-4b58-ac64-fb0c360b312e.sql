-- Création des tables pour le portail BNRM

-- Table des services BNRM
CREATE TABLE public.bnrm_services (
  id_service TEXT PRIMARY KEY,
  categorie TEXT NOT NULL,
  nom_service TEXT NOT NULL,
  description TEXT NOT NULL,
  public_cible TEXT NOT NULL,
  reference_legale TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tarifs paramétrables
CREATE TABLE public.bnrm_tarifs (
  id_tarif TEXT PRIMARY KEY,
  id_service TEXT NOT NULL REFERENCES public.bnrm_services(id_service),
  montant DECIMAL(10,2) NOT NULL,
  devise TEXT NOT NULL DEFAULT 'DH',
  condition_tarif TEXT,
  periode_validite TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table d'historisation des tarifs
CREATE TABLE public.bnrm_tarifs_historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tarif TEXT NOT NULL,
  ancienne_valeur DECIMAL(10,2),
  nouvelle_valeur DECIMAL(10,2),
  date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  utilisateur_responsable UUID REFERENCES auth.users(id),
  commentaire TEXT,
  action TEXT NOT NULL -- 'CREATE', 'UPDATE', 'DELETE'
);

-- Table des paramètres généraux
CREATE TABLE public.bnrm_parametres (
  parametre TEXT PRIMARY KEY,
  valeur TEXT NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bnrm_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bnrm_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bnrm_tarifs_historique ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bnrm_parametres ENABLE ROW LEVEL SECURITY;

-- Policies pour les services
CREATE POLICY "Everyone can view BNRM services" 
ON public.bnrm_services FOR SELECT USING (true);

CREATE POLICY "Admins and librarians can manage BNRM services" 
ON public.bnrm_services FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- Policies pour les tarifs
CREATE POLICY "Everyone can view active BNRM tariffs" 
ON public.bnrm_tarifs FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and librarians can manage BNRM tariffs" 
ON public.bnrm_tarifs FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- Policies pour l'historique des tarifs
CREATE POLICY "Admins can view tariff history" 
ON public.bnrm_tarifs_historique FOR SELECT USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "System can insert tariff history" 
ON public.bnrm_tarifs_historique FOR INSERT WITH CHECK (true);

-- Policies pour les paramètres
CREATE POLICY "Everyone can view BNRM parameters" 
ON public.bnrm_parametres FOR SELECT USING (true);

CREATE POLICY "Admins can manage BNRM parameters" 
ON public.bnrm_parametres FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- Trigger pour l'historisation automatique des tarifs
CREATE OR REPLACE FUNCTION public.historiser_tarifs()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.bnrm_tarifs_historique 
    (id_tarif, ancienne_valeur, nouvelle_valeur, utilisateur_responsable, action, commentaire)
    VALUES 
    (OLD.id_tarif, OLD.montant, NEW.montant, auth.uid(), 'UPDATE', 
     'Modification du tarif de ' || OLD.montant || ' à ' || NEW.montant || ' ' || NEW.devise);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.bnrm_tarifs_historique 
    (id_tarif, ancienne_valeur, nouvelle_valeur, utilisateur_responsable, action, commentaire)
    VALUES 
    (OLD.id_tarif, OLD.montant, NULL, auth.uid(), 'DELETE', 'Suppression du tarif');
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.bnrm_tarifs_historique 
    (id_tarif, ancienne_valeur, nouvelle_valeur, utilisateur_responsable, action, commentaire)
    VALUES 
    (NEW.id_tarif, NULL, NEW.montant, auth.uid(), 'CREATE', 'Création du tarif');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_historiser_tarifs
  AFTER INSERT OR UPDATE OR DELETE ON public.bnrm_tarifs
  FOR EACH ROW EXECUTE FUNCTION public.historiser_tarifs();

-- Trigger pour updated_at
CREATE TRIGGER update_bnrm_services_updated_at
  BEFORE UPDATE ON public.bnrm_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bnrm_tarifs_updated_at
  BEFORE UPDATE ON public.bnrm_tarifs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bnrm_parametres_updated_at
  BEFORE UPDATE ON public.bnrm_parametres
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion des données initiales

-- Services BNRM
INSERT INTO public.bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale) VALUES
('S001', 'Inscription', 'Étudiants/chercheurs', 'Accès à toutes les salles de lecture', 'Étudiants inscrits en cycle supérieur', 'Loi 67-99, Décision 2014'),
('S002', 'Inscription', 'Grand public', 'Accès Grande salle', 'Toute personne titulaire du bac ou plus', 'Loi 67-99'),
('S003', 'Inscription', 'Pass Jeunes', 'Accès Grande salle & Espace jeunesse', '6 à 30 ans, titulaire Pass Jeunes', 'Décision 2014'),
('S004', 'Reproduction', 'Impression papier NB', 'Photocopie/scanner A4, A3 noir & blanc', 'Tous usagers', 'Loi 67-99'),
('S005', 'Reproduction', 'Impression papier couleur', 'Photocopie/scanner A4, A3 couleur', 'Tous usagers', 'Loi 67-99'),
('S006', 'Reproduction', 'Numérisation documents rares', 'Manuscrits, lithographies, livres rares', 'Chercheurs & particuliers', 'Décision 2014'),
('S007', 'Location', 'Auditorium', 'Location par journée/soirée', 'Institutions, associations, particuliers', 'Décision 2014'),
('S008', 'Location', 'Salle de conférence', 'Location par journée/soirée', 'Institutions, associations, particuliers', 'Décision 2014'),
('S009', 'Location', 'Espace enfants', 'Activités éducatives 4–10 ans', 'Écoles, associations, parents', 'Décision 2014'),
('S010', 'Location', 'Espace jeunesse', 'Activités 11–30 ans', 'Jeunes & étudiants', 'Décision 2014'),
('S011', 'Formation', 'Formation en bibliothéconomie', 'Catalogage, numérisation, restauration', 'Sur place, à distance ou chez client', 'Décision 2014');

-- Tarifs
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite) VALUES
('T001', 'S001', 150.00, 'DH', 'Inscription annuelle étudiants/chercheurs', '2025'),
('T002', 'S001', 200.00, 'DH', 'Inscription semestrielle étudiants/chercheurs', '2025'),
('T003', 'S002', 60.00, 'DH', 'Inscription annuelle grand public', '2025'),
('T004', 'S002', 100.00, 'DH', 'Inscription semestrielle grand public', '2025'),
('T005', 'S003', 30.00, 'DH', 'Pass Jeunes – inscription annuelle', '2025'),
('T006', 'S003', 50.00, 'DH', 'Pass Jeunes – inscription semestrielle', '2025'),
('T007', 'S004', 0.50, 'DH/page', 'A4 NB', '2025'),
('T008', 'S004', 1.00, 'DH/page', 'A3 NB', '2025'),
('T009', 'S005', 2.50, 'DH/page', 'A4 couleur', '2025'),
('T010', 'S005', 3.50, 'DH/page', 'A3 couleur', '2025'),
('T011', 'S006', 2.50, 'DH/page', 'Numérisation non commerciale', '2025'),
('T012', 'S006', 600.00, 'DH/page', 'Numérisation usage institutionnel', '2025'),
('T013', 'S007', 10000.00, 'DH', 'Auditorium (journée)', '2025'),
('T014', 'S007', 15000.00, 'DH', 'Auditorium (soirée)', '2025'),
('T015', 'S008', 5000.00, 'DH', 'Salle de conférence (journée)', '2025'),
('T016', 'S008', 8000.00, 'DH', 'Salle de conférence (soirée)', '2025'),
('T017', 'S009', 10.00, 'DH/enfant/jour', 'Écoles publiques ou associations', '2025'),
('T018', 'S009', 20.00, 'DH/enfant/jour', 'Parents ou écoles privées', '2025'),
('T019', 'S010', 20.00, 'DH/jour', 'Jeunes 11–16 ans (élèves, collégiens)', '2025'),
('T020', 'S010', 0.00, 'DH/jour', 'Jeunes 16–30 ans avec Pass Jeunes', '2025'),
('T021', 'S011', 250.00, 'DH/jour/personne', 'Formation sur place', '2025'),
('T022', 'S011', 200.00, 'DH/jour/personne', 'Formation à distance', '2025'),
('T023', 'S011', 300.00, 'DH/jour/personne', 'Formation chez client', '2025');

-- Paramètres généraux
INSERT INTO public.bnrm_parametres (parametre, valeur, commentaire) VALUES
('Devise par défaut', 'DH', 'Dirham marocain'),
('Révision_tarifs', 'Oui', 'Tarifs modifiables par décision BNRM & Ministère'),
('Historisation', 'Activée', 'Chaque mise à jour doit conserver l''historique'),
('Responsable', 'BNRM', 'Bibliothèque Nationale du Royaume du Maroc'),
('Dernière_mise_à_jour', '2025-09-24', 'Date de paramétrage initial');