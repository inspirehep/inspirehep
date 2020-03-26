import { fromJS } from 'immutable';

import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
} from '../actions/actionTypes';

export const initialState = fromJS({
  closedBannersById: {},
  guideModalVisibility: null,
});

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case UI_CLOSE_BANNER:
      return state.setIn(['closedBannersById', action.payload.id], true);
    case UI_CHANGE_GUIDE_MODAL_VISIBILITY:
      return state.set('guideModalVisibility', action.payload.visibility);
    default:
      return state;
  }
};

export default uiReducer;
