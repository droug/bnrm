import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie l'unicité de l'email pour les inscriptions professionnelles.
 * Règle : Un même email peut être utilisé pour un compte Éditeur ET un compte Imprimeur,
 * mais pas pour d'autres combinaisons (ex: 2 comptes Éditeur, ou Éditeur + Producteur).
 * 
 * @param email - L'email à vérifier
 * @param professionalType - Le type de professionnel demandé ('editor', 'printer', 'producer')
 * @returns { allowed: boolean, message?: string }
 */
export async function checkProfessionalEmailUniqueness(
  email: string,
  professionalType: 'editor' | 'printer' | 'producer'
): Promise<{ allowed: boolean; message?: string }> {
  // Les paires autorisées : editor <-> printer
  const allowedPairTypes = ['editor', 'printer'];

  // Chercher les demandes existantes avec cet email (pending ou approved)
  const { data: existingRequests, error } = await supabase
    .from('professional_registration_requests')
    .select('professional_type, status, registration_data')
    .in('status', ['pending', 'approved']);

  if (error) {
    console.error('Error checking email uniqueness:', error);
    return { allowed: true }; // En cas d'erreur, ne pas bloquer
  }

  // Filtrer par email dans registration_data (stocké en JSON)
  const matchingRequests = (existingRequests || []).filter((req: any) => {
    const regData = req.registration_data as any;
    return regData?.email?.toLowerCase() === email.toLowerCase();
  });

  if (matchingRequests.length === 0) {
    return { allowed: true };
  }

  // Vérifier si le même type existe déjà
  const sameTypeExists = matchingRequests.some(
    (req: any) => req.professional_type === professionalType
  );
  if (sameTypeExists) {
    return {
      allowed: false,
      message: `Une demande d'inscription en tant que ${
        professionalType === 'editor' ? 'Éditeur' : 
        professionalType === 'printer' ? 'Imprimeur' : 'Producteur'
      } existe déjà avec cet email.`
    };
  }

  // Vérifier la règle editor/printer
  const existingTypes = matchingRequests.map((req: any) => req.professional_type);
  const allTypes = [...existingTypes, professionalType];

  // Si tous les types sont dans la paire autorisée (editor/printer), c'est OK
  const allInAllowedPair = allTypes.every(t => allowedPairTypes.includes(t));
  if (allInAllowedPair && allTypes.length <= 2) {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: "Cet email est déjà utilisé pour un autre compte professionnel. Un même email ne peut être partagé qu'entre un compte Éditeur et un compte Imprimeur."
  };
}
