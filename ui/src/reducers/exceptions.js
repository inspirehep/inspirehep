import { fromJS } from 'immutable';

import {
  EXCEPTIONS_ERROR,
  EXCEPTIONS_REQUEST,
  EXCEPTIONS_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: [],
  error: {},
});

const exceptionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case EXCEPTIONS_REQUEST:
      return state.set('loading', true);
    case EXCEPTIONS_SUCCESS:
      return state
        .set('loading', false)
        .set('error', fromJS({}))
        .set('data', fromJS(action.payload.data));
    case EXCEPTIONS_ERROR:
      return state
        .set('loading', false)
        .set('data', fromJS([]))
        .set('error', fromJS(action.payload));
    default:
      return state;
  }
};

export default exceptionsReducer;
