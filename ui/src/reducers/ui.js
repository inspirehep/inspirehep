import { fromJS } from 'immutable';

import { UI_CLOSE_BANNER } from '../actions/actionTypes';

export const initialState = fromJS({
  closedBannersById: {},
});

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case UI_CLOSE_BANNER:
      return state.setIn(['closedBannersById', action.payload.id], true);
    default:
      return state;
  }
};

export default uiReducer;
