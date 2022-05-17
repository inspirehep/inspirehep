import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';

import {
  setPublicationSelection,
  clearPublicationSelection,
  assignDifferentProfile,
} from '../../../actions/authors';
import AssignOneDifferentProfileContainer from '../AssignOneDifferentProfileContainer';
import AssignOneDifferentProfileAction from '../../components/AssignOneDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 123,
  }),
}));

jest.mock('../../../actions/authors');
mockActionCreator(assignDifferentProfile);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);

describe('AssignOneDifferentProfileActionContainer', () => {
  it('selects one paper and dispatches assignDifferentProfile', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const userCanNotClaimProfile = true;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneDifferentProfileContainer
          recordId={paperRecordId}
          userCanNotClaimProfile={userCanNotClaimProfile}
        />
      </Provider>
    );
    const onAssign = wrapper
      .find(AssignOneDifferentProfileAction)
      .prop('onAssign');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      assignDifferentProfile({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('selects one paper and dispatches assignDifferentProfile', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const userCanNotClaimProfile = false;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneDifferentProfileContainer
          recordId={paperRecordId}
          userCanNotClaimProfile={userCanNotClaimProfile}
        />
      </Provider>
    );
    const onAssign = wrapper
      .find(AssignOneDifferentProfileAction)
      .prop('onAssign');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      assignDifferentProfile({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('selects one paper and dispatches assignDifferentProfile', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const userCanNotClaimProfile = false;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneDifferentProfileContainer
          recordId={paperRecordId}
          userCanNotClaimProfile={userCanNotClaimProfile}
        />
      </Provider>
    );
    const onAssign = wrapper
      .find(AssignOneDifferentProfileAction)
      .prop('onAssign');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      assignDifferentProfile({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
