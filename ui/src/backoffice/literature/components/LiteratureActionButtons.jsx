import React, { useState } from 'react';
import { LiteratureHepSelectionButtons } from './LiteratureHepSelectionButtons';
import { LiteratureCoreSelectionButtons } from './LiteratureCoreSelectionButtons';
import { LiteratureMissingSubjectFieldsSelectionButtons } from './LiteratureMissingSubjectFieldsSelectionButtons';
import { WorkflowStatuses } from '../../constants';

const LiteratureActionButtons = ({
  status,
  handleResolveAction,
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
          isBatch={isBatch}
        />
      );

    case WorkflowStatuses.APPROVAL:
      return (
        <LiteratureHepSelectionButtons
          handleResolveAction={handleResolveAndHide}
          isBatch={isBatch}
        />
      );

    case WorkflowStatuses.MISSING_SUBJECT_FIELDS:
      return (
        <LiteratureMissingSubjectFieldsSelectionButtons
          handleResolveAction={handleResolveAndHide}
          isBatch={isBatch}
        />
      );

    default:
      return null;
  }
};

export default LiteratureActionButtons;
