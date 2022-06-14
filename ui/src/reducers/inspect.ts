import { fromJS } from 'immutable';

import {
  INSPECT_ERROR,
  INSPECT_REQUEST,
  INSPECT_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: {},
});

const inspectReducer = (state = initialState, action) => {
  switch (action.type) {
    case INSPECT_REQUEST:
      return state.set('loading', true);
    case INSPECT_SUCCESS:
      return state
        .set('loading', false)
        .set('error', fromJS({}))
        .set('data', fromJS(action.payload));
    case INSPECT_ERROR:
      return state
        .set('loading', false)
        .set('data', fromJS({}))
        .set('error', fromJS(action.payload.error));
    default:
      return state;
  }
};

export default inspectReducer;
