import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../../fixtures/render';
import WorkflowResultItem from '../WorkflowResultItem';
import { BACKOFFICE_LITERATURE_SEARCH } from '../../../../common/routes';
import { WorkflowStatuses, WorkflowTypes } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';

describe('WorkflowResultItem component for Literature', () => {
  it('calls resolve action from literature buttons', () => {
    const handleResolveAction = jest.fn();
    const handleSelectionChange = jest.fn();
    const item = fromJS({
      id: '456',
      workflow_type: WorkflowTypes.HEP_CREATE,
      status: WorkflowStatuses.APPROVAL,
      decisions: fromJS([
        {
          action: WorkflowDecisions.HEP_ACCEPT_CORE,
        },
      ]),
      data: fromJS({
        titles: fromJS([
          {
            title: 'Example title',
          },
        ]),
        inspire_categories: fromJS([{ term: 'hep-th' }]),
        acquisition_source: fromJS({
          datetime: '2025-01-07T16:29:31.315971',
          email: 'john.doe@cern.ch',
          method: 'submitter1',
          source: 'submitter2',
        }),
      }),
    });

    renderWithProviders(
      <WorkflowResultItem
        item={item}
        handleResolveAction={handleResolveAction}
        shouldShowSelectionCheckbox
        onSelectionChange={handleSelectionChange}
      />,
      {
        route: BACKOFFICE_LITERATURE_SEARCH,
      }
    );

    fireEvent.click(screen.getByRole('button', { name: 'Core' }));

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_ACCEPT_CORE
    );

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select workflow 456' })
    );
    expect(handleSelectionChange).toHaveBeenCalledWith('456', true);
  });
});
