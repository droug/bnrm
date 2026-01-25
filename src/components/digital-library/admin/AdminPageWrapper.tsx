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
      <div className="container mx-auto px-4 py-6 lg:px-8">
        {/* Back button with animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(backPath)}
            className="gap-2 hover:bg-bn-blue-primary/5 hover:text-bn-blue-primary transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
            <span>Retour à l'administration</span>
          </Button>
        </motion.div>

        {/* Modern Header Card with decorative elements */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none bg-gradient-to-br from-bn-blue-primary/10 via-bn-blue-primary/5 to-gold-bn-primary/5 shadow-lg overflow-hidden mb-6">
            <CardHeader className="pb-6 relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-bn-blue-primary/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gold-bn-primary/15 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />
              
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={cn(
                      "p-4 rounded-2xl border shadow-inner",
                      iconBgColor,
                      "border-bn-blue-primary/20"
                    )}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon icon={icon} className={cn("h-8 w-8", iconColor)} />
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                      {title}
                    </CardTitle>
                    {description && (
                      <CardDescription className="text-base mt-2 max-w-2xl text-muted-foreground">
                        {description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                {actions && (
                  <div className="flex items-center gap-2 shrink-0">
                    {actions}
                  </div>
                )}
              </div>

              {/* Stats Row */}
              {stats && stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <StatCard
                        title={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content with animation */}
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

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon,
  color = "blue",
}: { 
  title: string; 
  value: number | string; 
  icon: string;
  color?: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: "bg-blue-500/5", text: "text-blue-600", iconBg: "bg-blue-500/10" },
    green: { bg: "bg-emerald-500/5", text: "text-emerald-600", iconBg: "bg-emerald-500/10" },
    amber: { bg: "bg-amber-500/5", text: "text-amber-600", iconBg: "bg-amber-500/10" },
    purple: { bg: "bg-purple-500/5", text: "text-purple-600", iconBg: "bg-purple-500/10" },
    pink: { bg: "bg-pink-500/5", text: "text-pink-600", iconBg: "bg-pink-500/10" },
    indigo: { bg: "bg-indigo-500/5", text: "text-indigo-600", iconBg: "bg-indigo-500/10" },
    cyan: { bg: "bg-cyan-500/5", text: "text-cyan-600", iconBg: "bg-cyan-500/10" },
    rose: { bg: "bg-rose-500/5", text: "text-rose-600", iconBg: "bg-rose-500/10" },
    orange: { bg: "bg-orange-500/5", text: "text-orange-600", iconBg: "bg-orange-500/10" },
    teal: { bg: "bg-teal-500/5", text: "text-teal-600", iconBg: "bg-teal-500/10" },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={cn("border-none shadow-sm hover:shadow-md transition-all duration-300", classes.bg)}>
      <CardContent className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", classes.iconBg)}>
            <Icon icon={icon} className={cn("h-5 w-5", classes.text)} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <Card className={cn("border-border/50 shadow-sm hover:shadow-md transition-shadow", className)}>
        {(title || actions) && (
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className={cn("p-2 rounded-lg", iconBgColor)}>
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