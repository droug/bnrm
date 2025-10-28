import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MonographDepositFormData } from '@/schemas/legalDepositSchema';

/**
 * Hook personnalisé pour gérer les règles de validation dynamiques du dépôt légal
 * Gère l'affichage conditionnel et la validation des champs selon les règles métiers
 */
export function useLegalDepositValidation(
  form: UseFormReturn<MonographDepositFormData>
) {
  const publicationType = form.watch('publication.publicationType');
  const authorType = form.watch('author.authorType');

  // Déterminer quels documents sont obligatoires
  const isThesisRecommendationRequired = publicationType === 'these';
  const isQuranAuthorizationRequired = publicationType === 'coran';

  // Déterminer quels champs d'auteur sont obligatoires
  const isAuthorStatusRequired = authorType === 'morale';
  const isAuthorGenderRequired = authorType === 'physique';
  const isAuthorBirthDateRequired = authorType === 'physique';

  // Validation personnalisée des documents
  useEffect(() => {
    // Marquer le champ thesisRecommendation comme requis si c'est une thèse
    if (isThesisRecommendationRequired) {
      const thesisDoc = form.getValues('documents.thesisRecommendation');
      if (!thesisDoc) {
        form.setError('documents.thesisRecommendation', {
          type: 'required',
          message: 'La recommandation est obligatoire pour une thèse'
        });
      } else {
        form.clearErrors('documents.thesisRecommendation');
      }
    } else {
      form.clearErrors('documents.thesisRecommendation');
    }
  }, [isThesisRecommendationRequired, form]);

  useEffect(() => {
    // Marquer le champ quranAuthorization comme requis si c'est un Coran
    if (isQuranAuthorizationRequired) {
      const quranDoc = form.getValues('documents.quranAuthorization');
      if (!quranDoc) {
        form.setError('documents.quranAuthorization', {
          type: 'required',
          message: 'L\'autorisation de la Fondation Mohammed VI est obligatoire pour un Coran'
        });
      } else {
        form.clearErrors('documents.quranAuthorization');
      }
    } else {
      form.clearErrors('documents.quranAuthorization');
    }
  }, [isQuranAuthorizationRequired, form]);

  return {
    // Flags pour affichage conditionnel
    isThesisRecommendationRequired,
    isQuranAuthorizationRequired,
    isAuthorStatusRequired,
    isAuthorGenderRequired,
    isAuthorBirthDateRequired,
    
    // Données de surveillance
    publicationType,
    authorType,
  };
}
