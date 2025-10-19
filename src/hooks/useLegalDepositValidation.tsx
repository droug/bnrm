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
  const publisherName = form.watch('publisher.publisherName');

  // Déterminer quels documents sont obligatoires
  const isThesisRecommendationRequired = publicationType === 'these';
  const isQuranAuthorizationRequired = publicationType === 'coran';
  const isAmazonLinkRequired = publisherName?.toLowerCase().includes('amazon') || false;

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

  useEffect(() => {
    // Validation du lien Amazon
    if (isAmazonLinkRequired) {
      const amazonLink = form.getValues('publisher.amazonLink');
      if (!amazonLink) {
        form.setError('publisher.amazonLink', {
          type: 'required',
          message: 'Le lien du produit Amazon est obligatoire'
        });
      } else if (!amazonLink.toLowerCase().includes('amazon.')) {
        form.setError('publisher.amazonLink', {
          type: 'pattern',
          message: 'L\'URL fournie n\'est pas valide. Seules les pages Amazon officielles sont acceptées.'
        });
      } else {
        form.clearErrors('publisher.amazonLink');
      }
    } else {
      form.clearErrors('publisher.amazonLink');
    }
  }, [isAmazonLinkRequired, publisherName, form]);

  return {
    // Flags pour affichage conditionnel
    isThesisRecommendationRequired,
    isQuranAuthorizationRequired,
    isAmazonLinkRequired,
    isAuthorStatusRequired,
    isAuthorGenderRequired,
    isAuthorBirthDateRequired,
    
    // Données de surveillance
    publicationType,
    authorType,
    publisherName,
  };
}
