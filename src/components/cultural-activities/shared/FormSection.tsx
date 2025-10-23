import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const FormSection = ({ title, description, children, icon, className = "" }: FormSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4 pl-0 md:pl-13">
        {children}
      </div>
    </div>
  );
};

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

export const FormCard = ({ title, description, children, icon, actions }: FormCardProps) => {
  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="text-base mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};
