import React from 'react';
import { Button } from 'antd';

export const LiteratureCoreSelectionButtons = ({
  handleResolveAction,
  actionInProgress,
}) => {
  const isLoading = actionInProgress === 'resolve';
  return (
    <div className="flex flex-column items-center">
      <Button
        className="font-white bg-completed w-75 mb2"
        onClick={() => handleResolveAction('core_selection_accept_core')}
        loading={isLoading}
      >
        Core
      </Button>
      <Button
        className="font-white bg-halted w-75 mb2"
        onClick={() => handleResolveAction('core_selection_accept')}
        loading={isLoading}
      >
        Accept
      </Button>
    </div>
  );
};
