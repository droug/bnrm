import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  backTo?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ 
  title, 
  description, 
  icon, 
  backTo = "/admin/activites-culturelles",
  actions 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          {icon && (
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <Button
        variant="outline"
        onClick={() => navigate(backTo)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au menu
      </Button>
    </div>
  );
};
