/**
 * Composant d'autocomplete pour les éditeurs
 * Charge les données depuis la base de données (professional_registration_requests avec type 'editor' et status 'approved')
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Publisher {
  id: string;
  company_name: string;
  city: string | null;
}

interface PublisherAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function PublisherAutocomplete({
  value = '',
  onChange,
  placeholder = 'Rechercher un éditeur...',
  label,
  className,
}: PublisherAutocompleteProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch publishers from database
  useEffect(() => {
    const fetchPublishers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('professional_registration_requests')
          .select('id, company_name, registration_data')
          .eq('professional_type', 'editor')
          .eq('status', 'approved')
          .order('company_name');
        
        if (error) throw error;
        
        const mapped: Publisher[] = (data || []).map((item: any) => ({
          id: item.id,
          company_name: item.company_name || 'Éditeur inconnu',
          city: item.registration_data?.city || null
        }));
        
        setPublishers(mapped);
      } catch (error) {
        console.error('Error fetching publishers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishers();
  }, []);

  // Sync display value with external value
  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  // Filter publishers based on input
  const filteredPublishers = displayValue.trim()
    ? publishers.filter(p => 
        p.company_name.toLowerCase().includes(displayValue.toLowerCase())
      )
    : publishers;

  // Update dropdown position (fixed position = viewport coords, no scrollY)
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  }, [showSuggestions]);

  // Close on click outside
  useEffect(() => {
    const handlePointerDownOutside = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, []);

  const handleSelect = (publisher: Publisher) => {
    setDisplayValue(publisher.company_name);
    onChange?.(publisher.company_name);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    onChange?.(newValue); // Allow manual entry
    setShowSuggestions(true);
  };

  const dropdown = showSuggestions && (filteredPublishers.length > 0 || displayValue.trim()) && createPortal(
    <div
      className="fixed bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 100001
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {loading ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">Chargement...</div>
      ) : filteredPublishers.length > 0 ? (
        filteredPublishers.slice(0, 50).map((publisher) => (
          <div
            key={publisher.id}
            className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(publisher);
            }}
          >
            <div className="font-medium">{publisher.company_name}</div>
            {publisher.city && (
              <div className="text-xs text-muted-foreground">{publisher.city}</div>
            )}
          </div>
        ))
      ) : displayValue.trim() ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Aucun éditeur trouvé. Vous pouvez saisir manuellement.
        </div>
      ) : null}
    </div>,
    document.body
  );

  return (
    <div ref={containerRef} className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
      />
      {dropdown}
    </div>
  );
}
