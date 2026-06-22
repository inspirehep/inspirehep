import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllDifferentProfileActionContainer from '../AssignAllDifferentProfileActionContainer';
import { assignDifferentProfile } from '../../../actions/authors';
import AssignDifferentProfileAction from '../../components/AssignDifferentProfileAction';
import { renderWithProviders } from '../../../fixtures/render';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

vi.mock('../../components/AssignDifferentProfileAction', async () => {
  const actual = await vi.importActual(
    '../../components/AssignDifferentProfileAction'
  );
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

vi.mock('../../../actions/authors');
mockActionCreator(assignDifferentProfile);

describe('AssignDifferentProfileActionContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: [1, 2],
      }),
      user: fromJS({
        data: {
          recid: 8,
        },
      }),
    });

    renderWithProviders(<AssignAllDifferentProfileActionContainer />, {
      store,
    });

    expect(AssignDifferentProfileAction).toBeCalledWith(
      expect.objectContaining({
        disabled: false,
        currentUserId: 8,
      }),
      expect.anything()
    );
  });

  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
      }),
      user: fromJS({
        data: {
          recid: 8,
        },
      }),
    });

    renderWithProviders(<AssignAllDifferentProfileActionContainer />, {
      store,
    });

    expect(AssignDifferentProfileAction).toBeCalledWith(
      expect.objectContaining({
        disabled: true,
        currentUserId: 8,
      }),
      expect.anything()
    );
  });

  it('dispatches assignDifferentProfile with on onAssign ', async () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: [1, 2],
      }),
      user: fromJS({
        data: {
          recid: 321,
        },
      }),
    });

    const { getByTestId } = renderWithProviders(
      <AssignAllDifferentProfileActionContainer />,
      { store }
    );

    const claimButton = getByTestId('claim-multiple');
    expect(claimButton).toBeInTheDocument();

    fireEvent.mouseOver(claimButton);

    await waitFor(() => {
      const assignOption = getByTestId('assign-self');
      expect(assignOption).toBeInTheDocument();
      fireEvent.click(assignOption);
    });

    const expectedActions = [assignDifferentProfile({ from: 123, to: 321 })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
