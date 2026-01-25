import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalLibraryLayout } from '@/components/digital-library/DigitalLibraryLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface AdminPageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  backPath?: string;
  actions?: ReactNode;
  loading?: boolean;
}

export function AdminPageWrapper({
  children,
  title,
  description,
  icon,
  iconColor = 'text-gold-bn-primary',
  backPath = '/admin/digital-library',
  actions,
  loading = false,
}: AdminPageWrapperProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(backPath)}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          Retour
        </Button>

        {/* Header Card */}
        <Card className="border-bn-blue-primary/10 mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 via-bn-blue-primary/3 to-gold-bn-primary/5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10 shadow-sm",
                )}>
                  <Icon icon={icon} className={cn("h-7 w-7", iconColor)} />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl text-bn-blue-primary">
                    {title}
                  </CardTitle>
                  {description && (
                    <CardDescription className="mt-1 text-muted-foreground">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}

// Composant pour les sections internes
interface AdminSectionCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: string;
  iconBgColor?: string;
  actions?: ReactNode;
  noPadding?: boolean;
}

export function AdminSectionCard({
  children,
  title,
  description,
  icon,
  iconBgColor = 'bg-muted',
  actions,
  noPadding = false,
}: AdminSectionCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      {(title || actions) && (
        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={cn("p-2 rounded-lg", iconBgColor)}>
                  <Icon icon={icon} className="h-5 w-5" />
                </div>
              )}
              <div>
                {title && <CardTitle className="text-base">{title}</CardTitle>}
                {description && (
                  <CardDescription className="text-sm">{description}</CardDescription>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? 'p-0' : 'pt-6')}>
        {children}
      </CardContent>
    </Card>
  );
}
