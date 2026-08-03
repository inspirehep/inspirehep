import UnclickableTag from '../../../common/components/UnclickableTag';
import { resolveDecision } from '../../utils/utils';

const LiteratureDecisionDetails = ({ decision }) => {
  if (!decision) return null;

  const resolvedDecision = resolveDecision(decision.get('action'));
  const className = resolvedDecision
    ? `decision-pill ${resolvedDecision.bg}`
    : undefined;
  const decisionText = resolvedDecision ? resolvedDecision.decision : undefined;

  return (
    <p>
      Action:{' '}
      <UnclickableTag className={className}>{decisionText}</UnclickableTag>
    </p>
  );
};

export default LiteratureDecisionDetails;
