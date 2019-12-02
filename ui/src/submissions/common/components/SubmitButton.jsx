import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import usePrevious from '../../../common/hooks/usePrevious';

function SubmitButton({ isSubmitting, isValidating, isValid }) {
  const previousIsSubmitting = usePrevious(isSubmitting);

  useEffect(
    () => {
      const hasTriedToSubmitInvalidForm =
        previousIsSubmitting && !isSubmitting && !isValid;
      if (hasTriedToSubmitInvalidForm) {
        window.scrollTo(0, 0);
      }
    },
    [isSubmitting, isValid, previousIsSubmitting]
  );

  return (
    <Button
      type="primary"
      htmlType="submit"
      loading={isSubmitting || isValidating}
    >
      Submit
    </Button>
  );
}

SubmitButton.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
};

export default SubmitButton;
