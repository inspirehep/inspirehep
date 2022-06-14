import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(setPublicationsUnclaimedSelection);
mockActionCreator(setPublicationsCanNotClaimSelection);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PublicationSelectContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setPublicationSelection and setPublicationsClaimedSelection on change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed canClaim />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsClaimedSelection([1], true),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setPublicationsCanNotClaimSelection on change when user can not claim', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed canClaim={false} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsCanNotClaimSelection([1], true),
      setPublicationsClaimedSelection([1], true),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setPublicationSelection on change for unclaimed record', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed={false} canClaim />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationSelection([1], true),
      setPublicationsUnclaimedSelection([1], true),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(PublicationsSelect).prop('checked')).toBe(true);
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
