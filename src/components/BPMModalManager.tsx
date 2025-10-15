import { useEffect } from 'react';
import { BPMModalManager } from '@/lib/bpm-modal-manager';

/**
 * BPMModalManager Component
 * Initializes and manages BPM workflow modals globally
 */
export function BPMModalManagerComponent() {
  useEffect(() => {
    const manager = BPMModalManager.getInstance();
    manager.initialize();

    return () => {
      manager.destroy();
    };
  }, []);

  return null;
}
