import { useEffect } from 'react';
import { initModalCentering } from '@/lib/modal-centering';

/**
 * Component that ensures all BPM modals are properly centered
 * and rendered at the document body level
 */
export const ModalCenteringManager = () => {
  useEffect(() => {
    const cleanup = initModalCentering();
    return cleanup;
  }, []);

  return null;
};
