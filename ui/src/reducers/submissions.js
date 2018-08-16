import { fromJS } from 'immutable';

import {
  AUTHOR_SUBMIT_ERROR,
  AUTHOR_SUBMIT_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  author: {
    submitError: null,
  },
});

export const authorSubmitErrorPath = ['author', 'submitError'];

const submissionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTHOR_SUBMIT_SUCCESS:
      return state.setIn(
        authorSubmitErrorPath,
        initialState.getIn(authorSubmitErrorPath)
      );
    case AUTHOR_SUBMIT_ERROR:
      return state.setIn(authorSubmitErrorPath, fromJS(action.payload));
    default:
      return state;
  }
};

export default submissionsReducer;
