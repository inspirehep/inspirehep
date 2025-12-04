import React from 'react';
import UnclickableTag from '../../../common/components/UnclickableTag';
import { resolveDecision } from '../../utils/utils';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { LITERATURE } from '../../../common/routes';
import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureKeywords from './LiteratureKeywords';
import { LiteratureHepSelectionButtons } from './LiteratureHepSelectionButtons';
import { LiteratureCoreSelectionButtons } from './LiteratureCoreSelectionButtons';
import { WorkflowStatuses } from '../../constants';

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
}) => {
  const resolvedDecision = decision
    ? resolveDecision(decision.get('action'))
    : undefined;
  const className = resolvedDecision
    ? `decision-pill ${resolvedDecision.bg}`
    : undefined;
  const decisionText = resolvedDecision ? resolvedDecision.decision : undefined;

  const hasInspireCategories =
    Array.isArray(inspireCategories) && inspireCategories.length > 0;

  const renderActionButtons = () => {
    switch (status) {
      case WorkflowStatuses.APPROVAL_CORE_SELECTION:
        return (
          <LiteratureCoreSelectionButtons
            handleResolveAction={handleResolveAction}
            actionInProgress={actionInProgress}
          />
        );
      case WorkflowStatuses.APPROVAL:
        return (
          <LiteratureHepSelectionButtons
            hasInspireCategories={hasInspireCategories}
            handleResolveAction={handleResolveAction}
            actionInProgress={actionInProgress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb0">
      <AutomaticDecision
        hasInspireCategories={hasInspireCategories}
        relevancePrediction={relevancePrediction}
      />
      {renderActionButtons()}
      {decision && (
        <>
          This workflow is{' '}
          <UnclickableTag className={className}>{decisionText}</UnclickableTag>
          {controlNumber && (
            <span>
              as{' '}
              <LinkWithTargetBlank href={`${LITERATURE}/${controlNumber}`}>
                {controlNumber}
              </LinkWithTargetBlank>
            </span>
          )}
        </>
      )}
      <LiteratureReferenceCount
        referenceCount={referenceCount}
        totalReferences={totalReferences}
      />
      <LiteratureKeywords classifierResults={classifierResults} />
    </div>
  );
};

export default LiteratureDecisionBox;
