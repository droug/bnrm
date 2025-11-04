// Configuration de la messagerie
export const messagingConfig = {
  // Mode de présentation: "panel" (défile avec la page) ou "overlay" (fixe au viewport)
  presentationMode: "panel" as "panel" | "overlay",
  
  // Largeur du panel en pixels
  panelWidth: 480,
  
  // Hauteur maximale en vh pour le mode overlay
  overlayMaxHeightVh: 88,
  
  // Filtres disponibles
  filters: ["all", "unread", "priority", "groups"] as const,
};

export type MessagingFilter = typeof messagingConfig.filters[number];
