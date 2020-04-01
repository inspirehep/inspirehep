import { fromJS } from 'immutable';
import {
  CLEAR_STATE,
  INSTITUTION_REQUEST,
  INSTITUTION_SUCCESS,
  INSTITUTION_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

const institutionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case INSTITUTION_REQUEST:
      return state.set('loading', true);
    case INSTITUTION_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'));
    case INSTITUTION_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload.error))
        .set('data', initialState.get('data'));
    default:
      return state;
  }
};

export default institutionsReducer;
