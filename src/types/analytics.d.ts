/**
 * Global type declarations for analytics tools (Google Analytics & Matomo)
 */

// Google Analytics gtag.js types
interface GtagConfig {
  send_page_view?: boolean;
  anonymize_ip?: boolean;
  cookie_flags?: string;
  page_path?: string;
  page_title?: string;
  page_referrer?: string;
  platform?: string;
  user_id?: string;
  user_type?: string;
  user_role?: string;
  [key: string]: any;
}

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  page_path?: string;
  page_title?: string;
  page_referrer?: string;
  platform?: string;
  search_term?: string;
  results_count?: number;
  content_id?: string;
  content_type?: string;
  content_title?: string;
  file_type?: string;
  document_id?: string;
  non_interaction?: boolean;
  [key: string]: any;
}

// Matomo types
type MatomoCommand = [string, ...any[]];

declare global {
  interface Window {
    // Google Analytics
    gtag: {
      (command: 'js', date: Date): void;
      (command: 'config', targetId: string, config?: GtagConfig): void;
      (command: 'event', eventName: string, params?: GtagEventParams): void;
      (command: 'set', params: GtagConfig): void;
      (command: 'set', key: string, params: GtagConfig): void;
    };
    dataLayer: any[];
    
    // Matomo
    _paq: MatomoCommand[];
    _matomoLoaded?: boolean;
  }
}

export {};
