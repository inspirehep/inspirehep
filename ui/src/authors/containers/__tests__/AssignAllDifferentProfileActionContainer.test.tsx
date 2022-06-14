import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllDifferentProfileActionContainer from '../AssignAllDifferentProfileActionContainer';

import {
  assignDifferentProfileUnclaimedPapers,
  assignDifferentProfileClaimedPapers,
} from '../../../actions/authors';
import AssignDifferentProfileAction from '../../components/AssignDifferentProfileAction';

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

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignOwnProfileActionContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: [1, 2],
        publicationSelectionClaimed: [1],
        publicationSelectionUnclaimed: [2],
      }),
      user: fromJS({
        data: {
          recid: 8,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: false,
      currentUserId: 8,
      claimingUnclaimedPapersDisabled: false,
      claimingClaimedPapersDisabled: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets claimingUnclaimedPapersDisabled if no unclaimed papers selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: [1, 2],
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
      }),
      user: fromJS({
        data: {
          recid: 8,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: false,
      currentUserId: 8,
      claimingUnclaimedPapersDisabled: true,
      claimingClaimedPapersDisabled: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets claimingClaimedPapersDisabled if unclaimed papers selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: [1, 2],
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [1, 2],
        publicationSelectionCanNotClaim: [],
      }),
      user: fromJS({
        data: {
          recid: 8,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: false,
      currentUserId: 8,
      claimingUnclaimedPapersDisabled: false,
      claimingClaimedPapersDisabled: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
        publicationSelectionCanNotClaim: [],
      }),
      user: fromJS({
        data: {
          recid: 8,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: true,
      claimingUnclaimedPapersDisabled: true,
      claimingClaimedPapersDisabled: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches assignDifferentProfileClaimedPapers with on onAssignWithoutUnclaimed ', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    const from = 123;
    const to = 321;
    const onAssignWithoutUnclaimed = wrapper
      .find(AssignDifferentProfileAction)
      .prop('onAssignWithoutUnclaimed');
    onAssignWithoutUnclaimed({
      from,
      to,
    });
    const expectedActions = [assignDifferentProfileClaimedPapers({ from, to })];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches assignDifferentProfileUnclaimedPapers with on onAssignWithoutClaimed ', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    const from = 123;
    const to = 321;
    const onAssignWithoutClaimed = wrapper
      .find(AssignDifferentProfileAction)
      .prop('onAssignWithoutClaimed');
    onAssignWithoutClaimed({
      from,
      to,
    });
    const expectedActions = [
      assignDifferentProfileUnclaimedPapers({ from, to }),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
