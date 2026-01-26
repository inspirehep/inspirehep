import React from 'react';
import { LiteratureHepSelectionButtons } from './LiteratureHepSelectionButtons';
import { LiteratureCoreSelectionButtons } from './LiteratureCoreSelectionButtons';
import { WorkflowStatuses } from '../../constants';

const LiteratureActionButtons = ({
  status,
  hasInspireCategories,
  handleResolveAction,
  actionInProgress,
  workflowId,
}) => {
  switch (status) {
    case WorkflowStatuses.APPROVAL_CORE_SELECTION:
      return (
        <LiteratureCoreSelectionButtons
          handleResolveAction={handleResolveAction}
          actionInProgress={actionInProgress}
          workflowId={workflowId}
        />
      );

    case WorkflowStatuses.APPROVAL:
      return (
        <LiteratureHepSelectionButtons
          hasInspireCategories={hasInspireCategories}
          handleResolveAction={handleResolveAction}
          actionInProgress={actionInProgress}
          workflowId={workflowId}
        />
      );

    default:
      return null;
  }
};

export default LiteratureActionButtons;
