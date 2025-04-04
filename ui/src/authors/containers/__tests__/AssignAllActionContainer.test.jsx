import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllActionContainer from '../AssignAllActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../../actions/authors';
import AssignAction from '../../components/AssignAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

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

    render(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );

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

    render(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );

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

    render(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );

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

    const { container, getByTestId } = render(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
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

    render(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );

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

    render(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );

    const from = 123;

    const onUnassignCall = AssignAction.mock.calls[0][0].onUnassign;
    onUnassignCall({ from });

    const expectedActions = [unassignPapers({ from })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
