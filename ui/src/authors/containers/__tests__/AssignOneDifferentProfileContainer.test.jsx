import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
  clearPublicationsCanNotClaimSelection,
  assignDifferentProfileUnclaimedPapers,
  assignDifferentProfileClaimedPapers,
} from '../../../actions/authors';
import AssignOneDifferentProfileContainer from '../AssignOneDifferentProfileContainer';
import AssignOneDifferentProfileAction from '../../components/AssignOneDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../../actions/authors');
mockActionCreator(assignDifferentProfileUnclaimedPapers);
mockActionCreator(assignDifferentProfileClaimedPapers);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(clearPublicationsClaimedSelection);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);
mockActionCreator(setPublicationsUnclaimedSelection);
mockActionCreator(clearPublicationsUnclaimedSelection);
mockActionCreator(setPublicationsCanNotClaimSelection);
mockActionCreator(clearPublicationsCanNotClaimSelection);

describe('AssignOneDifferentProfileActionContainer', () => {
  it('selects the one paper and dispatches assignPapers for claiming papers that user cant claim', () => {
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
      .prop('onAssignUserCanNotClaim');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      clearPublicationsCanNotClaimSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsCanNotClaimSelection([paperRecordId], true),
      assignDifferentProfileClaimedPapers({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('selects one paper and dispatches assignPapers when paper claimed', () => {
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
      .prop('onAssignWithoutUnclaimed');
    onAssign({ from, to, userCanNotClaimProfile });

    const expectedActions = [
      clearPublicationSelection(),
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      clearPublicationsCanNotClaimSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsClaimedSelection([paperRecordId], true),
      assignDifferentProfileClaimedPapers({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('selects one paper and dispatches assignPapers when paper unclaimed', () => {
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
      .prop('onAssignWithoutClaimed');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      clearPublicationsCanNotClaimSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsUnclaimedSelection([paperRecordId], true),
      assignDifferentProfileUnclaimedPapers({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
