import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import ToolActionContainer from '../ToolActionContainer';
import ToolAction from '../../components/ToolAction';
import { setAssignDrawerVisibility } from '../../../actions/literature';
import * as constants from '../../constants';

jest.mock('../../../actions/literature');

mockActionCreator(setAssignDrawerVisibility);

describe('LiteratureSelectAllContainer', () => {
  it('passes state to props', () => {
    const selection = Set([1]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ToolActionContainer />
      </Provider>
    );
    expect(wrapper.find(ToolAction)).toHaveProp({
      disabledAssignConference: false,
    });

    const clickAssignDrawerVisibility = wrapper
      .find(ToolAction)
      .prop('onAssignToConference');
    clickAssignDrawerVisibility();
    expect(setAssignDrawerVisibility).toHaveBeenCalledWith(true);
  });

  it('passes disabledAssignConference true', () => {
    const selection = Set([1, 2, 3]);

    constants.MAX_ASSIGN_RECORDS_TO_CONFERENCE = 2;

    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ToolActionContainer />
      </Provider>
    );
    expect(wrapper.find(ToolAction)).toHaveProp({
      disabledAssignConference: true,
    });
  });
});
