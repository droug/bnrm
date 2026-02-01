-- Augmenter la limite de taille des fichiers pour le bucket Storage utilisé par la bibliothèque numérique
-- Objectif: éviter l'erreur 413 "Payload too large" lors d'uploads PDF 20–100 MB

UPDATE storage.buckets
SET file_size_limit = GREATEST(COALESCE(file_size_limit, 0), 209715200) -- 200 MB
WHERE id = 'digital-library';
