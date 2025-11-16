import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Force light mode and remove any dark theme preference
    localStorage.removeItem('theme');
    setTheme('light');
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    // Disabled - always stay in light mode
    return;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      disabled
      aria-label="Mode clair activé"
      aria-pressed={false}
      title="Mode clair"
      className="gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 opacity-50 cursor-not-allowed"
    >
      <Sun className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Mode clair</span>
    </Button>
  );
}
