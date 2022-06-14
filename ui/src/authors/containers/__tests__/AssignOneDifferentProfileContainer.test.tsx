import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignOneDifferentProfileActionContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
