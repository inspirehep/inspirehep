import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureCoreSelectionButtons = ({ handleResolveAction }) => (
  <div className="flex items-center" style={{ gap: '4px' }}>
    <Button
      className="font-white bg-completed"
      onClick={() =>
        handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE)
      }
    >
      Core
    </Button>
    <Button
      className="font-white bg-halted"
      onClick={() =>
        handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT)
      }
    >
      Accept
    </Button>
  </div>
);
