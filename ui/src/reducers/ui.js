import { fromJS } from 'immutable';

import {
  UI_SET_BANNER_VISIBILITY
} from '../actions/actionTypes';

export const initialState = fromJS({
  bannerVisibility: true,
});

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case UI_SET_BANNER_VISIBILITY:
      return state.set('bannerVisibility', action.payload.visibility)
    default:
      return state;
  }
};

export default uiReducer;
