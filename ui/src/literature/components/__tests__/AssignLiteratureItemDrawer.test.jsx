import React from 'react';
import { fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../fixtures/render';
import AssignLiteratureItemDrawer from '../AssignLiteratureItemDrawer';

describe('AssignLiteratureItemDrawer', () => {
  beforeAll(() => {
    const rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'root');
    document.body.appendChild(rootElement);
  });

  it('renders authors list', () => {
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const literatureId = 122334;
    const authors = fromJS([
      {
        full_name: 'Test, A',
        record: {
          $ref: 'https://inspirebeta.net/api/authors/1016091',
        },
      },
    ]);

    const { baseElement } = renderWithProviders(
      <AssignLiteratureItemDrawer
        authors={authors}
        literatureId={literatureId}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        currentUserRecordId={12345676}
        itemLiteratureId={122334}
        page="Page"
      />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const literatureId = 122334;
    const onDrawerClose = jest.fn();
    const onAssignClick = jest.fn();
    const authors = fromJS([
      {
        full_name: 'Test, A',
        record: {
          $ref: 'https://inspirebeta.net/api/authors/1016091',
        },
      },
    ]);

    const { getByTestId, getByRole } = renderWithProviders(
      <AssignLiteratureItemDrawer
        literatureId={literatureId}
        onDrawerClose={onDrawerClose}
        onAssign={onAssignClick}
        currentUserRecordId={12345676}
        authors={authors}
        itemLiteratureId={122334}
        page="Page"
      />
    );

    const assignButton = getByTestId('assign-literature-item-button');
    expect(assignButton).toBeDisabled();

    const radioButton = getByRole('radio');
    fireEvent.click(radioButton);

    expect(assignButton).not.toBeDisabled();

    fireEvent.click(assignButton);
    expect(onAssignClick).toHaveBeenCalled();
  });
});
