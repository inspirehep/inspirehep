import { fromJS } from 'immutable';
import {
  CLEAR_STATE,
  SEMINAR_REQUEST,
  SEMINAR_ERROR,
  SEMINAR_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

const seminarsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case SEMINAR_REQUEST:
      return state.set('loading', true);
    case SEMINAR_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'));
    case SEMINAR_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload.error))
        .set('data', initialState.get('data'));
    default:
      return state;
  }
};

export default seminarsReducer;
