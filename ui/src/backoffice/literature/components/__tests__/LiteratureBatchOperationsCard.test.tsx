import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { WorkflowStatuses } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';
import LiteratureBatchOperationsCard from '../LiteratureBatchOperationsCard';

describe('LiteratureBatchOperationsCard', () => {
  it('renders title and triggers resolve action from buttons', () => {
    const onResolveAction = jest.fn();

    render(
      <LiteratureBatchOperationsCard
        selectedCount={2}
        status={WorkflowStatuses.APPROVAL}
        onResolveAction={onResolveAction}
      />
    );

    expect(
      screen.getByText('Batch operations on 2 selected records.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Core' }));
    expect(onResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_ACCEPT_CORE
    );
  });
});
