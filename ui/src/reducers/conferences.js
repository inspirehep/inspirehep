import { fromJS } from 'immutable';
import {
  CONFERENCE_ERROR,
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
  CLEAR_STATE,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

const conferencesReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case CONFERENCE_REQUEST:
      return state.set('loading', true);
    case CONFERENCE_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'));
    case CONFERENCE_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload.error))
        .set('data', initialState.get('data'));
    default:
      return state;
  }
};

export default conferencesReducer;
