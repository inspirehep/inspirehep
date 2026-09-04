import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import { FULL_COVERAGE_TOOLTIP } from '../../constants';
import LiteratureRejectButton from './LiteratureRejectButton';

export const LiteratureHepSelectionButtons = ({
  handleResolveAction,
  isFullCoverage = false,
  shouldShowSubmissionModal = false,
  submissionContext = undefined,
  disableActions,
}) => (
  <div className="flex items-center flex-wrap" style={{ gap: '4px' }}>
    <Button
      color="cyan"
      variant="solid"
      onClick={() => handleResolveAction(WorkflowDecisions.HEP_ACCEPT_CORE)}
      disabled={disableActions}
    >
      Core
    </Button>
    <Button
      color="orange"
      variant="solid"
      onClick={() => handleResolveAction(WorkflowDecisions.HEP_ACCEPT)}
      disabled={disableActions}
    >
      Accept
    </Button>
    <LiteratureRejectButton
      handleResolveAction={handleResolveAction}
      isWeak={isFullCoverage}
      tooltipText={isFullCoverage ? FULL_COVERAGE_TOOLTIP : undefined}
      shouldShowSubmissionModal={shouldShowSubmissionModal}
      submissionContext={submissionContext}
      disableActions={disableActions}
    />
  </div>
);
