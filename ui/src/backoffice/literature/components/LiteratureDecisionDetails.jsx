import React from 'react';
import UnclickableTag from '../../../common/components/UnclickableTag';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { resolveDecision } from '../../utils/utils';

const LiteratureDecisionDetails = ({ decision, controlNumber, pidType }) => {
  if (!decision) return null;

  const resolvedDecision = resolveDecision(decision.get('action'));
  const className = resolvedDecision
    ? `decision-pill ${resolvedDecision.bg}`
    : undefined;
  const decisionText = resolvedDecision ? resolvedDecision.decision : undefined;

  return (
    <>
      <p>
        Action:{' '}
        <UnclickableTag className={className}>{decisionText}</UnclickableTag>
      </p>
      {controlNumber && (
        <p>
          Control number:{' '}
          <LinkWithTargetBlank href={`${pidType}/${controlNumber}`}>
            {controlNumber}
          </LinkWithTargetBlank>
        </p>
      )}
    </>
  );
};

export default LiteratureDecisionDetails;
