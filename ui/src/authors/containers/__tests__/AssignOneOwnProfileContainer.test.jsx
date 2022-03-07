import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignOneOwnProfileContainer from '../AssignOneOwnProfileContainer';

import {
  assignOwnPapers,
  setPublicationSelection,
  setPublicationsClaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationsUnclaimedSelection,
} from '../../../actions/authors';
import AssignOwnProfileAction from '../../components/AssignOwnProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../../actions/authors');
mockActionCreator(assignOwnPapers);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(clearPublicationsClaimedSelection);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);
mockActionCreator(setPublicationsUnclaimedSelection);
mockActionCreator(clearPublicationsUnclaimedSelection);

describe('AssignOneOwnProfileActionContainer', () => {
  it('selects the one paper and dispatches assignPapers when paper unclaimed', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const isUnassignAction = true;
    const disabledAssignAction = false;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneOwnProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
        />
      </Provider>
    );
    const onAssign = wrapper.find(AssignOwnProfileAction).prop('onAssign');
    onAssign({ from, to, isUnassignAction });

    const expectedActions = [
      clearPublicationSelection(),
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsUnclaimedSelection([paperRecordId], true),
      assignOwnPapers({ from, to, isUnassignAction }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('selects the one paper and dispatches assignPapers when paper claimed', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const isUnassignAction = true;
    const disabledAssignAction = true;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneOwnProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
        />
      </Provider>
    );
    const onAssign = wrapper.find(AssignOwnProfileAction).prop('onAssign');
    onAssign({ from, to, isUnassignAction });

    const expectedActions = [
      clearPublicationSelection(),
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsClaimedSelection([paperRecordId], true),
      assignOwnPapers({ from, to, isUnassignAction }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
