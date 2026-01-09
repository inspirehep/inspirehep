import React from 'react';
import UnclickableTag from '../../../common/components/UnclickableTag';
import { resolveDecision } from '../../utils/utils';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { LITERATURE } from '../../../common/routes';
import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureKeywords from './LiteratureKeywords';
import LiteratureActionButtons from './LiteratureActionButtons';

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

  return (
    <div className="mb0">
      <AutomaticDecision
        hasInspireCategories={hasInspireCategories}
        relevancePrediction={relevancePrediction}
      />
      <LiteratureActionButtons
        status={status}
        hasInspireCategories={hasInspireCategories}
        handleResolveAction={handleResolveAction}
        actionInProgress={actionInProgress}
      />
      {decision && (
        <>
          <p>
            Action:{' '}
            <UnclickableTag className={className}>
              {decisionText}
            </UnclickableTag>
          </p>
          {controlNumber && (
            <p>
              Control number:{' '}
              <LinkWithTargetBlank href={`${LITERATURE}/${controlNumber}`}>
                {controlNumber}
              </LinkWithTargetBlank>
            </p>
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
