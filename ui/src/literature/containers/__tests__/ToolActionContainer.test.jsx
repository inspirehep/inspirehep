import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import ToolActionContainer from '../ToolActionContainer';
import ToolAction from '../../components/ToolAction';
import {
  setAssignDrawerVisibility,
  exportToCds,
} from '../../../actions/literature';
import * as constants from '../../constants';

jest.mock('../../../actions/literature');

mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(exportToCds);

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
      disabledBulkAssign: false,
      selectionSize: 1,
    });

    const clickExportToCds = wrapper.find(ToolAction).prop('onExportToCds');
    clickExportToCds();
    const expectedActions = [exportToCds()];
    expect(store.getActions()).toEqual(expectedActions);

    const clickAssignDrawerVisibility = wrapper
      .find(ToolAction)
      .prop('onAssignToConference');
    clickAssignDrawerVisibility();
    expect(setAssignDrawerVisibility).toHaveBeenCalledWith(true);
  });

  it('passes disabledBulkAssign true', () => {
    const selection = Set([1, 2, 3]);

    constants.MAX_BULK_ASSIGN = 2;

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
      disabledBulkAssign: true,
    });
  });
});
