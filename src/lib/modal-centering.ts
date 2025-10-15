/**
 * Force BPM modals to render in document.body and center them properly
 * This prevents modals from being clipped by scroll containers or shadow roots
 * Also neutralizes any blur effects from Lovable overlays
 */

const MODAL_SELECTORS = [
  '.workflow-editor-modal',
  '.transition-config-modal',
  '.role-assignment-modal',
  '.workflow-settings-modal',
  '.bpm-diagram-modal',
  '.audit-log-modal',
  '.confirm-dialog',
  '[role="dialog"]'
].join(', ');

const OVERLAY_SELECTORS = [
  '.bpm-overlay',
  '.modal-backdrop',
  '[data-lovable-overlay]',
  '[class*="overlay"]'
].join(', ');

function neutralizeOverlays() {
  // 1️⃣ Cibler les overlays Lovable créés à l'ouverture d'une modale
  document.querySelectorAll<HTMLElement>(OVERLAY_SELECTORS).forEach(overlay => {
    Object.assign(overlay.style, {
      backdropFilter: 'none',
      filter: 'none',
      background: 'rgba(0, 0, 0, 0.3)',
      zIndex: '1',
      pointerEvents: 'none'
    });
  });
}

function centerModal(modal: HTMLElement) {
  if (!modal) return;
  
  // Move to body if not already there
  if (modal.parentElement && modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  
  // 2️⃣ Rendre la modale visible au-dessus du fond avec centrage stable
  Object.assign(modal.style, {
    zIndex: '9999',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    visibility: 'visible',
    opacity: '1',
    display: 'block',
    filter: 'none',
    backdropFilter: 'none',
    margin: '0',
    inset: 'auto'
  });
}

function forceModalCentering() {
  // Neutralize overlays first
  neutralizeOverlays();
  
  // Then center all modals
  const modals = document.querySelectorAll<HTMLElement>(MODAL_SELECTORS);
  modals.forEach((modal) => {
    centerModal(modal);
  });
}

export function initModalCentering() {
  // Initial check
  forceModalCentering();
  
  // Watch for DOM changes and apply fixes dynamically
  const observer = new MutationObserver(() => {
    forceModalCentering();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Re-center on window resize
  const handleResize = () => {
    forceModalCentering();
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', handleResize);
  };
}
