import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleRoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  roles: Array<{ id: string; role_name: string }>;
  placeholder?: string;
  disabled?: boolean;
}

export function SimpleRoleSelector({
  value,
  onChange,
  roles,
  placeholder = "Sélectionner un rôle...",
  disabled = false,
}: SimpleRoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedRole = roles.find((r) => r.id === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-white px-4 py-2.5 text-[15px] font-normal",
          "text-foreground transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
          "hover:border-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          "shadow-sm"
        )}
      >
        <span className={cn(!selectedRole && "text-muted-foreground/60")}>
          {selectedRole ? selectedRole.role_name : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {roles.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Aucun rôle disponible
            </div>
          ) : (
            roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onChange(role.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                  "hover:bg-muted/50",
                  value === role.id && "bg-muted text-primary font-medium"
                )}
              >
                <span>{role.role_name}</span>
                {value === role.id && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
