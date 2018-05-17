import { fromJS } from 'immutable';

import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: {},
});

const literatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case LITERATURE_REQUEST:
      return state.set('loading', true);
    case LITERATURE_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload));
    case LITERATURE_ERROR:
      return state
        .set('loading', false)
        .set('data', fromJS({}))
        .set('error', fromJS(action.payload));
    default:
      return state;
  }
};

export default literatureReducer;
