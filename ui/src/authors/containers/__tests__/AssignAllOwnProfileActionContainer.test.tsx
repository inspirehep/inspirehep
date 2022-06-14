import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllOwnProfileActionContainer from '../AssignAllOwnProfileActionContainer';

import { assignOwnPapers } from '../../../actions/authors';
import AssignOwnProfileAction from '../../components/AssignOwnProfileAction';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/authors');
mockActionCreator(assignOwnPapers);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignOwnProfileActionContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
        publicationSelectionClaimed: [1],
        publicationSelectionUnclaimed: [2],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      disabled: false,
      disabledAssignAction: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabledAssignAction=true if all papers are claimed', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
        publicationSelection: Set([1, 2]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      disabled: false,
      disabledAssignAction: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      disabled: true,
      disabledAssignAction: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets correct numberOfSelected when publications are selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
        publicationSelection: Set([1, 2]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      numberOfSelected: 2,
    });
  });


  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches assignPapers with on assign', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    const from = 123;
    const to = 321;
    const isUnassignAction = true;
    const onAssign = wrapper.find(AssignOwnProfileAction).prop('onAssign');
    onAssign({ from, to, isUnassignAction });
    const expectedActions = [assignOwnPapers({ from, to, isUnassignAction })];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
