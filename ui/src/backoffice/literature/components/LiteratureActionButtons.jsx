import React, { useState } from 'react';
import { LiteratureHepSelectionButtons } from './LiteratureHepSelectionButtons';
import { LiteratureCoreSelectionButtons } from './LiteratureCoreSelectionButtons';
import { LiteratureMissingSubjectFieldsSelectionButtons } from './LiteratureMissingSubjectFieldsSelectionButtons';
import { LiteratureMergeSelectionButtons } from './LiteratureMergeSelectionButtons';
import { WorkflowStatuses } from '../../constants';

const LiteratureActionButtons = ({
  status,
  handleResolveAction,
  workflowId = null,
  isFullCoverage = false,
  isBatch = false,
  isSubmitted = false,
  shouldShowSubmissionModal = false,
  submissionContext = undefined,
}) => {
  const [hasSubmittedDecision, setHasSubmittedDecision] = useState(false);

  const handleResolveAndHide = (action, value) => {
    setHasSubmittedDecision(true);
    if (value === undefined) {
      handleResolveAction(action);
      return;
    }

    handleResolveAction(action, value);
  };

  if (isSubmitted || hasSubmittedDecision) {
    return <p className="mb0 mt2 tc">Decision submitted.</p>;
  }

  switch (status) {
    case WorkflowStatuses.APPROVAL_CORE_SELECTION:
      return (
        <LiteratureCoreSelectionButtons
          handleResolveAction={handleResolveAndHide}
          isBatch={isBatch}
        />
      );

    case WorkflowStatuses.APPROVAL:
      return (
        <LiteratureHepSelectionButtons
          handleResolveAction={handleResolveAndHide}
          isFullCoverage={isFullCoverage}
          isBatch={isBatch}
          shouldShowSubmissionModal={shouldShowSubmissionModal}
          submissionContext={submissionContext}
        />
      );

    case WorkflowStatuses.MISSING_SUBJECT_FIELDS:
      return (
        <LiteratureMissingSubjectFieldsSelectionButtons
          handleResolveAction={handleResolveAndHide}
          isBatch={isBatch}
        />
      );
    case WorkflowStatuses.APPROVAL_MERGE:
      return <LiteratureMergeSelectionButtons workflowId={workflowId} />;

    default:
      return null;
  }
};

export default LiteratureActionButtons;
