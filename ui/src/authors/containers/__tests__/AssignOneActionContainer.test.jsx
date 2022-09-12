import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignOneActionContainer from '../AssignOneActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
  setPublicationSelection,
  clearPublicationSelection,
  unassignPapers,
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
mockActionCreator(unassignPapers);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);

describe('AssignOneActionContainer', () => {
  it('selects one paper and dispatches setAssignDrawerVisibility with true on assign to another author', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneActionContainer recordId={paperRecordId} />
      </Provider>
    );
    const onAssignToAnotherAuthor = wrapper
      .find(AssignAction)
      .prop('onAssignToAnotherAuthor');
    onAssignToAnotherAuthor();
    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      setAssignDrawerVisibility(true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches assignPapers', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneActionContainer recordId={paperRecordId} />
      </Provider>
    );
    const onAssign = wrapper.find(AssignAction).prop('onAssign');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      assignPapers({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches unassignPapers', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneActionContainer recordId={paperRecordId} />
      </Provider>
    );
    const onUnassign = wrapper.find(AssignAction).prop('onUnassign');
    onUnassign({ from });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      unassignPapers({ from }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
