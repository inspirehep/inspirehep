import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignAllDifferentProfileActionContainer from '../AssignAllDifferentProfileActionContainer';

import { assignDifferentProfile } from '../../../actions/authors';
import AssignDifferentProfileAction from '../../components/AssignDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../../actions/authors');
mockActionCreator(assignDifferentProfile);

describe('AssignDifferentProfileActionContainer', () => {
  it('sets disabled=false if publication selection is not empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: [1, 2],
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
    });
  });

  it('sets disabled=true if publication selection is empty', () => {
    const store = getStore({
      authors: fromJS({
        publicationSelection: Set(),
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
    });
  });

  it('dispatches assignDifferentProfile with on onAssign ', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AssignAllDifferentProfileActionContainer />
      </Provider>
    );
    const from = 123;
    const to = 321;
    const onAssign = wrapper
      .find(AssignDifferentProfileAction)
      .prop('onAssign');
    onAssign({
      from,
      to,
    });
    const expectedActions = [assignDifferentProfile({ from, to })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
