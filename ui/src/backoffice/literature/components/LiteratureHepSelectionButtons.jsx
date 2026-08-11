import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';
import LiteratureRejectButton from './LiteratureRejectButton';

const FULL_COVERAGE_TOOLTIP = 'The article belongs to a fully taken journal';

export const LiteratureHepSelectionButtons = ({
  handleResolveAction,
  isFullCoverage = false,
  shouldShowSubmissionModal = false,
  submissionContext = undefined,
  disableActions,
}) => (
  <div className="flex items-center flex-wrap" style={{ gap: '4px' }}>
    <Button
      className="font-white bg-completed"
      onClick={() => handleResolveAction(WorkflowDecisions.HEP_ACCEPT_CORE)}
      disabled={disableActions}
    >
      Core
    </Button>
    <Button
      className="font-white bg-halted"
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
      disabled={disableActions}
    />
  </div>
);
