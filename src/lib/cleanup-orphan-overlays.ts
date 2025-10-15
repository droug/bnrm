/**
 * Clean up orphan dialog overlays that remain after modals are closed
 * This prevents persistent blur effects and dark backgrounds
 */
export function cleanupOrphanOverlays() {
  // Wait for DOM to be ready
  setTimeout(() => {
    // Check if any dialog is actually open
    const openDialog = document.querySelector('[role="dialog"][data-state="open"]');
    
    // If no dialog is open, remove all overlay elements
    if (!openDialog) {
      const overlays = document.querySelectorAll(
        '[class*="overlay"], [class*="backdrop-blur"], [class*="bg-background/80"], [data-radix-dialog-overlay]'
      );
      
      overlays.forEach(overlay => {
        overlay.remove();
      });
      
      // Reset body styles
      document.body.style.backdropFilter = 'none';
      document.body.style.filter = 'none';
      document.body.style.overflow = 'auto';
    }
  }, 1000);
}

/**
 * Initialize cleanup observer to watch for dialog state changes
 */
export function initOverlayCleanup() {
  // Run initial cleanup
  cleanupOrphanOverlays();
  
  // Watch for dialog state changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
        const target = mutation.target as HTMLElement;
        const state = target.getAttribute('data-state');
        
        // Clean up when dialog closes
        if (state === 'closed') {
          setTimeout(() => cleanupOrphanOverlays(), 300);
        }
      }
    });
  });
  
  // Observe all dialogs
  document.querySelectorAll('[role="dialog"]').forEach(dialog => {
    observer.observe(dialog, {
      attributes: true,
      attributeFilter: ['data-state']
    });
  });
  
  // Also observe document body for new dialogs
  const bodyObserver = new MutationObserver(() => {
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
      if (!observer) return;
      observer.observe(dialog, {
        attributes: true,
        attributeFilter: ['data-state']
      });
    });
  });
  
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => {
    observer.disconnect();
    bodyObserver.disconnect();
  };
}
