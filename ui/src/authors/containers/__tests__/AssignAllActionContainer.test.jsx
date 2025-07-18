import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllActionContainer from '../AssignAllActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../../actions/authors';
import AssignAction from '../../components/AssignAction';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

jest.mock('../../components/AssignAction', () => {
  const actual = jest.requireActual('../../components/AssignAction');
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

jest.mock('../../../actions/authors');
mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(assignPapers);
mockActionCreator(unassignPapers);

describe('AssignAllActionContainer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });

    renderWithProviders(<AssignAllActionContainer />, { store });

    expect(AssignAction).toBeCalledWith(
      expect.objectContaining({
        disabled: false,
      }),
      expect.anything()
    );
  });

  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
      }),
    });

    renderWithProviders(<AssignAllActionContainer />, { store });

    expect(AssignAction).toBeCalledWith(
      expect.objectContaining({
        disabled: true,
      }),
      expect.anything()
    );
  });

  it('sets correct numberOfSelected when publications are selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });

    renderWithProviders(<AssignAllActionContainer />, { store });

    expect(AssignAction).toBeCalledWith(
      expect.objectContaining({
        numberOfSelected: 2,
      }),
      expect.anything()
    );
  });

  it('dispatches setAssignDrawerVisibility with true on assign to another author', async () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });

    const { container, getByTestId } = renderWithProviders(
      <AssignAllActionContainer />,
      { store }
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => fireEvent.click(getByTestId('assign-another')));

    const expectedActions = [setAssignDrawerVisibility(true)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches assignPapers on assign', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });

    renderWithProviders(<AssignAllActionContainer />, { store });

    const from = 123;
    const to = 321;

    const onAssignCall = AssignAction.mock.calls[0][0].onAssign;
    onAssignCall({ from, to });

    const expectedActions = [assignPapers({ from, to })];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches unassignPapers on unassign', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });

    renderWithProviders(<AssignAllActionContainer />, { store });

    const from = 123;

    const onUnassignCall = AssignAction.mock.calls[0][0].onUnassign;
    onUnassignCall({ from });

    const expectedActions = [unassignPapers({ from })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
