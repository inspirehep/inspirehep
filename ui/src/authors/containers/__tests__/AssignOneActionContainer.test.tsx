import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignOneActionContainer from '../AssignOneActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
  setPublicationSelection,
  clearPublicationSelection,
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
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignOneActionContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('selects the one paper and dispatches setAssignDrawerVisibility with true on assign to another author', () => {
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('selects the one paper and dispatches assignPapers', () => {
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
