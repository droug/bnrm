import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Clear any saved theme preference and force light mode
    localStorage.removeItem('theme');
    
    // Force light mode by removing dark class
    document.documentElement.classList.remove("dark");
    
    // Watch for changes and force light mode
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.removeItem('theme');
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);
  
  return <>{children}</>;
}
