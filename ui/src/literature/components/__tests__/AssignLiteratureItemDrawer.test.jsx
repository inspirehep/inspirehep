import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import AssignLiteratureItemDrawer from '../AssignLiteratureItemDrawer';
import { getStore } from '../../../fixtures/store';

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

    const { baseElement } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <AssignLiteratureItemDrawer
            authors={authors}
            literatureId={literatureId}
            onDrawerClose={onDrawerClose}
            onAssign={onAssign}
            currentUserRecordId={12345676}
            itemLiteratureId={122334}
            page="Page"
          />
        </MemoryRouter>
      </Provider>
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

    const { getByTestId, getByRole } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <AssignLiteratureItemDrawer
            literatureId={literatureId}
            onDrawerClose={onDrawerClose}
            onAssign={onAssignClick}
            currentUserRecordId={12345676}
            authors={authors}
            itemLiteratureId={122334}
            page="Page"
          />
        </MemoryRouter>
      </Provider>
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
