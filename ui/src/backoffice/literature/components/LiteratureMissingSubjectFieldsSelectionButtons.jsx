import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import { FULL_COVERAGE_TOOLTIP } from '../../constants';
import '../../common/components/ActionButtons.less';
import LiteratureRejectButton from './LiteratureRejectButton';

export const LiteratureMissingSubjectFieldsSelectionButtons = ({
  handleResolveAction,
  hasInspireCategories,
  isFullCoverage = false,
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
      <LiteratureRejectButton
        handleResolveAction={handleResolveAction}
        isWeak={isFullCoverage}
        tooltipText={isFullCoverage ? FULL_COVERAGE_TOOLTIP : undefined}
        disableActions={disableActions}
      />
    </div>
  </div>
);
