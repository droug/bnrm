-- Mettre à jour les demandes fictives avec des métadonnées complètes et pièces jointes

-- Demande 1: Brouillon - données complètes
UPDATE public.reproduction_requests
SET 
  user_notes = 'Je souhaite obtenir une copie numérique haute résolution des pages 1-15 du manuscrit de Fiqh Maliki pour mes recherches doctorales sur l''évolution du droit islamique au Maghreb.',
  metadata = jsonb_build_object(
    'institution', 'Université Mohammed V - Rabat',
    'chercheur', 'Dr. Ahmed Benjelloun',
    'email', 'ahmed.benjelloun@um5.ac.ma',
    'telephone', '+212 6 12 34 56 78',
    'specialite', 'Droit islamique et histoire du Maghreb',
    'projet', 'Thèse de doctorat sur l''évolution du Fiqh Maliki au Maroc médiéval',
    'justification', 'Analyse paléographique et comparative des textes juridiques'
  ),
  supporting_documents = jsonb_build_array(
    jsonb_build_object(
      'name', 'Carte_étudiant_2024.pdf',
      'type', 'application/pdf',
      'size', '245 KB',
      'url', '/uploads/documents/carte_etudiant.pdf',
      'uploaded_at', NOW() - INTERVAL '2 days'
    ),
    jsonb_build_object(
      'name', 'Lettre_autorisation_directeur_these.pdf',
      'type', 'application/pdf',
      'size', '128 KB',
      'url', '/uploads/documents/lettre_autorisation.pdf',
      'uploaded_at', NOW() - INTERVAL '2 days'
    ),
    jsonb_build_object(
      'name', 'Projet_recherche_resume.pdf',
      'type', 'application/pdf',
      'size', '512 KB',
      'url', '/uploads/documents/projet_recherche.pdf',
      'uploaded_at', NOW() - INTERVAL '2 days'
    )
  )
WHERE status = 'brouillon';

-- Demande 2: Soumise - données complètes
UPDATE public.reproduction_requests
SET 
  user_notes = 'Demande urgente de reproduction pour publication dans la revue "Islamic Law Review". Les images seront utilisées comme illustrations dans un article scientifique sur l''architecture des manuscrits marocains.',
  metadata = jsonb_build_object(
    'institution', 'Centre d''Études Historiques et Patrimoine',
    'chercheur', 'Pr. Fatima El Mansouri',
    'email', 'f.elmansouri@ceh.ma',
    'telephone', '+212 5 37 12 34 56',
    'specialite', 'Histoire et patrimoine manuscrit',
    'projet', 'Publication scientifique - Islamic Law Review Q2 2025',
    'date_publication', '2025-06-15',
    'editeur', 'Brill Academic Publishers',
    'droits_utilisation', 'Académique - Citation complète requise'
  ),
  supporting_documents = jsonb_build_array(
    jsonb_build_object(
      'name', 'Autorisation_publication_revue.pdf',
      'type', 'application/pdf',
      'size', '189 KB',
      'url', '/uploads/documents/autorisation_pub.pdf',
      'uploaded_at', NOW() - INTERVAL '5 days'
    ),
    jsonb_build_object(
      'name', 'Contrat_editeur_Brill.pdf',
      'type', 'application/pdf',
      'size', '345 KB',
      'url', '/uploads/documents/contrat_editeur.pdf',
      'uploaded_at', NOW() - INTERVAL '5 days'
    ),
    jsonb_build_object(
      'name', 'Copie_CIN.pdf',
      'type', 'application/pdf',
      'size', '156 KB',
      'url', '/uploads/documents/cin_copie.pdf',
      'uploaded_at', NOW() - INTERVAL '5 days'
    ),
    jsonb_build_object(
      'name', 'CV_chercheur.pdf',
      'type', 'application/pdf',
      'size', '423 KB',
      'url', '/uploads/documents/cv_chercheur.pdf',
      'uploaded_at', NOW() - INTERVAL '5 days'
    )
  )
WHERE status = 'soumise';

