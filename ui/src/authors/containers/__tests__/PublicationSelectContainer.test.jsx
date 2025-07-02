import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { initialState } from '../../../reducers/authors';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationSelectContainer from '../PublicationSelectContainer';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../../actions/authors';

jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(setPublicationsUnclaimedSelection);

describe('PublicationSelectContainer', () => {
  it('dispatches setPublicationSelection and setPublicationsClaimedSelection on change', () => {
    const store = getStore();
    const { getByRole } = render(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed isOwnProfile />
      </Provider>
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
    const { getByRole } = render(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed={false} isOwnProfile />
      </Provider>
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
    const { getByRole } = render(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed />
      </Provider>
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
    const { asFragment } = render(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed />
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
