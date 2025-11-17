import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

interface CalloutSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function CalloutSection({ section, language }: CalloutSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { variant = 'info' } = section.props || {};

  const variants = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: 'text-blue-900 dark:text-blue-100'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      title: 'text-yellow-900 dark:text-yellow-100'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      title: 'text-red-900 dark:text-red-100'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'text-green-900 dark:text-green-100'
    }
  };

  const style = variants[variant as keyof typeof variants] || variants.info;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className={`${style.bg} ${style.border} border-l-4 rounded-lg p-6`}>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {style.icon}
            </div>
            <div className="flex-1">
              {title && <h3 className={`text-lg font-semibold mb-2 ${style.title}`}>{title}</h3>}
              {content && <p className="text-muted-foreground">{content}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
