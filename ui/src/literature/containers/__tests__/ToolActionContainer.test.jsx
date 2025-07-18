import React from 'react';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import ToolActionContainer from '../ToolActionContainer';
import ToolAction from '../../components/ToolAction';
import {
  setAssignDrawerVisibility,
  exportToCds,
} from '../../../actions/literature';
import * as constants from '../../constants';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('../../../actions/literature');
jest.mock('../../components/ToolAction', () =>
  jest.fn(() => <div data-testid="tool-action">Mock ToolAction</div>)
);

mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(exportToCds);

describe('ToolActionContainer', () => {
  beforeEach(() => {
    ToolAction.mockClear();
  });

  it('passes correct props to ToolAction with single selection', () => {
    const selection = Set([1]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
    });

    renderWithProviders(<ToolActionContainer />, { store });

    expect(ToolAction).toHaveBeenCalledWith(
      expect.objectContaining({
        disabledBulkAssign: false,
        selectionSize: 1,
        onExportToCds: expect.any(Function),
        onAssignToConference: expect.any(Function),
      }),
      {}
    );
  });

  it('passes disabledBulkAssign true when selection exceeds maximum', () => {
    const selection = Set([1, 2, 3]);
    constants.MAX_BULK_ASSIGN = 2;

    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
    });

    renderWithProviders(<ToolActionContainer />, { store });

    expect(ToolAction).toHaveBeenCalledWith(
      expect.objectContaining({
        disabledBulkAssign: true,
        selectionSize: 3,
      }),
      {}
    );
  });

  it('handles onExportToCds callback correctly', () => {
    const selection = Set([1]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
    });

    renderWithProviders(<ToolActionContainer />, { store });

    const toolActionProps = ToolAction.mock.calls[0][0];

    toolActionProps.onExportToCds();

    const expectedActions = [exportToCds()];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('handles onAssignToConference callback correctly', () => {
    const selection = Set([1]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
    });

    renderWithProviders(<ToolActionContainer />, { store });

    const toolActionProps = ToolAction.mock.calls[0][0];

    toolActionProps.onAssignToConference();

    expect(setAssignDrawerVisibility).toHaveBeenCalledWith(true);
  });
});
