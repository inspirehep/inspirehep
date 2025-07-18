import React from 'react';
import { fromJS } from 'immutable';

import { initialState } from '../../../reducers/authors';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationSelectContainer from '../PublicationSelectContainer';
import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../../actions/authors';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(setPublicationsUnclaimedSelection);

describe('PublicationSelectContainer', () => {
  it('dispatches setPublicationSelection and setPublicationsClaimedSelection on change', () => {
    const store = getStore();
    const { getByRole } = renderWithProviders(
      <PublicationSelectContainer recordId={1} claimed isOwnProfile />,
      { store }
    );
    getByRole('checkbox').click();
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsClaimedSelection([1], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('dispatches setPublicationSelection on change for unclaimed record', () => {
    const store = getStore();
    const { getByRole } = renderWithProviders(
      <PublicationSelectContainer recordId={1} claimed={false} isOwnProfile />,
      { store }
    );
    getByRole('checkbox').click();
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsUnclaimedSelection([1], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('passes correct checked value if publication is selected', () => {
    const store = getStore({
      authors: fromJS({
        ...initialState,
        publicationSelection: [1, 2, 3],
      }),
    });
    const { getByRole } = renderWithProviders(
      <PublicationSelectContainer recordId={1} claimed />,
      { store }
    );

    expect(getByRole('checkbox')).toBeChecked();
  });
  it('renders checkbox checked when select all is checked', () => {
    const store = getStore({
      authors: fromJS({
        ...initialState,
        publicationSelection: [1, 2, 3],
      }),
    });
    const { asFragment } = renderWithProviders(
      <PublicationSelectContainer recordId={1} claimed />,
      { store }
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
