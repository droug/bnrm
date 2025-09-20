import React from "react";
import { Watermark } from "./watermark";

interface ProtectedWatermarkProps {
  userRole?: string;
  isProtected?: boolean;
  className?: string;
}

export const ProtectedWatermark: React.FC<ProtectedWatermarkProps> = ({
  userRole = "visitor",
  isProtected = true,
  className
}) => {
  if (!isProtected) return null;

  const getWatermarkText = () => {
    switch (userRole) {
      case "admin":
        return "BNRM Administration - Accès Privilégié";
      case "librarian":
        return "BNRM Bibliothécaire - Document Protégé";
      case "researcher":
        return "BNRM Chercheur - Usage Académique";
      default:
        return "BNRM - Document Protégé";
    }
  };

  const getWatermarkVariant = () => {
    switch (userRole) {
      case "admin":
        return "visible" as const;
      case "librarian":
        return "branded" as const;
      default:
        return "subtle" as const;
    }
  };

  return (
    <Watermark
      text={getWatermarkText()}
      variant={getWatermarkVariant()}
      position="diagonal"
      opacity={userRole === "admin" ? 0.08 : 0.04}
      className={className}
    />
  );
};