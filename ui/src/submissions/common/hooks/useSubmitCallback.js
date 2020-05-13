import { useCallback } from 'react';
import cleanupFormData from '../cleanupFormData';
import useIsMounted from '../../../common/hooks/useIsMounted';

export default function useSubmitCallback(onSubmit) {
  const isMounted = useIsMounted();
  const onFormikSubmit = useCallback(
    async (values, actions) => {
      const cleanValues = cleanupFormData(values);
      await onSubmit(cleanValues);
      if (isMounted) {
        actions.setSubmitting(false);
        window.scrollTo(0, 0);
      }
    },
    [onSubmit, isMounted]
  );
  return onFormikSubmit;
}
