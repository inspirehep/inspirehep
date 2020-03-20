import { fromJS } from 'immutable';

import reducer from '../ui';
import { UI_CLOSE_BANNER } from '../../actions/actionTypes';

describe('ui reducer', () => {
  it('UI_CLOSE_BANNER', () => {
    const currentState = fromJS({
      closedBannersById: {},
    });
    const action = { type: UI_CLOSE_BANNER, payload: { id: 'test' } };
    const state = reducer(currentState, action);
    expect(state.getIn(['closedBannersById', 'test'])).toEqual(true);
  });
});
