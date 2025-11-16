import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force light mode by removing dark class
    document.documentElement.classList.remove("dark");
    
    // Watch for changes and force light mode
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
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
