import React from 'react';
import { Card } from 'antd';
import { Map } from 'immutable';

import { WorkflowStatuses } from '../../constants';
import LiteratureActionButtons from './LiteratureActionButtons';

const LiteratureBatchOperationsCard = ({
  selectedCount,
  status,
  onResolveAction,
  actionInProgress,
}: {
  selectedCount: number;
  status: WorkflowStatuses.APPROVAL | WorkflowStatuses.APPROVAL_CORE_SELECTION;
  onResolveAction: (action: string) => void;
  actionInProgress?: Map<string, any> | null;
}) => (
  <Card className="mb3" style={{ marginBottom: '10px' }}>
    <h4 className="mt0 mb3">
      Batch operations on {selectedCount} selected records.
    </h4>
    <LiteratureActionButtons
      status={status}
      hasInspireCategories
      handleResolveAction={onResolveAction}
      actionInProgress={actionInProgress}
      workflowId="batch-operations"
      isBatch
    />
  </Card>
);

export default LiteratureBatchOperationsCard;
