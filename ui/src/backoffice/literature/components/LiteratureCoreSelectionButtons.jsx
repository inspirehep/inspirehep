import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';

export const LiteratureCoreSelectionButtons = ({
  handleResolveAction,
  disableActions,
}) => (
  <div className="flex items-center" style={{ gap: '4px' }}>
    <Button
      color="cyan"
      variant="solid"
      onClick={() =>
        handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE)
      }
      disabled={disableActions}
    >
      Core
    </Button>
    <Button
      color="orange"
      variant="solid"
      onClick={() =>
        handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT)
      }
      disabled={disableActions}
    >
      Accept
    </Button>
  </div>
);
