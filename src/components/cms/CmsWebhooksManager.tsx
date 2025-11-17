import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmsWebhooksManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Webhooks</CardTitle>
        <CardDescription>
          Configurez les webhooks pour l'invalidation du cache et les notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Interface de gestion des webhooks en cours de développement...
        </p>
      </CardContent>
    </Card>
  );
}
