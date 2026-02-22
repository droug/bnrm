
-- Supprimer les tarifs associés aux 3 services
DELETE FROM public.bnrm_tarifs WHERE id_service IN ('S004', 'S005', 'S006');

-- Supprimer les 3 services
DELETE FROM public.bnrm_services WHERE id_service IN ('S004', 'S005', 'S006');
