import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Checkbox } from 'antd';
import { fromJS } from 'immutable';

import { initialState } from '../../../reducers/authors';
import PublicationsSelect from '../../components/PublicationsSelect';
import { getStore, mockActionCreator, getStoreWithState } from '../../../fixtures/store';
import PublicationSelectContainer from '../PublicationSelectContainer';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsCanNotClaimSelection,
  setPublicationsUnclaimedSelection,
} from '../../../actions/authors';

jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(setPublicationsUnclaimedSelection);
mockActionCreator(setPublicationsCanNotClaimSelection);

describe('PublicationSelectContainer', () => {
  it('dispatches setPublicationSelection and setPublicationsClaimedSelection on change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed canClaim />
      </Provider>
    );
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsClaimedSelection([1], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('dispatches setPublicationsCanNotClaimSelection on change when user can not claim', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed canClaim={false} />
      </Provider>
    );
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsCanNotClaimSelection([1], true),
      setPublicationsClaimedSelection([1], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('dispatches setPublicationSelection on change for unclaimed record', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed={false} canClaim />
      </Provider>
    );
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsUnclaimedSelection([1], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('passes correct checked value if publication is selected', () => {
    const store = getStoreWithState({
      authors: fromJS({
        ...initialState,
        publicationSelection: [1, 2, 3],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed canClaim />
      </Provider>
    );
    
    expect(wrapper.find(PublicationsSelect).prop('checked')).toBe(true);
  });
  it('renders checkbox checked when select all is checked', () => {
    const store = getStoreWithState({
      authors: fromJS({
        ...initialState,
        publicationSelection: [1, 2, 3],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed canClaim />
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
