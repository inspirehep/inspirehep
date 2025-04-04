import React from 'react';
import { render } from '@testing-library/react';
import { Set } from 'immutable';

import { Provider } from 'react-redux';
import AssignDrawer from '../AssignDrawer';
import { getStore } from '../../../../fixtures/store';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignDrawer', () => {
  it('renders assign authors search', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const screen = render(
      <Provider store={getStore()}>
        <AssignDrawer
          visible={visible}
          onDrawerClose={onDrawerClose}
          onAssign={onAssign}
          selectedPapers={selectedPapers}
        />
      </Provider>
    );

    expect(screen.baseElement).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const { getByTestId, getByRole } = render(
      <Provider store={getStore()}>
        <AssignDrawer
          visible={visible}
          onDrawerClose={onDrawerClose}
          onAssign={onAssign}
          selectedPapers={selectedPapers}
        />
      </Provider>
    );
    expect(getByTestId('assign-button')).toBeDisabled();
    getByRole('radio', { name: 'New author' }).click();
    expect(getByTestId('assign-button')).toBeEnabled();

    getByTestId('assign-button').click();
    expect(onAssign).toHaveBeenCalledWith({ from: 123, to: undefined });
  });
});