-- Demande 3: En validation service
UPDATE public.reproduction_requests
SET 
  user_notes = 'Demande de reproduction en TIFF non compressé pour archivage institutionnel de longue durée. Ces documents historiques seront intégrés dans notre base de données patrimoniale nationale.',
  metadata = jsonb_build_object(
    'institution', 'Archives Nationales du Royaume du Maroc',
    'responsable', 'M. Youssef Alaoui',
    'fonction', 'Conservateur en chef',
    'email', 'y.alaoui@archives.gov.ma',
    'telephone', '+212 5 37 77 11 22',
    'departement', 'Conservation et Numérisation',
    'projet', 'Programme national de sauvegarde du patrimoine documentaire',
    'budget_reference', 'AN-2024-PNSPD-156',
    'duree_conservation', 'Permanente',
    'normes_archivage', 'ISO 19005-1 (PDF/A), TIFF non compressé'
  ),
  service_validation_notes = 'Documents vérifiés et disponibles. Format TIFF confirmé. Préparation en cours.',
  supporting_documents = jsonb_build_array(
    jsonb_build_object(
      'name', 'Ordre_mission_officiel.pdf',
      'type', 'application/pdf',
      'size', '234 KB',
      'url', '/uploads/documents/ordre_mission.pdf',
      'uploaded_at', NOW() - INTERVAL '10 days'
    ),
    jsonb_build_object(
      'name', 'Autorisation_ministere_culture.pdf',
      'type', 'application/pdf',
      'size', '567 KB',
      'url', '/uploads/documents/autorisation_ministere.pdf',
      'uploaded_at', NOW() - INTERVAL '10 days'
    ),
    jsonb_build_object(
      'name', 'Cahier_charges_numerisation.pdf',
      'type', 'application/pdf',
      'size', '789 KB',
      'url', '/uploads/documents/cahier_charges.pdf',
      'uploaded_at', NOW() - INTERVAL '10 days'
    )
  )
WHERE status = 'en_validation_service';

-- Demande 4: En traitement
UPDATE public.reproduction_requests
SET 
  user_notes = 'Reproductions papier haute qualité nécessaires pour une exposition temporaire au Musée Mohammed VI d''Art Moderne et Contemporain. Les images seront agrandies et encadrées.',
  metadata = jsonb_build_object(
    'institution', 'Musée Mohammed VI d''Art Moderne et Contemporain',
    'responsable', 'Mme. Samira Tazi',
    'fonction', 'Commissaire d''exposition',
    'email', 's.tazi@musee.ma',
    'telephone', '+212 5 29 80 80 80',
    'projet', 'Exposition "Manuscrits du Patrimoine Marocain"',
    'date_exposition', '2025-03-15 au 2025-06-30',
    'nombre_visiteurs_estime', '15000',
    'lieu_exposition', 'Musée Mohammed VI - Rabat',
    'assurance', 'AXA Art Insurance - Police N° ART-2024-5678',
    'conditions_exposition', 'Lumière tamisée, température contrôlée 18-22°C'
  ),
  service_validation_notes = 'Demande approuvée. Documents disponibles pour reproduction.',
  manager_validation_notes = 'Autorisé pour exposition muséale. Vérifier les conditions de conservation lors du retour.',
  internal_notes = 'PRIORITAIRE - Exposition importante. Coordonner avec le département de conservation pour la préparation des reproductions.',
  payment_method = 'virement',
  payment_amount = 80.00,
  payment_status = 'paid',
  paid_at = NOW() - INTERVAL '22 days',
  supporting_documents = jsonb_build_array(
    jsonb_build_object(
      'name', 'Convention_pret_exposition.pdf',
      'type', 'application/pdf',
      'size', '445 KB',
      'url', '/uploads/documents/convention_pret.pdf',
      'uploaded_at', NOW() - INTERVAL '30 days'
    ),
    jsonb_build_object(
      'name', 'Police_assurance_oeuvres.pdf',
      'type', 'application/pdf',
      'size', '678 KB',
      'url', '/uploads/documents/assurance_oeuvres.pdf',
      'uploaded_at', NOW() - INTERVAL '30 days'
    ),
    jsonb_build_object(
      'name', 'Programme_exposition_detaille.pdf',
      'type', 'application/pdf',
      'size', '1.2 MB',
      'url', '/uploads/documents/programme_expo.pdf',
      'uploaded_at', NOW() - INTERVAL '30 days'
    ),
    jsonb_build_object(
      'name', 'Autorisation_reproduction_commerciale.pdf',
      'type', 'application/pdf',
      'size', '234 KB',
      'url', '/uploads/documents/autorisation_commerciale.pdf',
      'uploaded_at', NOW() - INTERVAL '30 days'
    )
  )
