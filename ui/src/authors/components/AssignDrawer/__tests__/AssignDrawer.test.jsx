import React from 'react';
import { Set } from 'immutable';

import { renderWithProviders } from '../../../../fixtures/render';
import AssignDrawer from '../AssignDrawer';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn().mockReturnValue({ id: 123 }),
  };
});

describe('AssignDrawer', () => {
  it('renders assign authors search', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const screen = renderWithProviders(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );

    expect(screen.baseElement).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const { getByTestId, getByRole } = renderWithProviders(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    expect(getByTestId('assign-button')).toBeDisabled();
    getByRole('radio', { name: 'New author' }).click();
    expect(getByTestId('assign-button')).toBeEnabled();

    getByTestId('assign-button').click();
    expect(onAssign).toHaveBeenCalledWith({ from: 123, to: undefined });
  });
});
