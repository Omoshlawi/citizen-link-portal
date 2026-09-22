import { useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { handleApiErrors } from '@/lib/api';
import { useDocumentCaseApi } from './useDocumentCases';

/**
 * Re-runs a failed extraction against the images already on the case.
 *
 * For failures that were ours — docai unreachable, timed out, out of memory — rather than an
 * unreadable image, which is what asking the citizen to resubmit is for.
 */
export const useRetryExtraction = (caseId: string) => {
  const { retryExtraction } = useDocumentCaseApi();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = async () => {
    setIsRetrying(true);
    try {
      await retryExtraction(caseId);
      showNotification({
        title: 'Re-processing started',
        message: 'A new extraction attempt has been queued.',
        color: 'green',
      });
    } catch (error) {
      showNotification({
        title: 'Could not retry',
        message: handleApiErrors(error).detail ?? 'Please try again.',
        color: 'red',
        position: 'top-right',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return { retry, isRetrying };
};
