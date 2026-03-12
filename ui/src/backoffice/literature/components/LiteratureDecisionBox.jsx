import React from 'react';
import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureKeywords from './LiteratureKeywords';
import LiteratureActionButtons from './LiteratureActionButtons';
import LiteratureDecisionDetails from './LiteratureDecisionDetails';
import { LITERATURE } from '../../../common/routes';

const LiteratureDecisionBox = ({
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
  isFullCoverage,
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
        handleResolveAction={handleResolveAction}
        workflowId={workflowId}
        isFullCoverage={isFullCoverage}
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