WHERE status = 'en_traitement';

-- Demande 5: Terminée
UPDATE public.reproduction_requests
SET 
  user_notes = 'Demande de numérisation pour ma thèse de doctorat en histoire médiévale. Les documents seront analysés dans le cadre de mes recherches sur les traités de médecine traditionnelle au Maghreb.',
  metadata = jsonb_build_object(
    'institution', 'Université Hassan II - Casablanca',
    'chercheur', 'Mme. Leila Bennani',
    'statut', 'Doctorante en Histoire',
    'email', 'l.bennani@uh2.ac.ma',
    'telephone', '+212 6 45 67 89 12',
    'directeur_these', 'Pr. Mohamed El Fassi',
    'specialite', 'Histoire de la médecine au Maghreb médiéval',
    'annee_these', '3ème année',
    'date_soutenance_prevue', '2026-09-15',
    'universite', 'Université Hassan II - Faculté des Lettres et Sciences Humaines'
  ),
  service_validation_notes = 'Documents numérisés selon les spécifications demandées.',
  manager_validation_notes = 'Validation finale approuvée. Fichiers disponibles.',
  internal_notes = 'Excellente qualité de numérisation. Client satisfait.',
  payment_method = 'carte_bancaire',
  payment_amount = 280.00,
  payment_status = 'paid',
  paid_at = NOW() - INTERVAL '40 days',
  available_at = NOW() - INTERVAL '18 days',
  expires_at = NOW() + INTERVAL '12 days',
  download_count = 3,
  supporting_documents = jsonb_build_array(
    jsonb_build_object(
      'name', 'Carte_etudiant_UH2.pdf',
      'type', 'application/pdf',
      'size', '198 KB',
      'url', '/uploads/documents/carte_etudiant_uh2.pdf',
      'uploaded_at', NOW() - INTERVAL '45 days'
    ),
    jsonb_build_object(
      'name', 'Attestation_inscription_doctorat.pdf',
      'type', 'application/pdf',
      'size', '167 KB',
      'url', '/uploads/documents/attestation_inscription.pdf',
      'uploaded_at', NOW() - INTERVAL '45 days'
    ),
    jsonb_build_object(
      'name', 'Synopsis_these.pdf',
      'type', 'application/pdf',
      'size', '456 KB',
      'url', '/uploads/documents/synopsis_these.pdf',
      'uploaded_at', NOW() - INTERVAL '45 days'
    )
  )
WHERE status = 'terminee';

-- Demande 6: Refusée
UPDATE public.reproduction_requests
SET 
  user_notes = 'Je souhaite obtenir une copie numérique complète du manuscrit rare "المعجم الجغرافي للمغرب" pour un projet de recherche personnel sur la géographie historique.',
  metadata = jsonb_build_object(
    'nom', 'M. Karim Bennis',
    'statut', 'Chercheur indépendant',
    'email', 'k.bennis.recherche@gmail.com',
    'telephone', '+212 6 98 76 54 32',
    'projet', 'Étude personnelle de la géographie historique',
    'objectif', 'Recherche personnelle et vulgarisation scientifique'
  ),
  rejection_reason = 'Ce manuscrit est soumis à des restrictions strictes de droits d''auteur et de conservation en raison de sa rareté et de son état de fragilité. Une autorisation spéciale du comité scientifique est requise pour toute reproduction complète. Nous vous invitons à consulter le manuscrit sur place dans notre salle de lecture spécialisée, ou à faire une demande limitée à certaines pages spécifiques (maximum 20% du document).',
  internal_notes = 'Manuscrit classé "très fragile". Consultation sur place uniquement sauf autorisation exceptionnelle du comité.',
  supporting_documents = jsonb_build_array(
    jsonb_build_object(
      'name', 'Copie_CIN_demandeur.pdf',
      'type', 'application/pdf',
      'size', '145 KB',
      'url', '/uploads/documents/cin_demandeur.pdf',
      'uploaded_at', NOW() - INTERVAL '15 days'
    ),
    jsonb_build_object(
      'name', 'Lettre_motivation.pdf',
      'type', 'application/pdf',
      'size', '89 KB',
      'url', '/uploads/documents/lettre_motivation.pdf',
      'uploaded_at', NOW() - INTERVAL '15 days'
    )
  )
WHERE status = 'refusee';