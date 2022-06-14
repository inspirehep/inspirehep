import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllDifferentProfileActionContainer from '../AssignAllDifferentProfileActionContainer';

import {
  assignDifferentProfileUnclaimedPapers,
  assignDifferentProfileClaimedPapers,
} from '../../../actions/authors';
import AssignDifferentProfileAction from '../../components/AssignDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../../actions/authors');
mockActionCreator(assignDifferentProfileUnclaimedPapers);
mockActionCreator(assignDifferentProfileClaimedPapers);

describe('AssignOwnProfileActionContainer', () => {
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
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: false,
      currentUserId: 8,
      claimingUnclaimedPapersDisabled: false,
      claimingClaimedPapersDisabled: false,
    });
  });

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
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: false,
      currentUserId: 8,
      claimingUnclaimedPapersDisabled: true,
      claimingClaimedPapersDisabled: false,
    });
  });

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
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: false,
      currentUserId: 8,
      claimingUnclaimedPapersDisabled: false,
      claimingClaimedPapersDisabled: true,
    });
  });

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
    expect(wrapper.find(AssignDifferentProfileAction)).toHaveProp({
      disabled: true,
      claimingUnclaimedPapersDisabled: true,
      claimingClaimedPapersDisabled: true,
    });
  });

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
    expect(store.getActions()).toEqual(expectedActions);
  });

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
    expect(store.getActions()).toEqual(expectedActions);
  });
});
