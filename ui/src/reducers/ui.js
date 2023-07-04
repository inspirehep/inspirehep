import { fromJS } from 'immutable';

import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
  UI_SCROLL_VIEWPORT_TO_PREVIOUS_REFERENCE
} from '../actions/actionTypes';

export const initialState = fromJS({
  closedBannersById: {},
  guideModalVisibility: null,
  excludeSelfCitations: false,
  referenceListActiveElement: null,
});

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case UI_CLOSE_BANNER:
      return state.setIn(['closedBannersById', action.payload.id], true);
    case UI_CHANGE_GUIDE_MODAL_VISIBILITY:
      return state.set('guideModalVisibility', action.payload.visibility);
    case UI_SCROLL_VIEWPORT_TO_PREVIOUS_REFERENCE:
      return state.set('referenceListActiveElement', action.payload.element);
    default:
      return state;
  }
};

export default uiReducer;
