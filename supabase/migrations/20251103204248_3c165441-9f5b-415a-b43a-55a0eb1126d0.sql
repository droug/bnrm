-- Supprimer les tarifs en double
DELETE FROM bnrm_tarifs 
WHERE id_tarif IN ('T001', 'T002', 'T003', 'T004', 'T005', 'T006', 'TI001', 'TI002', 'TI003', 'TI004', 'TI005');