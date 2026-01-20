import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface LegalDepositHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  warningText?: string;
}

export function LegalDepositHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  iconColorClass,
  iconBgClass,
  warningText
}: LegalDepositHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/depot-legal")}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux types de dépôt
      </Button>

      <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${iconBgClass} shadow-md`}>
              <Icon className={`h-8 w-8 ${iconColorClass}`} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {subtitle}
              </p>
              {warningText && (
                <p className="text-sm text-destructive mt-2 font-medium">
                  {warningText}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
