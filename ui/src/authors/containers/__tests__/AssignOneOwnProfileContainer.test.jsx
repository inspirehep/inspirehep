import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignOneOwnProfileContainer from '../AssignOneOwnProfileContainer';

import {
  assignOwnPapers,
  unassignOwnPapers,
  setPublicationSelection,
  setPublicationsClaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationsUnclaimedSelection,
} from '../../../actions/authors';

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
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(clearPublicationsClaimedSelection);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);
mockActionCreator(setPublicationsUnclaimedSelection);
mockActionCreator(clearPublicationsUnclaimedSelection);

describe('AssignOneOwnProfileActionContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects one paper and dispatches assignOwnPapers when paper unclaimed', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const disabledAssignAction = false;
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignOneOwnProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
        />
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
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsUnclaimedSelection([paperRecordId], true),
      assignOwnPapers({ from: 123, to: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches unassignOwnPapers when paper unclaimed', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const disabledAssignAction = false;
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignOneOwnProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
        />
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
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsUnclaimedSelection([paperRecordId], true),
      unassignOwnPapers({ from: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('selects one paper and dispatches unassignOwnPapers when paper claimed', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const disabledAssignAction = true;
    const { getByTestId } = render(
      <Provider store={store}>
        <AssignOneOwnProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
        />
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
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsClaimedSelection([paperRecordId], true),
      unassignOwnPapers({ from: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
