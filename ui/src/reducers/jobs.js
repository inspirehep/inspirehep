import { fromJS } from 'immutable';
import {
  JOB_ERROR,
  JOB_REQUEST,
  JOB_SUCCESS,
  CLEAR_STATE,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

const jobsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case JOB_REQUEST:
      return state.set('loading', true);
    case JOB_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'));
    case JOB_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload.error))
        .set('data', initialState.get('data'));
    default:
      return state;
  }
};

export default jobsReducer;
