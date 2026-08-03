import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureMissingSubjectFieldsSelectionButtons = ({
  handleResolveAction,
  hasInspireCategories,
  disableActions,
}) => (
  <div className="flex items-center flex-wrap" style={{ gap: '4px' }}>
    {hasInspireCategories && (
      <>
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
      </>
    )}
    <div className="flex">
      <Button
        className="font-white bg-error"
        onClick={() => handleResolveAction(WorkflowDecisions.HEP_REJECT)}
        disabled={disableActions}
      >
        Reject
      </Button>
    </div>
  </div>
);
