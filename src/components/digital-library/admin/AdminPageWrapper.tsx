import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalLibraryLayout } from '@/components/digital-library/DigitalLibraryLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AdminPageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  backPath?: string;
  actions?: ReactNode;
  loading?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }>;
}

export function AdminPageWrapper({
  children,
  title,
  description,
  icon,
  iconColor = 'text-bn-blue-primary',
  iconBgColor = 'bg-bn-blue-primary/10',
  backPath = '/admin/digital-library',
  actions,
  loading = false,
  stats,
}: AdminPageWrapperProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={cn("p-4 rounded-2xl animate-pulse", iconBgColor)}>
                <Icon icon={icon} className={cn("h-8 w-8", iconColor)} />
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-bn-blue-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </motion.div>
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  return (
    <DigitalLibraryLayout>
      {/* Premium Hero Header */}
      <div className="relative bg-gradient-to-br from-bn-blue-primary via-bn-blue-deep to-bn-blue-primary overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gold-bn-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gold-bn-primary/50 rounded-full blur-2xl" />
        </div>

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 border border-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-gold-bn-primary/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 py-8 md:py-12">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(backPath)}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon icon="mdi:arrow-left" className="h-4 w-4" />
              <span>Retour à l'administration</span>
            </Button>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div 
                className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon icon={icon} className="w-8 h-8 text-gold-bn-primary" />
              </motion.div>

              <div>
                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {title}
                </h1>

                {/* Description */}
                {description && (
                  <p className="text-base md:text-lg text-white/80 max-w-2xl mt-2">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>

          {/* Stats Row */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10">
                        <Icon icon={stat.icon} className="h-5 w-5 text-gold-bn-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-white/70">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
            <path 
              d="M0,40 C320,80 640,0 960,40 C1280,80 1440,20 1440,20 L1440,60 L0,60 Z" 
              className="fill-background"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </div>
    </DigitalLibraryLayout>
  );
}

// Composant pour les sections internes avec design amélioré
interface AdminSectionCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  actions?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function AdminSectionCard({
  children,
  title,
  description,
  icon,
  iconColor = 'text-foreground',
  iconBgColor = 'bg-muted',
  actions,
  noPadding = false,
  className,
}: AdminSectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border-border/50 shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm", className)}>
        {(title || actions) && (
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className={cn("p-2 rounded-xl", iconBgColor)}>
                    <Icon icon={icon} className={cn("h-5 w-5", iconColor)} />
                  </div>
                )}
                <div>
                  {title && (
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  )}
                  {description && (
                    <CardDescription className="text-sm mt-0.5">{description}</CardDescription>
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
    </motion.div>
  );
}

// Quick action button for admin pages
interface AdminQuickActionProps {
  icon: string;
  label: string;
  onClick: () => void;
  color?: string;
  variant?: 'default' | 'outline';
}

export function AdminQuickAction({
  icon,
  label,
  onClick,
  color = 'bn-blue-primary',
  variant = 'default',
}: AdminQuickActionProps) {
  return (
    <Button
      variant={variant === 'outline' ? 'outline' : 'default'}
      onClick={onClick}
      className={cn(
        "gap-2 transition-all",
        variant === 'default' 
          ? "bg-bn-blue-primary hover:bg-bn-blue-dark text-white" 
          : "border-bn-blue-primary/30 hover:bg-bn-blue-primary/10 hover:border-bn-blue-primary"
      )}
    >
      <Icon icon={icon} className="h-4 w-4" />
      {label}
    </Button>
  );
}
