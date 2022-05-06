import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllOwnProfileActionContainer from '../AssignAllOwnProfileActionContainer';

import { assignOwnPapers } from '../../../actions/authors';
import AssignOwnProfileAction from '../../components/AssignOwnProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../../actions/authors');
mockActionCreator(assignOwnPapers);

describe('AssignOwnProfileActionContainer', () => {
  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set([1, 2]),
        publicationSelectionClaimed: [1],
        publicationSelectionUnclaimed: [2],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      disabled: false,
      disabledAssignAction: false,
    });
  });

  it('sets disabledAssignAction=true if all papers are claimed', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
        publicationSelection: Set([1, 2]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      disabled: false,
      disabledAssignAction: true,
    });
  });

  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      disabled: true,
      disabledAssignAction: false,
    });
  });

  it('sets correct numberOfSelected when publications are selected', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelectionClaimed: [1, 2],
        publicationSelectionUnclaimed: [],
        publicationSelection: Set([1, 2]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    expect(wrapper.find(AssignOwnProfileAction)).toHaveProp({
      numberOfSelected: 2,
    });
  });


  it('dispatches assignPapers with on assign', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllOwnProfileActionContainer />
      </Provider>
    );
    const from = 123;
    const to = 321;
    const isUnassignAction = true;
    const onAssign = wrapper.find(AssignOwnProfileAction).prop('onAssign');
    onAssign({ from, to, isUnassignAction });
    const expectedActions = [assignOwnPapers({ from, to, isUnassignAction })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
