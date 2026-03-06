import React from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { LITERATURE_PID_TYPE } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureMergeSelectionButtons = ({ workflowId }) => {
  if (!workflowId) {
    return null;
  }

  return (
    <div className="flex flex-column items-center">
      <Button
        className="font-white bg-resolve-conflict w-75 mb2"
        href={`/editor/backoffice/${LITERATURE_PID_TYPE}/${workflowId}`}
        icon={<EditOutlined />}
      >
        Resolve conflicts
      </Button>
    </div>
  );
};
