import React from 'react';
import { Card } from 'antd';

import { WorkflowStatuses } from '../../constants';
import LiteratureActionButtons from './LiteratureActionButtons';

const LiteratureBatchOperationsCard = ({
  selectedCount,
  status,
  onResolveAction,
}: {
  selectedCount: number;
  status: WorkflowStatuses.APPROVAL | WorkflowStatuses.APPROVAL_CORE_SELECTION;
  onResolveAction: (action: string) => void;
}) => (
  <Card className="mb3" style={{ marginBottom: '10px' }}>
    <h4 className="mt0 mb3">
      Batch operations on {selectedCount} selected records.
    </h4>
    <LiteratureActionButtons
      status={status}
      hasInspireCategories // Assuming all selected records have categories for batch operations
      handleResolveAction={onResolveAction}
      isBatch
    />
  </Card>
);

export default LiteratureBatchOperationsCard;
