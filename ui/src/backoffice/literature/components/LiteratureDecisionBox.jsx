import React from 'react';
import UnclickableTag from '../../../common/components/UnclickableTag';
import { resolveDecision } from '../../utils/utils';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { LITERATURE } from '../../../common/routes';
import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureKeywords from './LiteratureKeywords';

const LiteratureDecisionBox = ({
  decision,
  controlNumber,
  inspireCategories,
  relevancePrediction,
  referenceCount,
  totalReferences,
  classifierResults,
}) => {
  const resolvedDecision = resolveDecision(decision.get('action'));
  const className = resolvedDecision
    ? `decision-pill ${resolvedDecision.bg}`
    : 'decision-pill';
  const decisionText = resolvedDecision
    ? resolvedDecision.decision
    : 'completed';

  return (
    <div className="mb0">
      <AutomaticDecision
        inspireCategories={inspireCategories}
        relevancePrediction={relevancePrediction}
      />
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
      <LiteratureReferenceCount
        referenceCount={referenceCount}
        totalReferences={totalReferences}
      />
      <LiteratureKeywords classifierResults={classifierResults} />
    </div>
  );
};

export default LiteratureDecisionBox;
