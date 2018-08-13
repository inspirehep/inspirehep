import { fromJS } from 'immutable';

import { SUBMIT_ERROR, SUBMIT_SUCCESS } from '../actions/actionTypes';

export const initialState = fromJS({
  error: null,
});

const submissionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBMIT_SUCCESS:
      return state.set('error', null);
    case SUBMIT_ERROR:
      return state.set('error', fromJS(action.payload));
    default:
      return state;
  }
};

export default submissionsReducer;
