-- Ajouter le champ depositor_id à la table cbn_documents pour identifier le propriétaire/déposant
ALTER TABLE cbn_documents 
ADD COLUMN depositor_id UUID REFERENCES auth.users(id);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX idx_cbn_documents_depositor_id ON cbn_documents(depositor_id);

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN cbn_documents.depositor_id IS 'ID de l''utilisateur qui a déposé/possède le document (pour dépôt légal)';