import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import SubmissionRejectModal from './SubmissionRejectModal';

const LiteratureRejectButton = ({
  handleResolveAction,
  isWeak = false,
  tooltipText,
  shouldShowSubmissionModal = false,
  submissionContext = undefined,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rejectClass = [isWeak ? 'bg-error-weak' : 'font-white bg-error']
    .filter(Boolean)
    .join(' ');

  const handleRejectClick = () => {
    if (shouldShowSubmissionModal) {
      setIsModalOpen(true);
      return;
    }

    handleResolveAction(WorkflowDecisions.HEP_REJECT);
  };

  const button = (
    <Button className={rejectClass} onClick={handleRejectClick}>
      Reject
    </Button>
  );

  const wrappedButton = tooltipText ? (
    <Tooltip title={tooltipText}>{button}</Tooltip>
  ) : (
    button
  );

  return (
    <>
      {wrappedButton}
      {shouldShowSubmissionModal && submissionContext && (
        <SubmissionRejectModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onReject={(reason) => {
            handleResolveAction(WorkflowDecisions.HEP_REJECT, reason);
            setIsModalOpen(false);
          }}
          submissionContext={submissionContext}
        />
      )}
    </>
  );
};

export default LiteratureRejectButton;
