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
import AssignDifferentProfileAction from '../../components/AssignDifferentProfileAction';

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
  it('selects the one paper and dispatches assignPapers when paper unclaimed', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const disabledAssignAction = false;
    const canClaimDifferentProfile = true;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneDifferentProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
          canClaimDifferentProfile={canClaimDifferentProfile}
        />
      </Provider>
    );
    const onAssign = wrapper
      .find(AssignDifferentProfileAction)
      .prop('onAssign');
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
  it('selects the one paper and dispatches assignPapers when paper claimed', () => {
    const store = getStore();
    const paperRecordId = 12345;
    const from = 123;
    const to = 321;
    const disabledAssignAction = true;
    const canClaimDifferentProfile = false;
    const wrapper = mount(
      <Provider store={store}>
        <AssignOneDifferentProfileContainer
          recordId={paperRecordId}
          disabledAssignAction={disabledAssignAction}
          canClaimDifferentProfile={canClaimDifferentProfile}
        />
      </Provider>
    );
    const onAssign = wrapper
      .find(AssignDifferentProfileAction)
      .prop('onAssign');
    onAssign({ from, to });

    const expectedActions = [
      clearPublicationSelection(),
      clearPublicationsClaimedSelection(),
      clearPublicationsUnclaimedSelection(),
      clearPublicationsCanNotClaimSelection(),
      setPublicationSelection([paperRecordId], true),
      setPublicationsCanNotClaimSelection([paperRecordId], true),
      setPublicationsClaimedSelection([paperRecordId], true),
      assignDifferentProfileClaimedPapers({ from, to }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
