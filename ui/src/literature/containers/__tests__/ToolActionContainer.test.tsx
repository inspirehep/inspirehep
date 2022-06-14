import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/literature');

mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(exportToCds);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LiteratureSelectAllContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ToolAction)).toHaveProp({
      disabledBulkAssign: false,
      selectionSize: 1,
    });

    const clickExportToCds = wrapper.find(ToolAction).prop('onExportToCds');
    clickExportToCds();
    const expectedActions = [exportToCds()];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);

    const clickAssignDrawerVisibility = wrapper
      .find(ToolAction)
      .prop('onAssignToConference');
    clickAssignDrawerVisibility();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(setAssignDrawerVisibility).toHaveBeenCalledWith(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes disabledBulkAssign true', () => {
    const selection = Set([1, 2, 3]);

    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'MAX_BULK_ASSIGN' because it is a... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ToolAction)).toHaveProp({
      disabledBulkAssign: true,
    });
  });
});
