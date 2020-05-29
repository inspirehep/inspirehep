import { fromJS } from 'immutable';
import {
  CLEAR_STATE,
  EXPERIMENT_REQUEST,
  EXPERIMENT_SUCCESS,
  EXPERIMENT_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

const experimentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case EXPERIMENT_REQUEST:
      return state.set('loading', true);
    case EXPERIMENT_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'));
    case EXPERIMENT_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload.error))
        .set('data', initialState.get('data'));
    default:
      return state;
  }
};

export default experimentsReducer;
