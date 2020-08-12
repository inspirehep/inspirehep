import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllActionContainer from '../AssignAllActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
} from '../../../actions/authors';
import AssignAction from '../../components/AssignAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../../actions/authors');
mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(assignPapers);

describe('AssignAllActionContainer', () => {
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
    expect(store.getActions()).toEqual(expectedActions);
  });

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
    expect(store.getActions()).toEqual(expectedActions);
  });
});
