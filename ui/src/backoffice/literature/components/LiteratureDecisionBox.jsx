import React from 'react';
import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureKeywords from './LiteratureKeywords';
import LiteratureActionButtons from './LiteratureActionButtons';
import LiteratureDecisionDetails from './LiteratureDecisionDetails';
import { LITERATURE } from '../../../common/routes';

const LiteratureDecisionBox = ({
  actionInProgress,
  classifierResults,
  controlNumber,
  decision,
  handleResolveAction,
  inspireCategories,
  referenceCount,
  relevancePrediction,
  status,
  totalReferences,
  workflowId,
}) => {
  const hasInspireCategories =
    Array.isArray(inspireCategories) && inspireCategories.length > 0;

  return (
    <div className="literature-decision-box">
      <AutomaticDecision
        hasInspireCategories={hasInspireCategories}
        relevancePrediction={relevancePrediction}
      />
      <LiteratureActionButtons
        status={status}
        hasInspireCategories={hasInspireCategories}
        handleResolveAction={handleResolveAction}
        actionInProgress={actionInProgress}
        workflowId={workflowId}
      />
      <LiteratureDecisionDetails
        decision={decision}
        controlNumber={controlNumber}
        pidType={LITERATURE}
      />
      <LiteratureReferenceCount
        referenceCount={referenceCount}
        totalReferences={totalReferences}
      />
      <LiteratureKeywords classifierResults={classifierResults} />
    </div>
  );
};

export default LiteratureDecisionBox;
