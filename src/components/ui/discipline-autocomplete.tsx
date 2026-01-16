/**
 * Composant d'autocomplete pour les disciplines
 * Récupère les données depuis la base de données (autocomplete_lists)
 * avec fallback sur les données statiques
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { bookDisciplines } from '@/data/bookDisciplines';

interface DisciplineAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function DisciplineAutocomplete({
  value = '',
  onChange,
  placeholder = 'Rechercher une discipline...',
  label,
  className,
}: DisciplineAutocompleteProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch disciplines from database with fallback
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const { data: listData } = await supabase
          .from('autocomplete_lists')
          .select('id')
          .eq('list_code', 'book_disciplines')
          .single();

        if (listData?.id) {
          const { data: values } = await supabase
            .from('autocomplete_list_values')
            .select('value_label')
            .eq('list_id', listData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

          if (values && values.length > 0) {
            setDisciplines(values.map(v => v.value_label));
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch disciplines from DB, using fallback:', error);
      }

      // Fallback to static data
      const staticDisciplines = bookDisciplines.flatMap(category => [
        category.label,
        ...category.children
      ]);
      setDisciplines(staticDisciplines);
      setLoading(false);
    };

    fetchDisciplines();
  }, []);

  // Sync display value with external value
  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  // Filter disciplines based on input
  const filteredDisciplines = displayValue.trim()
    ? disciplines.filter(d => 
        d.toLowerCase().includes(displayValue.toLowerCase())
      )
    : disciplines;

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

  const handleSelect = (discipline: string) => {
    setDisplayValue(discipline);
    onChange?.(discipline);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setShowSuggestions(true);
  };

  const dropdown = showSuggestions && filteredDisciplines.length > 0 && createPortal(
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
      {filteredDisciplines.slice(0, 50).map((discipline, index) => (
        <div
          key={index}
          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelect(discipline);
          }}
        >
          {discipline}
        </div>
      ))}
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
        disabled={loading}
      />
      {dropdown}
    </div>
  );
}
