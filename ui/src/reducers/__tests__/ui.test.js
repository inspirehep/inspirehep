import { fromJS } from 'immutable';

import reducer from '../ui';
import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
} from '../../actions/actionTypes';

describe('ui reducer', () => {
  it('UI_CLOSE_BANNER', () => {
    const currentState = fromJS({
      closedBannersById: {},
    });
    const action = { type: UI_CLOSE_BANNER, payload: { id: 'test' } };
    const state = reducer(currentState, action);
    expect(state.getIn(['closedBannersById', 'test'])).toEqual(true);
  });

  it('UI_CHANGE_GUIDE_MODAL_VISIBILITY', () => {
    const currentState = fromJS({
      guideModalVisibility: null,
    });
    const action = {
      type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
      payload: { visibility: true },
    };
    const state = reducer(currentState, action);
    expect(state.get('guideModalVisibility')).toEqual(true);
  });
});
