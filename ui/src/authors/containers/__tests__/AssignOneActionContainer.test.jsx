import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignOneActionContainer from '../AssignOneActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
  setPublicationSelection,
  clearPublicationSelection,
  unassignPapers,
} from '../../../actions/authors';

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
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);

describe('AssignOneActionContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects one paper and dispatches setAssignDrawerVisibility with true on assign to another author', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignOneActionContainer recordId={paperRecordId} />
      </Provider>
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const assignAnotherOption = getByTestId('assign-another');
      expect(assignAnotherOption).toBeInTheDocument();
      fireEvent.click(assignAnotherOption);
    });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      setAssignDrawerVisibility(true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches assignPapers', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignOneActionContainer recordId={paperRecordId} />
      </Provider>
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const assignOption = getByTestId('assign-self');
      expect(assignOption).toBeInTheDocument();
      fireEvent.click(assignOption);
    });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      assignPapers({ from: 123, to: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches unassignPapers', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignOneActionContainer recordId={paperRecordId} />
      </Provider>
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const unassignOption = getByTestId('unassign');
      expect(unassignOption).toBeInTheDocument();
      fireEvent.click(unassignOption);
    });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      unassignPapers({ from: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
