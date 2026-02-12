import React, { useState } from 'react';
import { LiteratureHepSelectionButtons } from './LiteratureHepSelectionButtons';
import { LiteratureCoreSelectionButtons } from './LiteratureCoreSelectionButtons';
import { WorkflowStatuses } from '../../constants';

const LiteratureActionButtons = ({
  status,
  hasInspireCategories,
  handleResolveAction,
  actionInProgress,
  workflowId,
  isBatch = false,
  isSubmitted = false,
}) => {
  const [hasSubmittedDecision, setHasSubmittedDecision] = useState(false);

  const handleResolveAndHide = (action) => {
    setHasSubmittedDecision(true);
    handleResolveAction(action);
  };

  if (isSubmitted || hasSubmittedDecision) {
    return <p className="mb0 mt2 tc">Decision submitted.</p>;
  }

  switch (status) {
    case WorkflowStatuses.APPROVAL_CORE_SELECTION:
      return (
        <LiteratureCoreSelectionButtons
          handleResolveAction={handleResolveAndHide}
          actionInProgress={actionInProgress}
          workflowId={workflowId}
          isBatch={isBatch}
        />
      );

    case WorkflowStatuses.APPROVAL:
      return (
        <LiteratureHepSelectionButtons
          hasInspireCategories={hasInspireCategories}
          handleResolveAction={handleResolveAndHide}
          actionInProgress={actionInProgress}
          workflowId={workflowId}
          isBatch={isBatch}
        />
      );

    default:
      return null;
  }
};

export default LiteratureActionButtons;
