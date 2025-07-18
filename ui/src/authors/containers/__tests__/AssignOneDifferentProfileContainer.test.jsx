import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import {
  setPublicationSelection,
  clearPublicationSelection,
  assignDifferentProfile,
} from '../../../actions/authors';
import AssignOneDifferentProfileContainer from '../AssignOneDifferentProfileContainer';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

jest.mock('../../components/AssignOneDifferentProfileAction', () => {
  const actual = jest.requireActual(
    '../../components/AssignOneDifferentProfileAction'
  );
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

jest.mock('../../../actions/authors');
mockActionCreator(assignDifferentProfile);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);

describe('AssignOneDifferentProfileActionContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects one paper and dispatches assignDifferentProfile with userCanNotClaimProfile=true', async () => {
    const store = getStore({
      user: fromJS({
        data: {
          recid: 456,
        },
      }),
    });
    const paperRecordId = 12345;
    const userCanNotClaimProfile = true;
    const { getByTestId } = renderWithProviders(
      <AssignOneDifferentProfileContainer
        recordId={paperRecordId}
        userCanNotClaimProfile={userCanNotClaimProfile}
      />,
      { store }
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
      assignDifferentProfile({ from: 123, to: 456 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches assignDifferentProfile with userCanNotClaimProfile=false', async () => {
    const store = getStore({
      user: fromJS({
        data: {
          recid: 123,
        },
      }),
    });
    const paperRecordId = 12345;
    const userCanNotClaimProfile = false;
    const { getByTestId } = renderWithProviders(
      <AssignOneDifferentProfileContainer
        recordId={paperRecordId}
        userCanNotClaimProfile={userCanNotClaimProfile}
      />,
      { store }
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
      assignDifferentProfile({ from: 123, to: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches assignDifferentProfile (third test)', async () => {
    const store = getStore({
      user: fromJS({
        data: {
          recid: 789,
        },
      }),
    });
    const paperRecordId = 12345;
    const userCanNotClaimProfile = false;
    const { getByTestId } = renderWithProviders(
      <AssignOneDifferentProfileContainer
        recordId={paperRecordId}
        userCanNotClaimProfile={userCanNotClaimProfile}
      />,
      { store }
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
      assignDifferentProfile({ from: 123, to: 789 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
