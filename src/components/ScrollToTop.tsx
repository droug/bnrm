import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to absolute top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also use window.scrollTo as backup
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
