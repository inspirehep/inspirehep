import { fromJS } from 'immutable';

import reducer from '../ui';
import {
  UI_SET_BANNER_VISIBILITY
} from '../../actions/actionTypes';

describe('ui reducer', () => {
  it('UI_SET_BANNER_VISIBILITY', () => {
    const currentState = fromJS({
      bannerVisibility: false,
    });
    const action = { type: UI_SET_BANNER_VISIBILITY, payload: { visibility: true } };
    const state = reducer(currentState, action);
    expect(state.get('bannerVisibility')).toEqual(true);
  });
});
