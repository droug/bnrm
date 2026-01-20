import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface LegalDepositInfoCardProps {
  documents: string[];
  icon: LucideIcon;
  buttonLabel: string;
  onStartDeclaration: () => void;
  showReciprocalWarning?: boolean;
}

export function LegalDepositInfoCard({
  documents,
  icon: Icon,
  buttonLabel,
  onStartDeclaration,
  showReciprocalWarning = true
}: LegalDepositInfoCardProps) {
  return (
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Documents concernés</CardTitle>
        <CardDescription>
          Types de documents acceptés pour cette catégorie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground text-sm">{doc}</p>
            </div>
          ))}
        </div>
        
        {showReciprocalWarning && (
          <p className="text-destructive text-sm font-medium bg-destructive/5 p-3 rounded-lg">
            ⚠️ La demande ne sera soumise à la BNRM qu'après confirmation réciproque éditeur / imprimeur
          </p>
        )}

        <div className="pt-4">
          <Button
            size="lg"
            onClick={onStartDeclaration}
            className="w-full md:w-auto"
          >
            <Icon className="h-5 w-5 mr-2" />
            {buttonLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
