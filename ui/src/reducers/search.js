import { Map, fromJS } from 'immutable';
import * as types from '../actions/actionTypes';

const initialState = Map({
  searching: false,
});

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SEARCHING:
      return state.set('searching', true);
    case types.SEARCH_SUCCESS:
      return state
        .set('searching', false)
        .set('results', fromJS(action.payload));
    case types.SEARCH_ERROR:
      return state
        .set('searching', false)
        .set('error', fromJS(action.payload));
    default:
      return state;
  }
};

export default searchReducer;
