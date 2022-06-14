import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllActionContainer from '../AssignAllActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
} from '../../../actions/authors';
import AssignAction from '../../components/AssignAction';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/authors');
mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(assignPapers);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignAllActionContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignAction)).toHaveProp({
      disabled: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignAction)).toHaveProp({
      disabled: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets correct numberOfSelected when publications are selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignAction)).toHaveProp({
      numberOfSelected: 2,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setAssignDrawerVisibility with true on assign to another author', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );
    const onAssignToAnotherAuthor = wrapper
      .find(AssignAction)
      .prop('onAssignToAnotherAuthor');
    onAssignToAnotherAuthor();
    const expectedActions = [setAssignDrawerVisibility(true)];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches assignPapers with on assign', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllActionContainer />
      </Provider>
    );
    const from = 123;
    const to = 321;
    const onAssign = wrapper.find(AssignAction).prop('onAssign');
    onAssign({ from, to });
    const expectedActions = [assignPapers({ from, to })];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
