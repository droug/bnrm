/**
 * Force BPM modals to render in document.body and center them properly
 * This prevents modals from being clipped by scroll containers or shadow roots
 */

const MODAL_SELECTORS = [
  '.workflow-editor-modal',
  '.transition-config-modal',
  '.role-assignment-modal',
  '.workflow-settings-modal',
  '.bpm-diagram-modal',
  '.audit-log-modal',
  '.confirm-dialog',
  '[role="dialog"]',
  '[data-state="open"][role="dialog"]'
].join(', ');

function forceModalCentering() {
  const modals = document.querySelectorAll(MODAL_SELECTORS);
  
  modals.forEach((modal) => {
    if (!(modal instanceof HTMLElement)) return;
    
    // Move to body if not already there
    if (modal.parentElement && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    
    // Force fixed positioning and centering
    Object.assign(modal.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '999999',
      margin: '0'
    });
  });
}

export function initModalCentering() {
  // Initial check
  forceModalCentering();
  
  // Watch for new modals
  const observer = new MutationObserver(() => {
    forceModalCentering();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => observer.disconnect();
}
