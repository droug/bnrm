/**
 * BPM Modal Manager
 * Force all BPM workflow modals to render properly at the center of the screen
 * with correct z-index and body scroll lock
 */

export class BPMModalManager {
  private static instance: BPMModalManager;
  private observer: MutationObserver | null = null;
  private activeModals = new Set<Element>();

  private constructor() {}

  static getInstance(): BPMModalManager {
    if (!BPMModalManager.instance) {
      BPMModalManager.instance = new BPMModalManager();
    }
    return BPMModalManager.instance;
  }

  /**
   * Initialize the modal manager
   */
  initialize() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      this.fixBpmModals();
      this.manageBodyScroll();
      this.manageOverlay();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'role']
    });

    // Initial check
    this.fixBpmModals();
  }

  /**
   * Fix BPM modal positioning and ensure they're attached to body
   */
  private fixBpmModals() {
    const modalSelectors = [
      '[role="dialog"]',
      '[data-radix-dialog-content]',
      '.workflow-editor-modal',
      '.transition-config-modal',
      '.role-assignment-modal',
      '.workflow-settings-modal',
      '.bpm-diagram-modal',
      '.audit-log-modal',
      '.confirm-dialog'
    ];

    const modals = document.querySelectorAll(modalSelectors.join(', '));

    modals.forEach((modal) => {
      // Track active modals
      const isOpen = modal.getAttribute('data-state') === 'open';
      if (isOpen) {
        this.activeModals.add(modal);
      } else {
        this.activeModals.delete(modal);
      }

      // Ensure modal is attached to body
      if (modal.parentElement && modal.parentElement !== document.body) {
        const parent = modal.parentElement;
        // Only move if not already in a portal
        if (!parent.hasAttribute('data-radix-portal')) {
          document.body.appendChild(modal);
        }
      }

      // Force fixed positioning styles
      if (isOpen && modal instanceof HTMLElement) {
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '999999';
        modal.style.pointerEvents = 'all';
      }
    });
  }

  /**
   * Manage body scroll lock
   */
  private manageBodyScroll() {
    const hasOpenModals = this.activeModals.size > 0 || 
      document.querySelector('[data-state="open"][role="dialog"]');

    if (hasOpenModals) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Manage overlay backdrop
   */
  private manageOverlay() {
    const hasOpenModals = this.activeModals.size > 0 || 
      document.querySelector('[data-state="open"][role="dialog"]');

    const existingOverlay = document.querySelector('.bpm-modal-overlay');

    if (hasOpenModals && !existingOverlay) {
      this.createOverlay();
    } else if (!hasOpenModals && existingOverlay) {
      existingOverlay.remove();
    }
  }

  /**
   * Create overlay backdrop
   */
  private createOverlay() {
    // Check if Radix UI already created an overlay
    const radixOverlay = document.querySelector('[data-radix-dialog-overlay]');
    if (radixOverlay) return;

    const overlay = document.createElement('div');
    overlay.className = 'bpm-modal-overlay';
    
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(2px)',
      zIndex: '999998',
      pointerEvents: 'all'
    });

    // Insert before first modal
    const firstModal = document.querySelector('[data-state="open"][role="dialog"]');
    if (firstModal && firstModal.parentElement === document.body) {
      document.body.insertBefore(overlay, firstModal);
    } else {
      document.body.appendChild(overlay);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.activeModals.clear();
    
    const overlay = document.querySelector('.bpm-modal-overlay');
    if (overlay) overlay.remove();
    
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  }
}

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  const manager = BPMModalManager.getInstance();
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => manager.initialize());
  } else {
    manager.initialize();
  }
}

export default BPMModalManager;
