import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllOwnProfileActionContainer from '../AssignAllOwnProfileActionContainer';

import { assignOwnPapers, unassignOwnPapers } from '../../../actions/authors';
import AssignOwnProfileAction from '../../components/AssignOwnProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../components/AssignOwnProfileAction', () => {
  const actual = jest.requireActual('../../components/AssignOwnProfileAction');
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

jest.mock('../../../actions/authors');
mockActionCreator(assignOwnPapers);
mockActionCreator(unassignOwnPapers);

describe('AssignOwnProfileActionContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
        publicationSelectionClaimed: [1],
        publicationSelectionUnclaimed: [2],
      }),
    });
    render(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );

    expect(AssignOwnProfileAction).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: false,
        disabledAssignAction: false,
      }),
      expect.anything()
    );
  });

  it('sets disabledAssignAction=true if all papers are claimed', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
        publicationSelection: Set([1, 2]),
      }),
    });
    render(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );

    expect(AssignOwnProfileAction).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: false,
        disabledAssignAction: true,
      }),
      expect.anything()
    );
  });

  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
    });
    render(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );

    expect(AssignOwnProfileAction).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        disabledAssignAction: false,
      }),
      expect.anything()
    );
  });

  it('sets correct numberOfSelected when publications are selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
        publicationSelection: Set([1, 2]),
      }),
    });
    render(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );

    expect(AssignOwnProfileAction).toHaveBeenCalledWith(
      expect.objectContaining({
        numberOfSelected: 2,
      }),
      expect.anything()
    );
  });

  it('dispatches assignOwnPapers on assign', async () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [1, 2],
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const assignOption = getByTestId('assign-self');
      expect(assignOption).toBeInTheDocument();
      fireEvent.click(assignOption);
    });

    const expectedActions = [assignOwnPapers({ from: 123, to: 123 })];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches unassignOwnPapers on unassign', async () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const unassignOption = getByTestId('unassign');
      expect(unassignOption).toBeInTheDocument();
      fireEvent.click(unassignOption);
    });

    const expectedActions = [unassignOwnPapers({ from: 123 })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
