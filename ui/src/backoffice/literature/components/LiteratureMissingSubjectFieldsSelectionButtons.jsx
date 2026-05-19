import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureMissingSubjectFieldsSelectionButtons = ({
  handleResolveAction,
}) => (
  <div className="flex">
    <Button
      className="font-white bg-error"
      onClick={() => handleResolveAction(WorkflowDecisions.HEP_REJECT)}
    >
      Reject
    </Button>
  </div>
);
