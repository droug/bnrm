import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SectionStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

export interface SectionStyles {
  hero: SectionStyle;
  actualites_evenements: SectionStyle;
  services_numeriques: SectionStyle;
  plateformes: SectionStyle;
  liens_rapides: SectionStyle;
  mediatheque: SectionStyle;
  footer: SectionStyle;
}

export interface Typography {
  headingFont: string;
  headingSize: string;
  headingWeight: string;
  headingStyle: string;
  bodyFont: string;
  bodySize: string;
  bodyWeight: string;
  bodyStyle: string;
  buttonFont: string;
  buttonSize: string;
  buttonWeight: string;
}

export interface ButtonStyles {
  primaryBg: string;
  primaryText: string;
  primaryHoverBg: string;
  secondaryBg: string;
  secondaryText: string;
  secondaryHoverBg: string;
  borderRadius: string;
}

const defaultStyles: SectionStyles = {
  hero: { backgroundColor: '#f8fafc', textColor: '#0f172a', accentColor: '#3b82f6', borderColor: '#e2e8f0' },
  actualites_evenements: { backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#3b82f6', borderColor: '#e2e8f0' },
  services_numeriques: { backgroundColor: '#f1f5f9', textColor: '#1e293b', accentColor: '#3b82f6', borderColor: '#cbd5e1' },
  plateformes: { backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#3b82f6', borderColor: '#e2e8f0' },
  liens_rapides: { backgroundColor: '#f8fafc', textColor: '#1e293b', accentColor: '#3b82f6', borderColor: '#e2e8f0' },
  mediatheque: { backgroundColor: '#1e293b', textColor: '#f8fafc', accentColor: '#f59e0b', borderColor: '#334155' },
  footer: { backgroundColor: '#0f172a', textColor: '#f8fafc', accentColor: '#3b82f6', borderColor: '#1e293b' }
};

const defaultTypography: Typography = {
  headingFont: 'Playfair Display',
  headingSize: '2rem',
  headingWeight: '700',
  headingStyle: 'normal',
  bodyFont: 'Inter',
  bodySize: '1rem',
  bodyWeight: '400',
  bodyStyle: 'normal',
  buttonFont: 'Inter',
  buttonSize: '0.875rem',
  buttonWeight: '500'
};

const defaultButtonStyles: ButtonStyles = {
  primaryBg: '#3b82f6',
  primaryText: '#ffffff',
  primaryHoverBg: '#2563eb',
  secondaryBg: '#e2e8f0',
  secondaryText: '#1e293b',
  secondaryHoverBg: '#cbd5e1',
  borderRadius: '0.5rem'
};

export function useCmsStyles(platform: 'portal' | 'bn' = 'portal') {
  const keyPrefix = platform === 'bn' ? 'bn_' : '';
  const sectionStylesKey = `${keyPrefix}section_styles`;
  const typographyKey = `${keyPrefix}typography`;
  const buttonStylesKey = `${keyPrefix}button_styles`;

  return useQuery({
    queryKey: ['cms-styles', platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*')
        .in('setting_key', [sectionStylesKey, typographyKey, buttonStylesKey]);

      if (error) throw error;

      let sectionStyles = { ...defaultStyles };
      let typography = { ...defaultTypography };
      let buttonStyles = { ...defaultButtonStyles };

      data?.forEach((setting: any) => {
        if (setting.setting_key === sectionStylesKey && setting.setting_value) {
          const loaded = setting.setting_value as Partial<SectionStyles>;
          sectionStyles = {
            hero: { ...defaultStyles.hero, ...(loaded.hero || {}) },
            actualites_evenements: { ...defaultStyles.actualites_evenements, ...(loaded.actualites_evenements || {}) },
            services_numeriques: { ...defaultStyles.services_numeriques, ...(loaded.services_numeriques || {}) },
            plateformes: { ...defaultStyles.plateformes, ...(loaded.plateformes || {}) },
            liens_rapides: { ...defaultStyles.liens_rapides, ...(loaded.liens_rapides || {}) },
            mediatheque: { ...defaultStyles.mediatheque, ...(loaded.mediatheque || {}) },
            footer: { ...defaultStyles.footer, ...(loaded.footer || {}) }
          };
        } else if (setting.setting_key === typographyKey && setting.setting_value) {
          typography = { ...defaultTypography, ...setting.setting_value };
        } else if (setting.setting_key === buttonStylesKey && setting.setting_value) {
          buttonStyles = { ...defaultButtonStyles, ...setting.setting_value };
        }
      });

      return { sectionStyles, typography, buttonStyles };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function getCssVariables(styles: {
  sectionStyles?: SectionStyles;
  typography?: Typography;
  buttonStyles?: ButtonStyles;
}) {
  const { sectionStyles, typography, buttonStyles } = styles;
  
  return {
    // Section styles as CSS custom properties
    '--hero-bg': sectionStyles?.hero.backgroundColor,
    '--hero-text': sectionStyles?.hero.textColor,
    '--hero-accent': sectionStyles?.hero.accentColor,
    '--section-bg': sectionStyles?.actualites_evenements.backgroundColor,
    '--section-text': sectionStyles?.actualites_evenements.textColor,
    '--section-accent': sectionStyles?.actualites_evenements.accentColor,
    // Typography
    '--heading-font': typography?.headingFont,
    '--heading-size': typography?.headingSize,
    '--heading-weight': typography?.headingWeight,
    '--heading-style': typography?.headingStyle,
    '--body-font': typography?.bodyFont,
    '--body-size': typography?.bodySize,
    '--body-weight': typography?.bodyWeight,
    '--body-style': typography?.bodyStyle,
    '--button-font': typography?.buttonFont,
    '--button-size': typography?.buttonSize,
    '--button-weight': typography?.buttonWeight,
    // Buttons
    '--btn-primary-bg': buttonStyles?.primaryBg,
    '--btn-primary-text': buttonStyles?.primaryText,
    '--btn-primary-hover': buttonStyles?.primaryHoverBg,
    '--btn-radius': buttonStyles?.borderRadius,
  } as CSSProperties;
}
